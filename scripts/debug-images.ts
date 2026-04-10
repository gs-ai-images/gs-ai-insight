import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, imageUrl: true } });
  for (const p of posts) {
    if (p.imageUrl) console.log(`Post ID: ${p.id} -> ${p.imageUrl}`);
  }
}

main().finally(() => prisma.$disconnect());
