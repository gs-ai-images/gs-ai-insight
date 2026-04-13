import * as cheerio from 'cheerio';
async function test() {
  const res = await fetch('https://news.google.com/rss/articles/CBMiVEFVX3lxTE1GYVZQRUdlNGVuYVVzRUt6dmpNcGFndEtkQ19hZGJSU3pCZGJEbmNCTHNfWV9CV2hjRmhCQ1Z0bXdOUnNwNklGRktnYXBCTDYzZlRTeQ?oc=5');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const refresh = $('meta[http-equiv="refresh"]').attr('content');
  if (refresh) {
      const urlMatch = refresh.match(/URL='([^']+)'/i) || refresh.match(/URL="([^"]+)"/i) || refresh.match(/URL=([^;]+)/i);
      console.log('Redirecting to:', urlMatch?.[1]);
  } else {
      console.log($('a').attr('href') || html.substring(0, 300));
  }
}
test();
