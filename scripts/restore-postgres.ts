import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Restoring data to PostgreSQL...');
  
  const dumpPath = path.join(process.cwd(), 'db_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error('db_dump.json not found!');
    return;
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
  
  console.log(`Found ${dump.users?.length || 0} users, ${dump.posts?.length || 0} posts, ${dump.bookmarks?.length || 0} bookmarks.`);

  // 1. Restore Users
  if (dump.users) {
    for (const user of dump.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user
      });
    }
    console.log('Users restored.');
  }

  // 2. Restore Posts
  if (dump.posts) {
    for (const post of dump.posts) {
      try {
        await prisma.post.upsert({
          where: { id: post.id },
          update: {},
          create: post
        });
      } catch (e) {
        console.warn(`Could not restore post ${post.id}:`, e);
      }
    }
    console.log('Posts restored.');
  }

  // 3. Restore Bookmarks
  if (dump.bookmarks) {
    for (const bookmark of dump.bookmarks) {
      try {
        await prisma.bookmark.upsert({
          where: { id: bookmark.id },
          update: {},
          create: bookmark
        });
      } catch (e) {
        console.warn(`Could not restore bookmark ${bookmark.id}:`, e);
      }
    }
    console.log('Bookmarks restored.');
  }
  
  console.log('Data restore complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
