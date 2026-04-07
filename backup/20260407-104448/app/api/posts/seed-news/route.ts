import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialNewsPosts } from '../../../news/data';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Check if there are already news posts to avoid duplicate seeding
    const existingNewsCount = await prisma.post.count({
      where: { category: 'news' }
    });

    if (existingNewsCount > 0) {
      return NextResponse.json({ message: 'News already seeded.' });
    }

    // Try to find a default user or admin to attribute these posts to
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@gs-ai.com' },
      update: {},
      create: {
        id: '1',
        name: 'Admin User',
        email: 'admin@gs-ai.com',
        role: 'ADMIN'
      }
    });

    const postsToInsert = initialNewsPosts.map(post => ({
      title: post.title,
      summary: post.summary,
      content: post.content,
      imageUrl: post.imgSrc,
      sourceUrl: post.sourceUrl,
      sourceName: post.sourceName,
      tag: post.tag,
      timeLabel: post.timeLabel,
      category: 'news',
      authorId: adminUser.id,
    }));

    await prisma.post.createMany({
      data: postsToInsert
    });

    return NextResponse.json({ success: true, message: 'Seeded initial news posts successfully!' });
  } catch (error) {
    console.error('Failed to seed news:', error);
    return NextResponse.json({ error: 'Failed to seed news' }, { status: 500 });
  }
}
