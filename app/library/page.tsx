import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LibraryClient from "./LibraryClient";

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  
  const dbPosts = await prisma.post.findMany({
    where: { category: 'library' },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true, email: true } } }
  });

  const mappedPosts = dbPosts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    imgSrc: post.imageUrl || '',
    images: post.imagesData ? JSON.parse(post.imagesData) : (post.imageUrl ? [post.imageUrl] : []),
    tag: post.tag || 'LLM',
    author: post.author?.name || '관리자',
    timeLabel: post.timeLabel || '',
    isOwner: session?.user?.role === 'ADMIN'
  }));

  return <LibraryClient initialDbPosts={mappedPosts} />;
}
