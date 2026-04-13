import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const deleted1 = await prisma.post.deleteMany({
    where: { imageUrl: { contains: 'googleusercontent' } }
  });
  console.log('Deleted Google News posts:', deleted1.count);

  const deleted2 = await prisma.post.deleteMany({
    where: { sourceName: { in: ['The Guardian', 'Google Blog', 'SciTechDaily', 'CBS News', 'Crypto Briefing', 'MarketingProfs', 'Linux Foundation', 'Switas', 'ScienceDaily', '세명일보', '아주경제', '경인신문', '경북신문', '이웃소상타임스'] } }
  });
  console.log('Deleted some dummy news posts:', deleted2.count);
}
clean().finally(() => prisma.$disconnect());
