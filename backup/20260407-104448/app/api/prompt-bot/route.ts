import { NextRequest, NextResponse } from 'next/server';
import { optimizePromptWithGemini } from '@/lib/geminiPrompt';

export async function POST(req: NextRequest) {
  try {
    const { input, category, image } = await req.json();
    if (!input?.trim() && !image) {
      return NextResponse.json({ error: '입력값이 없습니다.' }, { status: 400 });
    }

    const requestContent = category && category !== 'all' 
      ? `[Target Category: ${category}] ${input?.trim() || ''}`
      : (input?.trim() || '');

    const result = await optimizePromptWithGemini(requestContent, image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Prompt bot error:', error);
    return NextResponse.json({ error: '프롬프트 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
