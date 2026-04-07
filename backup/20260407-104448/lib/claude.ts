import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function optimizePrompt(userInput: string, imageBase64?: string): Promise<{
  optimizedPrompt: string;
  category: string;
  tips: string[];
}> {
  const messages: any[] = [];
  
  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mediaType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          }
        },
        {
          type: 'text',
          text: `You are an expert AI prompt engineer specializing in creating optimized prompts for AI tools (Midjourney, Stable Diffusion, RunwayML, DALL-E, Sora, etc.).
          
User's request (Korean or English): "${userInput}"

Analyze the provided image and the request:
1. Detect the category: image_generation, video_generation, text_generation, 3d_generation, or general
2. Create the most optimized English prompt to recreate or alter this image per user request
3. Provide 2-3 short tips in Korean

Respond ONLY in this exact JSON format:
{
  "category": "image_generation",
  "optimizedPrompt": "the optimized English prompt here, detailed and specific",
  "tips": ["팁 1", "팁 2", "팁 3"]
}`
        }
      ]
    });
  } else {
    messages.push({
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
}`
    });
  }

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022', // upgraded to sonnet 3.5 for vision support
    max_tokens: 1024,
    messages,
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
