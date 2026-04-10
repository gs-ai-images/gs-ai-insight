import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, imageUrl: true } });
  let updatedCount = 0;
  
  for (const post of posts) {
    if (!post.imageUrl) continue;
    
    const url = post.imageUrl;
    
    if (url.includes('.webp') && url.startsWith('http') && !url.includes('.supabase.co')) {
      const jpgUrl = url.replace(/\.webp$/i, '.jpg');
      const pngUrl = url.replace(/\.webp$/i, '.png');
      const jpegUrl = url.replace(/\.webp$/i, '.jpeg');
      
      console.log(`Checking broken URL: ${url}`);
      
      try {
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
        
        let res = await fetch(jpgUrl, { method: 'HEAD', headers });
        if (res.ok) {
           await prisma.post.update({ where: { id: post.id }, data: { imageUrl: jpgUrl } });
           updatedCount++;
           console.log(`Restored to: ${jpgUrl}`);
           continue;
        }
        
        res = await fetch(pngUrl, { method: 'HEAD', headers });
        if (res.ok) {
           await prisma.post.update({ where: { id: post.id }, data: { imageUrl: pngUrl } });
           updatedCount++;
           console.log(`Restored to: ${pngUrl}`);
           continue;
        }

        res = await fetch(jpegUrl, { method: 'HEAD', headers });
        if (res.ok) {
           await prisma.post.update({ where: { id: post.id }, data: { imageUrl: jpegUrl } });
           updatedCount++;
           console.log(`Restored to: ${jpegUrl}`);
           continue;
        }
        
        // If HEAD fails maybe it restricts HEAD. Fallback to GET just headers
        res = await fetch(jpgUrl, { method: 'GET', headers });
        if (res.ok) {
           await prisma.post.update({ where: { id: post.id }, data: { imageUrl: jpgUrl } });
           updatedCount++;
           console.log(`Restored to: ${jpgUrl} (via GET)`);
           continue;
        }
        
        console.log(`Could not find a valid replacement for ${url}`);
      } catch (err) {
        console.error(`Fetch error for ${url}:`, err);
      }
    }
  }
  
  console.log(`Fixed ${updatedCount} external image URLs back to orginal formats.`);
}

main().finally(() => prisma.$disconnect());
