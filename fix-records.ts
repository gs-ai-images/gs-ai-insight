import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting old error posts...");
  const deleted = await prisma.post.deleteMany({
    where: {
      sourceName: "AI타임스"
    }
  });
  console.log(`Deleted ${deleted.count} old posts.`);

  console.log("Triggering fresh fetch from API...");
  try {
    const res = await fetch("http://localhost:3000/api/cron/news");
    const json = await res.json();
    console.log("Fetch result:", json);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}

main().finally(() => prisma.$disconnect());
