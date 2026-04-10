import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ 
    where: { category: 'news' },
    select: { id: true, imageUrl: true, sourceUrl: true } 
  });
  
  let updatedCount = 0;
  
  for (const post of posts) {
    if (!post.imageUrl || !post.sourceUrl) continue;
    
    // Check if the current image is broken or we want to ensure it's exact from source
    // We'll res-crape all news from aitimes resolving 404s
    const isEx = post.imageUrl.startsWith('http') && !post.imageUrl.includes('.supabase.co');
    
    if (isEx) {
      console.log(`Checking via source: ${post.sourceUrl}`);
      try {
        const res = await fetch(post.sourceUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
        });
        
        if (!res.ok) continue;

        const html = await res.text();
        const $ = cheerio.load(html);
        
        // Grab og:image
        let ogImg = $('meta[property="og:image"]').attr('content');
        
        // AITimes specific fallback
        if (!ogImg) {
            ogImg = $('.news-view-photo figure img').attr('src');
        }
        
        // Naver fallback
        if (!ogImg) {
            ogImg = $('#img1').attr('data-src');
        }
        
        if (ogImg && ogImg !== post.imageUrl) {
            console.log(`Mismatch/Broken! Found original image: ${ogImg}`);
            await prisma.post.update({
                where: { id: post.id },
                data: { imageUrl: ogImg }
            });
            updatedCount++;
        } else {
            console.log(`Image matches or unchanged: ${ogImg}`);
        }
      } catch (err) {
        console.error(`Failed to scrape ${post.sourceUrl}:`, err);
      }
    }
  }
  
  console.log(`Fixed ${updatedCount} broken images by re-scraping original source.`);
}

main().finally(() => prisma.$disconnect());
