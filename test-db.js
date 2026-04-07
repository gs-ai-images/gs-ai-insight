const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("Users:", users)
  
  // Create the '1' user to satisfy the foreign key constraint
  const upsertUser = await prisma.user.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      email: "admin@gs-ai.com",
      name: "Admin User",
      role: "ADMIN"
    }
  });
  console.log("Upserted user:", upsertUser);
}

main().catch(console.error).finally(() => prisma.$disconnect())
