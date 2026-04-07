import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const p of posts) {
    console.log(`[${p.sourceName}] ${p.title.substring(0, 30)}... | IMG: ${p.imageUrl}`);
  }
}

main().finally(() => prisma.$disconnect());
