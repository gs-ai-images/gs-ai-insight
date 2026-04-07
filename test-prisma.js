const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const post = await prisma.post.findFirst();
    console.log("First post:", post);
    
    // Explicitly test creating a dummy post
    const newPost = await prisma.post.create({
      data: {
        title: "Test",
        content: "Test",
        category: "library",
        imagesData: "[]",
        authorId: "1"
      }
    });
    console.log("Created successfully:", !!newPost);
    await prisma.post.delete({ where: { id: newPost.id }});
  } catch (err) {
    console.error("Error creating post:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
