import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const urlsToDelete = [
  "https://switas.com",
  "https://marketingprofs.com",
  "https://linuxfoundation.org",
  "https://sciencedaily.com"
];

async function scrapeAITimesLatest() {
  try {
    const res = await fetch('https://www.aitimes.com/news/articleList.html?sc_section_code=S1N1&view_type=sm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const articles: any[] = [];
    const elements = $('a[href*="/news/articleView.html"]').toArray();

    for (let el of elements) {
      if (articles.length >= 5) break;

      let href = $(el).attr('href') || '';
      let link = href.startsWith('http') ? href : 'https://www.aitimes.com' + (href.startsWith('/') ? '' : '/') + href;
      
      if (articles.some(a => a.link === link)) continue;

      const articleRes = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const articleHtml = await articleRes.text();
      const $2 = cheerio.load(articleHtml);

      const title = $2('.heading').text().trim() || $2('title').text().trim();
      const date = $2('li.info-date').text().replace('승인', '').trim() || new Date().toISOString();
      const img = $2('meta[property="og:image"]').attr('content') || $2('.news-view-photo figure img').attr('src') || '';
      
      $2('#article-view-content-div script').remove();
      $2('#article-view-content-div style').remove();
      let body = $2('#article-view-content-div').text().replace(/\s+/g, ' ').trim().slice(0, 4000);

      if (body.length < 100) continue;

      articles.push({ title, link, body, img, date, sourceName: 'AITimes' });
    }

    return articles;
  } catch (e) {
    console.error("Scraping Error:", e);
    return [];
  }
}

async function summarizeWithGemini(content: string, sourceName: string, retries = 2): Promise<{ title: string; summary: string; content: string; tags: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    
    const prompt = `You are a professional AI News Editor. Summarize the following news article into a high-quality Markdown format for an AI Portal. 
    Source: ${sourceName}
    Write in **Korean**.
    Return ONLY a valid JSON object without markdown formatting blocks (like \`\`\`json) with the exact structure:
    {
      "title": "A catchy title summarizing the article",
      "summary": "3-4 bullet points summarizing key takeaways",
      "content": "Full markdown formatted detailed article text, translating complex AI concepts simply",
      "tags": "3-5 comma separated tags related to AI, tech, etc."
    }

    Article Text:
    ${content}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // remove markdown codeblocks if any
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        text = match[1];
    } else {
        text = text.replace(/```json/g, '').replace(/```/g, '');
    }
    
    return JSON.parse(text.trim());
  } catch (err) {
    if (retries > 0) {
      console.log(`Gemini error, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 6000));
      return summarizeWithGemini(content, sourceName, retries - 1);
    }
    throw err;
  }
}

async function main() {
  console.log('1. Deleting placeholder English posts...');
  const deleted = await prisma.post.deleteMany({
    where: {
      sourceUrl: { in: urlsToDelete }
    }
  });
  console.log(`Deleted ${deleted.count} placeholder posts.`);

  let systemAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (!systemAdmin) {
    systemAdmin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'system-admin@gs-ai.com',
        role: 'ADMIN'
      }
    });
  }

  console.log('2. Scraping real Korean AI news from AITimes...');
  const rawArticles = await scrapeAITimesLatest();
  console.log(`Found ${rawArticles.length} recent articles.`);

  for (const article of rawArticles) {
    try {
      const existing = await prisma.post.findFirst({
        where: { sourceUrl: article.link }
      });

      if (existing) {
        console.log(`Already exists, skipping: ${article.title}`);
        continue;
      }

      console.log(`Summarizing: ${article.title}...`);
      const geminiOutput = await summarizeWithGemini(article.body, article.sourceName);

      await prisma.post.create({
        data: {
          title: geminiOutput.title || article.title,
          content: geminiOutput.content,
          category: 'news',
          imageUrl: article.img,
          sourceUrl: article.link,
          summary: Array.isArray(geminiOutput.summary) ? geminiOutput.summary.join('\n') : geminiOutput.summary,
          sourceName: article.sourceName,
          tag: Array.isArray(geminiOutput.tags) ? geminiOutput.tags.join(', ') : geminiOutput.tags,
          authorId: systemAdmin.id,
          timeLabel: '최근 업데이트'
        }
      });
      console.log(`-> Successfully inserted into DB.`);

      await new Promise(r => setTimeout(r, 4000));
    } catch (e: any) {
      console.error(`Error processing article ${article.title}:`, e.message);
    }
  }

  console.log('Finished updating news.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
