import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tips = await prisma.post.findMany({
      where: { category: 'tips' },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, email: true } } }
    });
    return NextResponse.json(tips);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();

    const tip = await prisma.post.create({
      data: {
        title,
        content,
        category: 'tips',
        authorId: session.user.id
      }
    });

    return NextResponse.json(tip);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
  }
}
