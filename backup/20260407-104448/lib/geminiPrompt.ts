import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the API KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function optimizePromptWithGemini(userInput: string, imageBase64?: string): Promise<{
  optimizedPrompt: string;
  category: string;
  tips: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build the rigorous System-like prompt instructions
    const systemInstruction = `You are a world-class AI Prompt Engineer and AI Whisperer. Your job is to transform a user's basic request into a highly optimized, professional-grade prompt that gets the absolute BEST results from AI generators (like Midjourney v6, Runway Gen-2, Sora, ChatGPT, or 3D structural AI).

Follow these instructions perfectly:
1. Detect the user's intent category from the following options: "image_generation", "video_generation", "text_generation", "3d_generation", or "general".
2. Based on the category, rewrite their request into a highly detailed **ENGLISH** master prompt. 
   - If Image/Video: Include subject perfectly, lighting (e.g. volumetric lighting, cinematic), camera angle, lens (e.g. 35mm), styling, artist references, high resolution markers (8k, highly detailed), and frame motion attributes (for video).
   - If Text/Code: Define persona, context, step-by-step logic, output format (Markdown, JSON), and tone.
3. Write 2-3 highly actionable and practical "PRO Tips" perfectly translated to **KOREAN (한국어)**.

Format constraints:
- Return ONLY a valid JSON object.
- NO markdown wrappers like \`\`\`json or \`\`\`. Just raw JSON string.

Must be exactly in this format:
{
  "category": "image_generation",
  "optimizedPrompt": "[Your perfectly crafted English prompt]",
  "tips": ["한국어로 된 팁 1", "한국어로 된 팁 2"]
}`;

    // Prepare contents
    const contents: any[] = [];
    
    // Process image if provided
    if (imageBase64) {
      const parts = imageBase64.split(';');
      let mimeType = 'image/jpeg';
      let dataStr = imageBase64;
      
      if (parts.length > 1) {
        mimeType = parts[0].split(':')[1];
        dataStr = parts[1].replace('base64,', '');
      } else {
        dataStr = imageBase64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '');
      }

      contents.push({
        role: "user",
        parts: [
          { text: systemInstruction + `\n\nUser's Request: "${userInput}"\n\n(Below is the reference image provided by the user. Analyze the image to create the most accurate optimal prompt for what they want.)\nGenerate the JSON now:` },
          {
            inlineData: {
              data: dataStr,
              mimeType: mimeType
            }
          }
        ]
      });
    } else {
      contents.push({
        role: "user",
        parts: [
          { text: systemInstruction + `\n\nUser's Request: "${userInput}"\n\nGenerate the JSON now:` }
        ]
      });
    }

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    // Clean JSON parsing
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json/i, '');
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```/i, '');
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    }
    cleanedText = cleanedText.trim();

    try {
      const parsed = JSON.parse(cleanedText);
      return {
        optimizedPrompt: parsed.optimizedPrompt || cleanedText,
        category: parsed.category || 'general',
        tips: parsed.tips || [],
      };
    } catch (parseError) {
      console.log("Failed to parse Gemini output as JSON directly. Output was:", cleanedText);
      
      // Fallback manual regex json extraction if multiple issues
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        const fallbackParsed = JSON.parse(match[0]);
        return {
           optimizedPrompt: fallbackParsed.optimizedPrompt || match[0],
           category: fallbackParsed.category || 'general',
           tips: fallbackParsed.tips || [],
        }
      }
      throw new Error("Invalid output format");
    }

  } catch (error) {
    console.error("Gemini optimization error:", error);
    return {
      optimizedPrompt: "I'm sorry, I couldn't generate the prompt due to an internal error. Please try again or provide more details.",
      category: "error",
      tips: ["현재 구글 Gemini AI 서버 응답이 지연되고 있거나, 입력된 텍스트에 처리할 수 없는 문자가 있습니다."],
    };
  }
}
