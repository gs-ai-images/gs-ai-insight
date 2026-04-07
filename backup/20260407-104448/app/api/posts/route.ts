import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const q = url.searchParams.get('q');
    
    // Validate category or search query
    let whereCondition: any = {};
    if (category) {
      whereCondition.category = category;
    }
    if (q) {
      whereCondition.OR = [
        { title: { contains: q } },
        { content: { contains: q } }
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, email: true } } }
    });
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category, subCategory, sourceUrl, imageUrl, imagesData, summary, sourceName, tag, timeLabel } = body;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        category: category || 'tips',
        subCategory,
        sourceUrl,
        imageUrl,
        imagesData,
        summary,
        sourceName,
        tag,
        timeLabel,
        authorId: session.user.id
      }
    });

    return NextResponse.json(newPost);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
