import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting broken posts...");
  const deleted = await prisma.post.deleteMany({
    where: {
      OR: [
        { title: { contains: "제공된 텍스트는" } },
        { title: { contains: "AI 뉴스 기사가 아닙니다" } },
        { content: { contains: "AI 뉴스 기사가 아닙니다" } }
      ]
    }
  });
  console.log(`Deleted ${deleted.count} broken posts.`);
}

main().finally(() => prisma.$disconnect());
