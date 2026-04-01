import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const adminToken = searchParams.get('adminToken');

  const post = await queryOne('SELECT * FROM posts WHERE id = ?', [id]);
  if (!post) return NextResponse.json({ error: '게시물이 없습니다.' }, { status: 404 });

  if (!isAdmin(adminToken || undefined) && post.author_token !== token) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  await query('DELETE FROM posts WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { adminToken, title, content, is_published } = body;

  if (!isAdmin(adminToken)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  await query(
    'UPDATE posts SET title = ?, content = ?, is_published = ? WHERE id = ?',
    [title, content, is_published ?? 1, id]
  );

  return NextResponse.json({ success: true });
}
