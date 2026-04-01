import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (isAdmin(password)) {
    return NextResponse.json({ success: true, token: password });
  }
  return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
}
