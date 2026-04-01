import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q?.trim()) return NextResponse.json([]);

  const results = await query(
    'SELECT id, title, content, category, subcategory, created_at FROM posts WHERE is_published = 1 AND (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT 20',
    [`%${q}%`, `%${q}%`]
  );

  return NextResponse.json(results);
}
