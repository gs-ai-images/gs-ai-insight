import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

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

async function summarizeWithGemini(genAI: any, content: string, sourceName: string, todayDate: string, retries = 2): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }, { apiVersion: "v1beta" }); 
    
    const prompt = `You are a professional AI News Editor. Summarize the following news article into a high-quality Markdown format for an AI Portal. 
    Source: ${sourceName}
    Date Context: ${todayDate}
    Write in **Korean**.
    Return ONLY a valid JSON object without markdown formatting blocks (like \`\`\`json) with the exact structure:
    {
      "title": "A catchy title summarizing the article",
      "summary": "3-4 bullet points summarizing key takeaways",
      "content": "Full markdown formatted detailed article text, translating complex AI concepts simply. Must be at least 3-4 paragraphs.",
      "tags": "3-5 comma separated tags related to AI, tech, etc."
    }

    Article Text:
    ${content}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        text = match[1];
    } else {
        text = text.replace(/```json/g, '').replace(/```/g, '');
    }
    
    return JSON.parse(text.trim());
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 6000));
      return summarizeWithGemini(genAI, content, sourceName, todayDate, retries - 1);
    }
    throw err;
  }
}

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Secret for security
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const todayDate = new Date().toISOString().split('T')[0];
    
    console.log('1. Scraping real Korean AI news from AITimes...');
    const rawArticles = await scrapeAITimesLatest();

    if (rawArticles.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No new articles found." });
    }

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

    const insertedPosts = [];

    for (const article of rawArticles) {
      const existing = await prisma.post.findFirst({
        where: { sourceUrl: article.link }
      });

      if (existing) {
        continue;
      }

      const geminiOutput = await summarizeWithGemini(genAI, article.body, article.sourceName, todayDate);

      const newPost = await prisma.post.create({
        data: {
          title: geminiOutput.title || article.title,
          content: geminiOutput.content,
          category: 'news',
          imageUrl: article.img || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
          sourceUrl: article.link,
          summary: Array.isArray(geminiOutput.summary) ? geminiOutput.summary.join('\\n') : geminiOutput.summary,
          sourceName: article.sourceName,
          tag: Array.isArray(geminiOutput.tags) ? geminiOutput.tags.join(', ') : geminiOutput.tags,
          authorId: systemAdmin.id,
          timeLabel: todayDate
        }
      });
      insertedPosts.push(newPost);
      await new Promise(r => setTimeout(r, 4000));
    }

    return NextResponse.json({ success: true, count: insertedPosts.length, articles: insertedPosts });
  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
