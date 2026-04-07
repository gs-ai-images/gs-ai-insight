import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      title: { contains: "아닙니다" }
    }
  });

  for (const p of posts) {
    console.log(`URL: ${p.sourceUrl}`);
    console.log(`Title: ${p.title}`);
  }
}

main().finally(() => prisma.$disconnect());
