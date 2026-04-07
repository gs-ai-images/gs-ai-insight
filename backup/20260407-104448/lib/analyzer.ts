/**
 * Claude API를 이용해 YouTube 영상 내용을 분석하고
 * 슬라이드 형식의 한국어 요약을 생성합니다.
 */

import Anthropic from '@anthropic-ai/sdk';
import { YoutubeVideo } from './youtube';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AnalyzedContent {
  title: string;
  summary: string;
  keyPoints: string[];
  slideContent: string; // HTML-like slide
  category: string;
}

export async function analyzeVideo(video: YoutubeVideo, category: string): Promise<AnalyzedContent> {
  const prompt = `당신은 AI 콘텐츠 큐레이터입니다. 아래 YouTube 영상 정보를 분석하여 GS 임직원을 위한 AI 인사이트 요약을 한국어로 작성하세요.

영상 제목: ${video.title}
채널: ${video.channelName}
설명: ${video.description || '(설명 없음)'}
카테고리: ${category}

다음 JSON 형식으로 응답하세요:
{
  "title": "임팩트 있는 한국어 제목 (원 제목 참고)",
  "summary": "3-4문장 핵심 요약 (한국어)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "slideContent": "슬라이드 형식의 HTML (헤더, 포인트 목록 포함, 인라인 스타일 사용)"
}

slideContent는 다음 스타일을 따르세요:
- 어두운 배경에 어울리는 카드 형식
- 제목, 핵심 내용 3가지, 출처 표시
- 이모지 활용으로 시각적으로 풍부하게`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || video.title,
        summary: parsed.summary || '',
        keyPoints: parsed.keyPoints || [],
        slideContent: parsed.slideContent || buildDefaultSlide(video, parsed.keyPoints || []),
        category,
      };
    }
  } catch (err) {
    console.error('Analysis error:', err);
  }

  // Fallback
  return {
    title: video.title,
    summary: video.description?.slice(0, 200) || '',
    keyPoints: [],
    slideContent: buildDefaultSlide(video, []),
    category,
  };
}

function buildDefaultSlide(video: YoutubeVideo, points: string[]): string {
  return `<div style="padding:20px;background:rgba(108,99,255,0.08);border-radius:12px;border:1px solid rgba(108,99,255,0.2)">
  <h3 style="color:white;font-size:18px;margin-bottom:12px">📺 ${video.title}</h3>
  <p style="color:rgba(255,255,255,0.6);font-size:14px;margin-bottom:16px">${video.channelName}</p>
  ${points.map(p => `<div style="display:flex;gap:8px;margin-bottom:8px"><span style="color:#6c63ff">▸</span><span style="color:rgba(255,255,255,0.8);font-size:14px">${p}</span></div>`).join('')}
  <a href="${video.url}" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(255,0,0,0.2);border:1px solid rgba(255,0,0,0.3);border-radius:8px;color:#ff6b6b;font-size:13px;text-decoration:none">▶ 원본 영상 보기</a>
</div>`;
}
