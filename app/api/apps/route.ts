import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  const apps = await query('SELECT * FROM app_services WHERE is_published = 1 ORDER BY created_at DESC', []);
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, image_url, link_url, adminToken } = body;

  if (!isAdmin(adminToken)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const result = await query(
    'INSERT INTO app_services (title, description, image_url, link_url) VALUES (?, ?, ?, ?)',
    [title, description || '', image_url || '', link_url]
  );

  return NextResponse.json({ id: result[0]?.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const adminToken = searchParams.get('adminToken');

  if (!isAdmin(adminToken || undefined)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  await query('DELETE FROM app_services WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
