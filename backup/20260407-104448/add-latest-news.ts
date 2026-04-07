import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper: Naver News Scraping
async function scrapeNaverNews(keyword: string) {
  try {
    const searchUrl = 'https://search.naver.com/search.naver?where=news&query=' + encodeURIComponent(keyword);
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const searchText = await searchRes.text();
    let $ = cheerio.load(searchText);
    
    let firstNaverNewsLink = '';
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('n.news.naver.com') && !firstNaverNewsLink) {
            firstNaverNewsLink = href;
        }
    });

    if (!firstNaverNewsLink) return null;

    const artRes = await fetch(firstNaverNewsLink, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const artHtml = await artRes.text();
    const $2 = cheerio.load(artHtml);
    
    const title = $2('h2#title_area').text().trim();
    if (!title) return null;
    
    const date = $2('span.media_end_head_info_datestamp_time').first().attr('data-date-time') || new Date().toISOString();
    const img = $2('#img1').attr('data-src') || $2('meta[property="og:image"]').attr('content') || '';
    
    $2('#dic_area script').remove();
    $2('#dic_area style').remove();
    let body = $2('#dic_area').text().replace(/\s+/g, ' ').trim().slice(0, 3000);

    if (body.length < 50) return null;

    return { title, link: firstNaverNewsLink, body, img, date, sourceName: `Naver News (${keyword})` };
  } catch (e) {
    console.error(`Error scraping naver news for ${keyword}:`, e);
    return null;
  }
}

// Helper: AITimes 사이트 크롤러
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
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (err) {
    if (retries > 0) {
      console.log(`Gemini rate limit or error, retrying in 12s... (${retries} left)`);
      await new Promise(r => setTimeout(r, 12000));
      return summarizeWithGemini(content, sourceName, retries - 1);
    }
    throw err;
  }
}

async function main() {
  console.log("Starting manual news upload...");
  
  if (!process.env.GEMINI_API_KEY) {
      console.error("No API key configured for Gemini.");
      return;
  }
  
  // ensure admin user exists first
  let systemAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!systemAdmin) {
    systemAdmin = await prisma.user.create({
      data: { name: 'System Admin', email: 'system-admin@gs-ai.com', role: 'ADMIN' }
    });
  }

  let rawArticles = await scrapeAITimesLatest();
  const keywords = ["GS", "GS리테일", "GS홈쇼핑"];
  for (const keyword of keywords) {
    const naverNews = await scrapeNaverNews(keyword);
    if (naverNews) rawArticles.push(naverNews);
  }
  
  console.log(`Found ${rawArticles.length} articles to process.`);

  const results = [];
  for (const article of rawArticles) {
    try {
      const existing = await prisma.post.findFirst({ where: { sourceUrl: article.link } });
      if (existing) {
        console.log(`Skipped (already exists): ${article.title}`);
        results.push({ source: article.sourceName, status: 'skipped' });
        continue;
      }

      console.log(`Summarizing with Gemini: ${article.title}`);
      const geminiOutput = await summarizeWithGemini(article.body, article.sourceName);

      const newPost = await prisma.post.create({
        data: {
          title: geminiOutput.title || article.title,
          content: geminiOutput.content,
          category: 'news',
          imageUrl: article.img,
          sourceUrl: article.link,
          summary: Array.isArray(geminiOutput.summary) ? geminiOutput.summary.join('\n') : geminiOutput.summary,
          sourceName: article.sourceName,
          tag: Array.isArray(geminiOutput.tags) ? geminiOutput.tags.join(', ') : geminiOutput.tags,
          authorId: systemAdmin.id
        }
      });
      console.log(`Successfully added: ${newPost.title}`);
      results.push({ source: article.sourceName, status: 'success', title: newPost.title });
      
      await new Promise(r => setTimeout(r, 6000));
    } catch (e: any) {
      console.error(`Error processing article ${article.title}:`, e);
      results.push({ source: article.sourceName, status: 'error', reason: e.message });
    }
  }

  console.log("Done. Results:", results);
}

main();
