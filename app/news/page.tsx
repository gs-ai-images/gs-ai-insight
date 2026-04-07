import { prisma } from "@/lib/prisma";
import NewsClient from "./NewsClient";

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const dbPosts = await prisma.post.findMany({
    where: { category: 'news' },
    orderBy: { createdAt: 'desc' }
  });

  const mappedPosts = dbPosts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    summary: post.summary || '',
    imgSrc: post.imageUrl || '',
    sourceUrl: post.sourceUrl || '',
    sourceName: post.sourceName || '',
    tag: post.tag || '',
    timeLabel: post.timeLabel || '',
  }));

  // If no news posts, seed them as before
  if (mappedPosts.length === 0) {
    try {
      // In SSR we can't easily call our own API route for seeding via fetch without absolute URL. 
      // It's better to let the client handle seed on empty, or we pass empty array and client fetches.
      // But we can just pass empty array.
    } catch(e) {}
  }

  return <NewsClient initialDbPosts={mappedPosts} />;
}
