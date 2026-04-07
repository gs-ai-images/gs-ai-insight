import * as cheerio from 'cheerio';

async function testDOM() {
    const searchUrl = 'https://search.naver.com/search.naver?where=news&query=' + encodeURIComponent("GS리테일");
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    const searchText = await searchRes.text();
    const $ = cheerio.load(searchText);
    
    // Naver News "네이버뉴스" link is usually in span.info or a.info.
    // Let's print all links containing 'n.news.naver.com'
    const naverNewsLinks: string[] = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('n.news.naver.com')) {
            naverNewsLinks.push(href);
        }
    });
    
    console.log("Found links:", naverNewsLinks);
}
testDOM();
