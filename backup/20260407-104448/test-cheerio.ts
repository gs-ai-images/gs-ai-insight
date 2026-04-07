import * as cheerio from 'cheerio';

async function test() {
    const url = "https://www.aitimes.com/news/articleView.html?idxno=208730";
    const req = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await req.text();
    const $ = cheerio.load(html);
    
    // Original way
    let body1 = $('#article-view-content-div').text();
    console.log("Original body length:", body1.length);
    console.log("Original Body Snippet:", body1.slice(0, 500));

    // Improved way
    $('#article-view-content-div script').remove(); 
    $('#article-view-content-div style').remove(); 
    let body2 = $('#article-view-content-div').text().replace(/\s+/g, ' ').trim();
    console.log("\nClean body length:", body2.length);
    console.log("Clean Body Snippet:", body2.slice(0, 500));
}

test();
