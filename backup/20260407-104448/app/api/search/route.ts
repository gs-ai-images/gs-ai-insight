import { NextRequest, NextResponse } from 'next/server';
import { globalMockData } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json([]);
  }

  const keyword = q.toLowerCase().trim();

  // Search across centralized mock data
  const results = globalMockData.filter((item) => {
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.tag.toLowerCase().includes(keyword) ||
      item.type.toLowerCase().includes(keyword)
    );
  });

  return NextResponse.json(results);
}
