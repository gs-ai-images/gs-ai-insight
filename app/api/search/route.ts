import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json([]);
  }

  const keyword = q.toLowerCase().trim();

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
          { tag: { contains: keyword, mode: 'insensitive' } },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // max 20 results for global search
    });

    const getHrefForCategory = (category: string, id: string) => {
      switch (category) {
        case 'news': return `/news?postId=${id}`;
        case 'app': return `/apps?postId=${id}`;
        case 'case': return `/cases?postId=${id}`;
        case 'guide': return `/guide?postId=${id}`;
        case 'library': return `/library?postId=${id}`;
        default: return `/?postId=${id}`;
      }
    };

    const getTypeForCategory = (category: string) => {
      switch (category) {
        case 'news': return 'News';
        case 'app': return 'App';
        case 'case': return 'Case';
        case 'guide': return 'Guide';
        case 'library': return 'Library';
        default: return 'Article';
      }
    };

    const results = posts.map(post => ({
      id: post.id,
      category: post.category,
      title: post.title,
      description: post.content.substring(0, 150) + '...', // short snippet
      imgSrc: post.imageUrl || '',
      tag: post.tag || post.category,
      type: getTypeForCategory(post.category),
      href: getHrefForCategory(post.category, post.id),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
