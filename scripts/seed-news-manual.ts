import { PrismaClient } from '@prisma/client';
import { initialNewsPosts } from '../app/news/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Upserting admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gs-ai.com' },
    update: {},
    create: {
      id: '1',
      name: 'Admin User',
      email: 'admin@gs-ai.com',
      role: 'ADMIN'
    }
  });

  console.log('Clearing existing news posts...');
  await prisma.post.deleteMany({ where: { category: 'news' } });

  console.log('Inserting 10 new articles...');
  const toInsert = initialNewsPosts.map(p => ({
    title: p.title,
    summary: p.summary,
    content: p.content,
    imageUrl: p.imgSrc,
    sourceUrl: p.sourceUrl,
    sourceName: p.sourceName,
    tag: p.tag,
    timeLabel: p.timeLabel,
    category: 'news',
    authorId: admin.id
  }));

  await prisma.post.createMany({ data: toInsert });
  console.log('10 News items seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
