import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Secret for security
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  
  // NOTE: For testing purposes, we allow GET. In production, uncomment above.
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel(
      { model: "gemini-3.1-flash-lite-preview" },
      { apiVersion: "v1beta" }
    );
    const parser = new Parser();

    // 2. Fetch Latest RSS for AI and GS Retail (strictly 1~2 days)
    const rssFeeds = [
      'https://news.google.com/rss/search?q="인공지능"+OR+"LLM"+OR+"제미나이"+OR+"챗GPT"+when:1d&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q="GS리테일"+OR+"GS홈쇼핑"+when:3d&hl=ko&gl=KR&ceid=KR:ko'
    ];

    let combinedItems: any[] = [];
    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(encodeURI(feedUrl));
      // Get top 3 from each to limit scraping time
      combinedItems = combinedItems.concat(feed.items.slice(0, 3));
    }

    const todayDate = new Date().toISOString().split('T')[0];
    
    // Scrape real article content
    let compiledText = '';
    const scrapedImages: Record<string, string> = {};

    for (let i = 0; i < combinedItems.length; i++) {
        const item = combinedItems[i];
        let fullText = item.contentSnippet || item.snippet || '';
        let targetUrl = item.link;

        // Decode Google News base64 URL
        const parts = item.link.split('/articles/');
        if (parts.length > 1) {
            const encoded = parts[1].split('?')[0];
            if (encoded.startsWith('CBMi')) {
                try {
                    const decoded = Buffer.from(encoded.substring(4), 'base64').toString('utf8');
                    const match = decoded.match(/(https?:\/\/[a-zA-Z0-9\-.\/?&_=]+)/);
                    if (match && match[1]) {
                        targetUrl = match[1];
                    }
                } catch (e) {
                    console.error("Base64 decode failed", e);
                }
            }
        }

        try {
            const res = await fetch(targetUrl, { 
                redirect: 'follow', 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } 
            });
            if (res.ok) {
                const html = await res.text();
                const $ = cheerio.load(html);
                
                // Extract OpenGraph image
                const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
                if (ogImage) {
                    scrapedImages[item.link] = ogImage.trim(); // store using item.link because Gemini outputs item.link as sourceUrl
                }

                $('script, style, nav, header, footer, iframe, noscript, aside').remove();
                const pText = $('p').text();
                if (pText && pText.length > 50) {
                    fullText = pText.substring(0, 2000).replace(/\s+/g, ' '); 
                }
            }
        } catch (e) {
            console.error("Scraping failed for", targetUrl);
        }
        compiledText += `[기사 ${i + 1}]\n제목: ${item.title}\n발행일: ${item.pubDate}\n원본 링크: ${item.link}\n실제 확보된 기사 원본 텍스트: ${fullText}\n\n`;
    }

    // 3. Ask Gemini to Analyze exactly based on RSS
    const prompt = `
      현재 날짜는 ${todayDate} 입니다.
      다음은 오늘 인터넷에서 웹스크래핑을 통해 웹페이지 내용(전체 본문 타겟)까지 수집한 AI 및 유통 관련 실제 최신 뉴스 데이터입니다.
      이 중 정보 가치가 높은 기사 5개를 골라 풍부하고 상세한 긴 뉴스 리스트를 작성해 주세요.
      
      [가장 중요한 필수 조건 - 절대로 지켜야 함]
      1. 절대로 없는 내용을 지어내지(Hallucination) 마세요. 단, 제가 제공한 [실제 확보된 기사 원본 텍스트]를 꼼꼼히 읽고 그 안에 있는 내용들은 최대한 길고 상세하게 모두 살려서 3~4단락의 긴 글로 풍부하게 작성해야 합니다. 너무 짧게 줄이지 마세요.
      2. 옛날 뉴스 내용은 피하고, 최신 날짜(${todayDate}) 기준으로 최신 기사인 것들을 우선으로 뽑으세요.
      3. 기사 원본을 그대로 가져오는 수준으로 구체적인 팩트(수치, 기업명, 발표내용)를 포함해 작성하세요.
      4. 출력 포맷은 반드시 백틱 구문 없는 **순수 JSON 배열**이어야 합니다.
      
      [JSON 객체 속성 정의]
      - title: 기사의 실제 원본 제목
      - summary: 기사의 한 줄 핵심 요약
      - content: 웹스크래핑된 실제 확보된 기사 원본 텍스트를 바탕으로 작성할 것. 내용이 있다면 3~4문단 이상의 길이로 구체적이고 디테일하게 작성할 것! 원본 내용의 풍부함을 그대로 살려주세요.
      - sourceUrl: 기사의 실제 원본 링크
      - sourceName: 출처 (title에서 보이거나 파악 가능한 언론사 이름 등)
      - tag: 'Hot Issue', 'Model Update', 'Domestic' 등 어울리는 태그
      - timeLabel: 기사가 등록된 실제 날짜 (YYYY-MM-DD 형식, 반드시 ${todayDate} 내외의 최신 날짜)
      
      [뉴스 데이터 모음]
      ${compiledText}
    `;

    const result = await model.generateContent(prompt);
    let jsonString = result.response.text() || "[]";
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedArticles = JSON.parse(jsonString);

    if (!Array.isArray(parsedArticles) || parsedArticles.length === 0) {
      throw new Error("Failed to parse articles from Gemini.");
    }

    // 4. Save to Database using Prisma
    // Find the Admin user
    const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!adminUser) {
        throw new Error("Admin user not found in DB.");
    }

    const fallbackImages = [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1673898144342-999333333333?auto=format&fit=crop&q=80&w=1200', 
    ];

    const postsToInsert = parsedArticles.map((p: any, index: number) => {
      // Find matching scraped image or use a valid generated fallback
      const foundImage = scrapedImages[p.sourceUrl];
      const decidedImage = foundImage || fallbackImages[index % fallbackImages.length];

      return {
        title: p.title,
        summary: p.summary,
        content: p.content,
        imageUrl: decidedImage,
        sourceUrl: p.sourceUrl,
        sourceName: p.sourceName,
        tag: p.tag,
        timeLabel: p.timeLabel,
        category: 'news',
        authorId: adminUser.id
      };
    });

    await prisma.post.createMany({
      data: postsToInsert
    });

    return NextResponse.json({ success: true, count: postsToInsert.length, articles: postsToInsert });
  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
