import * as cheerio from 'cheerio';

async function scrapeNaverNews(keyword: string) {
  try {
    const searchUrl = 'https://search.naver.com/search.naver?where=news&query=' + encodeURIComponent(keyword);
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
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

    const artRes = await fetch(firstNaverNewsLink, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
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

    return { title, link: firstNaverNewsLink, body: body.slice(0, 100), img, date, sourceName: `Naver News (${keyword})` };
  } catch (e) {
    console.error(`Error scraping naver news for ${keyword}:`, e);
    return null;
  }
}

async function scrapeAITimesLatest() {
  try {
    const res = await fetch('https://www.aitimes.com/news/articleList.html?sc_section_code=S1N1&view_type=sm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const articles: any[] = [];
    const elements = $('a[href*="/news/articleView.html"]').toArray();

    for (let el of elements) {
      if (articles.length >= 2) break; // 상위 2개만 (테스트용)

      let href = $(el).attr('href') || '';
      let link = href.startsWith('http') ? href : 'https://www.aitimes.com' + (href.startsWith('/') ? '' : '/') + href;
      
      if (articles.some(a => a.link === link)) continue;

      const articleRes = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      const articleHtml = await articleRes.text();
      const $2 = cheerio.load(articleHtml);

      const title = $2('.heading').text().trim() || $2('title').text().trim();
      const date = $2('li.info-date').text().replace('승인', '').trim() || new Date().toISOString();
      const img = $2('meta[property="og:image"]').attr('content') || $2('.news-view-photo figure img').attr('src') || '';
      
      $2('#article-view-content-div script').remove();
      $2('#article-view-content-div style').remove();
      let body = $2('#article-view-content-div').text().replace(/\s+/g, ' ').trim().slice(0, 4000);

      if (body.length < 100) continue;

      articles.push({ title, link, body: body.slice(0, 100), img, date, sourceName: 'AITimes' });
    }

    return articles;
  } catch (e) {
    console.error("Scraping Error:", e);
    return [];
  }
}

async function main() {
  console.log('Testing AITimes...');
  const aitimes = await scrapeAITimesLatest();
  console.log('AITimes Results:', aitimes);
  
  console.log('Testing Naver...');
  const naver = await scrapeNaverNews('GS리테일');
  console.log('Naver Result:', naver);
}

main();
