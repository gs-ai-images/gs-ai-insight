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
      
      console.log(`Fallback updating broken URL: ${url} to .jpg`);
      await prisma.post.update({ where: { id: post.id }, data: { imageUrl: jpgUrl } });
      updatedCount++;
    }
  }
  
  console.log(`Fallback fixed ${updatedCount} external image URLs to .jpg.`);
}

main().finally(() => prisma.$disconnect());
