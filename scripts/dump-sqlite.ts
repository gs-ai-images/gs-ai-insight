import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function dumpDatabase() {
  try {
    console.log("Reading data from SQLite...");
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    const bookmarks = await prisma.bookmark.findMany();

    const dump = {
      users,
      posts,
      bookmarks
    };

    fs.writeFileSync('db_dump.json', JSON.stringify(dump, null, 2));
    console.log(`Successfully dumped ${users.length} users, ${posts.length} posts, and ${bookmarks.length} bookmarks to db_dump.json.`);
  } catch (error) {
    console.error("Error dumping database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

dumpDatabase();
