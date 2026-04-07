import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin, generateUserToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'prompts';

  if (type === 'prompts') {
    const rows = await query('SELECT * FROM library_prompts ORDER BY created_at DESC', []).catch(() => []);
    return NextResponse.json(rows);
  } else {
    const rows = await query('SELECT * FROM library_sources ORDER BY created_at DESC', []).catch(() => []);
    return NextResponse.json(rows);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, adminToken, ...data } = body;

  if (!isAdmin(adminToken)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  if (type === 'prompts') {
    const result = await query(
      'INSERT INTO library_prompts (title, prompt_text, category, image_url, tags) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.prompt_text, data.category || '', data.image_url || '', data.tags || '']
    );
    return NextResponse.json({ id: result[0]?.lastInsertRowid });
  } else {
    const result = await query(
      'INSERT INTO library_sources (title, description, image_url, source_url, tool_name) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.description || '', data.image_url || '', data.source_url || '', data.tool_name || '']
    );
    return NextResponse.json({ id: result[0]?.lastInsertRowid });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'prompts';
  const adminToken = searchParams.get('adminToken');

  if (!isAdmin(adminToken || undefined)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const table = type === 'prompts' ? 'library_prompts' : 'library_sources';
  await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return NextResponse.json({ success: true });
}
