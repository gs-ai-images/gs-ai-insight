import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { input, mediaBase64, mediaMimeType } = await req.json();

    if (!input && !mediaBase64) {
      return NextResponse.json({ error: '입력된 내용이나 파일이 없습니다.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: '서버에 API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 가장 최신이자 안정적인 gemini-2.5-flash 사용
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 최고 퀄리티의 마스터 프롬프트 생성을 위한 시스템 지시문
    const systemInstruction = `You are a world-class AI Prompt Architect and Visionary Director.
Your job is to transform the user's request (and any provided image/video) into the ultimate, highest-quality English master prompt for AI generation.

Follow these strict rules:
1. Determine the EXACT category of the request (e.g., Image Generation, Video Generation, Text Generation, 3D Object, Coding, Data Analysis).
2. Based on the category, recommend the absolute best AI Tool in the market (e.g., Midjourney v6, Runway Gen-3, Sora, ChatGPT-4, Claude 3.5, Spline AI).
3. Write the ultimate English prompt to achieve the best results with that tool:
   - For Image/Video: Specify the subject, exact lighting (e.g., volumetric, neon, cinematic), camera focal length (e.g., 35mm lens, macro), styling, rendering engine (e.g., Unreal Engine 5, Octane), mood, and high-fidelity modifiers (e.g., 8k, ultra-detailed). If video, describe the camera motion securely.
   - For Text/Logic: Specify the persona, clear constraints, tone, and exact format.
4. Output your analysis ONLY as a raw, valid JSON object exactly in this shape (DO NOT wrap in markdown \`\`\`json block):
{
  "tool": "[Recommended AI Tool Name]",
  "prompt": "[The ultimate highly-detailed English prompt]"
}`;

    const parts: any[] = [
      { text: systemInstruction + `\n\nUser Request: "${input || 'Based on the attached media, generate an optimal prompt.'}"\n\nReturn JSON now:` }
    ];

    if (mediaBase64 && mediaMimeType) {
      parts.push({
        inlineData: {
          data: mediaBase64,
          mimeType: mediaMimeType
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });

    const responseText = result.response.text();
    
    // 완벽한 JSON 파싱을 위한 전처리 (Gemini가 마크다운을 감싸서 반환할 수 있으므로 제거)
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/i, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/i, '');
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.replace(/```$/, '');
    }
    cleanedText = cleanedText.trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch(e) {
      console.warn("JSON parse failed, falling back to regex extraction:", cleanedText);
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        data = {
          prompt: cleanedText,
          tool: '분석 결과를 프롬프트로 텍스트 반환'
        };
      }
    }

    // 결과값 검증 및 반환
    return NextResponse.json({
      prompt: data.prompt || data.optimizedPrompt || cleanedText,
      tool: data.tool || data.category || 'AI Tool'
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: '서버에서 프롬프트 변환 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
