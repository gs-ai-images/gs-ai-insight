import { PrismaClient } from '@prisma/client';
import { YoutubeTranscript } from 'youtube-transcript';
import { Anthropic } from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const urls = [
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=2vK59Dfv6ZM' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=sC4ZtMSaqmo' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=4C4zVz4H5fE' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=hEOUqgZp9bs' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=_GRVcvG3wkY' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=iEeouu1mwiI' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=TRlwZCcuUpc' },
  { subCategory: '1-3', url: 'https://www.youtube.com/watch?v=rBmH74tpXh0' },
  { subCategory: '1-4', url: 'https://www.youtube.com/watch?v=WmBPTQ5r8X4' },
  { subCategory: '1-4', url: 'https://www.youtube.com/watch?v=mr3IHoexK3o' },
  { subCategory: '1-4', url: 'https://www.youtube.com/watch?v=bQ5XN9ECBmA' },
  { subCategory: '1-5', url: 'https://www.youtube.com/watch?v=WefGzuy7gwA' },
  { subCategory: '1-5', url: 'https://www.youtube.com/watch?v=ogk5DKbX3FI' },
  { subCategory: '1-6', url: 'https://www.youtube.com/watch?v=YjXRzBHziyA' },
  { subCategory: '1-7', url: 'https://www.youtube.com/watch?v=MN4PpubmG10' },
  { subCategory: '1-7', url: 'https://www.youtube.com/watch?v=14Y0lIZtOI8' },
  { subCategory: '1-8', url: 'https://www.youtube.com/watch?v=IaEXLG4L06g' },
  { subCategory: '1-8', url: 'https://www.youtube.com/watch?v=R4az7Hd-FeA' },
  { subCategory: '1-8', url: 'https://www.youtube.com/watch?v=MszK9mm5hTo' },
  { subCategory: '1-8', url: 'https://www.youtube.com/watch?v=PN20RT3hCqQ' },
  { subCategory: '1-9', url: 'https://www.youtube.com/watch?v=XMnHBbEGw_8' }
];

async function summarizeTextToMarkdown(content: string, url: string): Promise<{ title: string; content: string }> {
  const prompt = `You are a professional AI Guide content creator. Summarize the following extracted text from a YouTube video into a high-quality Markdown formatted guide for a corporate AI Portal. Do not include introductory text, start right with the title.

  Write in **Korean**.
  
  Format:
  1. Catchy title describing what the AI tool/guide is about.
  2. 3-line bullet point summary at the top.
  3. Detailed insights under nice headings.
  4. End with a short wrap-up.
  
  Must start the first line with <title>Title</title>.
  
  Text to summarize:
  ${content.substring(0, 6000)} ...`;

  const msg = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'AI Guide';
  const body = responseText.replace(/<title>[\s\S]*?<\/title>/, '').trim();

  return { title, content: body };
}

async function run() {
  console.log('Starting seed process for 18 URLs...');
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  
  for (const item of urls) {
    const videoId = item.url.split('v=')[1]?.split('&')[0];
    if (!videoId) continue;
    
    console.log(`Processing: ${item.url} -> ${videoId}`);
    const existing = await prisma.post.findFirst({ where: { sourceUrl: item.url } });
    if (existing) {
       console.log('Already exists, skipping.');
       continue;
    }

    try {
      const transcripts = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ko' }).catch(() => null);
      let rawText = '';
      if (transcripts && transcripts.length > 0) {
         rawText = transcripts.map((t: any) => t.text).join(' ');
      } else {
         const enTranscripts = await YoutubeTranscript.fetchTranscript(videoId).catch(() => []);
         rawText = enTranscripts.map((t: any) => t.text).join(' ');
      }

      if (!rawText) {
         console.log('No transcript found.');
         continue;
      }

      console.log('Summarizing with Claude...');
      const { title, content } = await summarizeTextToMarkdown(rawText, item.url);
      
      const dbContent = `${content}\n\n---\n**원본 유튜브**: [바로가기](${item.url})`;

      await prisma.post.create({
        data: {
          title: title,
          content: dbContent,
          sourceUrl: item.url,
          category: 'guide',
          subCategory: item.subCategory, // Using the subCategory mapped
          authorId: adminUser ? adminUser.id : "1",
        }
      });
      console.log('Saved:', title);
    } catch (err: any) {
      console.error(`Failed on ${item.url}:`, err.message);
    }
  }
  
  console.log('Done!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
