import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin, generateUserToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const search = searchParams.get('search');

  let sql = 'SELECT * FROM posts WHERE is_published = 1';
  const params: unknown[] = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (subcategory) { sql += ' AND subcategory = ?'; params.push(subcategory); }
  if (search) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const posts = await query(sql, params);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, category, subcategory, author, image_url, link_url, youtube_url, adminToken } = body;

  const isAdminPost = isAdmin(adminToken);
  if (category !== 'tips' && !isAdminPost) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const authorToken = isAdminPost ? 'admin' : generateUserToken();
  const authorName = isAdminPost ? '관리자' : (author || '익명');

  const result = await query(
    'INSERT INTO posts (title, content, category, subcategory, author, author_token, image_url, link_url, youtube_url, is_admin_post) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, content, category, subcategory || null, authorName, authorToken, image_url || null, link_url || null, youtube_url || null, isAdminPost ? 1 : 0]
  );

  return NextResponse.json({
    id: result[0]?.lastInsertRowid,
    authorToken: isAdminPost ? null : authorToken,
  });
}
