import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function optimizePrompt(userInput: string): Promise<{
  optimizedPrompt: string;
  category: string;
  tips: string[];
}> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an expert AI prompt engineer specializing in creating optimized prompts for AI tools (Midjourney, Stable Diffusion, RunwayML, DALL-E, Sora, etc.).

User's request (Korean or English): "${userInput}"

Analyze the request and:
1. Detect the category: image_generation, video_generation, text_generation, 3d_generation, or general
2. Create the most optimized English prompt for the best quality output
3. Provide 2-3 short tips in Korean

Respond ONLY in this exact JSON format:
{
  "category": "image_generation",
  "optimizedPrompt": "the optimized English prompt here, detailed and specific",
  "tips": ["팁 1", "팁 2", "팁 3"]
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        optimizedPrompt: parsed.optimizedPrompt || text,
        category: parsed.category || 'general',
        tips: parsed.tips || [],
      };
    }
  } catch {
    // fallback
  }

  return {
    optimizedPrompt: text,
    category: 'general',
    tips: [],
  };
}
