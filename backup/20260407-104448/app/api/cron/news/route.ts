import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Next.js config: Vercel Cron 등 최대 60초(또는 그 이상) 실행 보장 필요 시
export const maxDuration = 300; 

// Init Gemini
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
      if (articles.length >= 5) break; // 상위 5개만

      let href = $(el).attr('href') || '';
      let link = href.startsWith('http') ? href : 'https://www.aitimes.com' + (href.startsWith('/') ? '' : '/') + href;
      
      // 중복 방지 (목록과 썸네일 링크가 다를 수 있음)
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

      // 본문이 너무 짧은 경우 (포토/비디오 전용 뉴스) 필터링
      if (body.length < 100) {
        continue;
      }

      articles.push({ title, link, body, img, date, sourceName: 'AITimes' });
    }

    return articles;
  } catch (e) {
    console.error("Scraping Error:", e);
    return [];
  }
}

// Helper: Gemini API로 요약 텍스트 생성
async function summarizeWithGemini(content: string, sourceName: string, retries = 2): Promise<{ title: string; summary: string; content: string; tags: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using 2.5 Flash as standard robust model
    
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
      // Wait 12 seconds with exponential backoff feel
      await new Promise(r => setTimeout(r, 12000));
      return summarizeWithGemini(content, sourceName, retries - 1);
    }
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawArticles = await scrapeAITimesLatest();
    
    const keywords = ["GS", "GS리테일", "GS홈쇼핑"];
    for (const keyword of keywords) {
      const naverNews = await scrapeNaverNews(keyword);
      if (naverNews) {
        rawArticles.push(naverNews);
      }
    }

    const results = [];

    for (const article of rawArticles) {
      try {
        // 이미 DB에 있는지 (sourceUrl 기반 체크)
        // Note: Production에서는 DB 세션 체크 로직이 필요할 수 있습니다
        const existing = await prisma.post.findFirst({
          where: { sourceUrl: article.link }
        });

        if (existing) {
          results.push({ source: article.sourceName, status: 'skipped', reason: 'already exists' });
          continue;
        }

        // Gemini 요약 시작
        const geminiOutput = await summarizeWithGemini(article.body, article.sourceName);

        // 슈퍼 관리자 아이디 동적으로 가져오기
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

        // DB 저장
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
            authorId: systemAdmin.id // 유효한 관리자 아이디 적용
          }
        });

        results.push({ source: article.sourceName, status: 'success', title: newPost.title });
        
        // Rate limit 방지를 위해 요청간 6초 대기
        await new Promise(r => setTimeout(r, 6000));
      } catch (e: any) {
        console.error(`Error processing article ${article.title}:`, e);
        results.push({ source: article.sourceName, status: 'error', reason: e.message });
      }
    }

    return NextResponse.json({ message: 'Cron job completed. Processed Top 5 AITimes + 3 GS news.', details: results });
  } catch (error: any) {
    console.error("Cron Execution Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
