import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.clnwzbfizwymxejvjmwa:GS%21edit4663@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    }
  }
});

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log(`Database reached! User count: ${userCount}`);
  } catch (error) {
    console.error("Error connecting to Postgres:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
