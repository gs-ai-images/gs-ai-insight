const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { title: true, category: true, subCategory: true, sourceName: true }
  });
  console.log(JSON.stringify(posts, null, 2));
}

main().finally(() => prisma.$disconnect());
