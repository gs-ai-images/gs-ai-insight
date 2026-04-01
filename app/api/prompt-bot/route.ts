import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/claude';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: '입력값이 없습니다.' }, { status: 400 });
    }

    const result = await optimizePrompt(input.trim());

    await query(
      'INSERT INTO prompt_history (user_input, optimized_prompt, category) VALUES (?, ?, ?)',
      [input.trim(), result.optimizedPrompt, result.category]
    ).catch(() => {}); // non-critical

    return NextResponse.json(result);
  } catch (error) {
    console.error('Prompt bot error:', error);
    return NextResponse.json({ error: '프롬프트 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
