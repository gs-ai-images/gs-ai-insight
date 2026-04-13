import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const latestNews = [
  {
    title: "Anthropic's 'Claude Mythos' Stirs Cybersecurity Worries",
    summary: "Anthropic's unreleased 'Claude Mythos' model demonstrates dangerous zero-day exploitation capabilities, prompting urgent regulatory talks.",
    content: "Anthropic's new highly capable frontier AI model, 'Claude Mythos,' has triggered urgent talks among UK financial regulators and cybersecurity agencies. The model, which remains officially unreleased due to its dangerous ability to autonomously discover and exploit software vulnerabilities, is currently only accessible via 'Project Glasswing'—a controlled initiative for defensive cybersecurity.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://theguardian.com",
    sourceName: "The Guardian",
    tag: "Security",
    timeLabel: "1시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "Google Launches Gemma 4 Open-Weight Models",
    summary: "Google officially releases its Gemma 4 family of models, designed for advanced reasoning, complex logic, and multimodal inputs.",
    content: "On April 2, Google officially released the Gemma 4 family of open-weight models under the Apache 2.0 license. Ranging from 2B to 31B parameters, these models support multimodal inputs including text, image, video, and audio. Gemma 4 offers native function calling and structured JSON outputs tailored for edge computing and autonomous agent workflows.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://blog.google",
    sourceName: "Google Blog",
    tag: "Open Source AI",
    timeLabel: "3시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "USC Breakthrough: Memristors Hitting 700°C for AI",
    summary: "Researchers at USC have developed a memristor capable of operating at 700°C, aiming to overcome the thermal limits of today's AI processors.",
    content: "University of Southern California researchers have created a novel memristor utilizing a layer of graphene that operates stably at 700 degrees Celsius (about 1300°F). This breakthrough in high-temperature electronics could allow AI computing systems to break past current semiconductor thermal limits, enabling implementations in extreme environments or vastly increasing compute density.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://scitechdaily.com",
    sourceName: "SciTechDaily",
    tag: "Hardware Research",
    timeLabel: "5시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "Backlash and Policy Push on AI Infrastructure",
    summary: "As AI pushes data center construction into high gear, communities raise environmental concerns while AI firms advocate for new industrial policies.",
    content: "A massive nationwide boom in data center construction to power AI is facing significant resistance from local communities due to concerns over environmental impacts and power consumption. Meanwhile, major AI developers like OpenAI are releasing policy papers advocating for a national industrial policy to support this infrastructure, while public scrutiny of AI's energy footprint intensifies.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://cbsnews.com",
    sourceName: "CBS News",
    tag: "Business & Strategy",
    timeLabel: "6시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "Hut 8 Pivots to AI with River Bend Data Center",
    summary: "Former Bitcoin miner Hut 8 continues its aggressive pivot to AI by advancing the $10 billion River Bend campus in Louisiana.",
    content: "Hut 8 is advancing its massive $10 billion, 245 MW 'River Bend' AI data center project in Louisiana. The company is actively shifting from its legacy crypto mining operations into a major energy infrastructure and hyperscale AI data center operator, establishing key partnerships with tech giants looking to secure computational capacity for AI workloads.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://cryptobriefing.com",
    sourceName: "Crypto Briefing",
    tag: "Cloud & Infrastructure",
    timeLabel: "8시간 전",
    category: "news",
    authorId: "1"
  }
];

async function main() {
  console.log('Ensuring admin user exists...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gs-ai.com' },
    update: {},
    create: {
      id: '1',
      name: 'Admin User',
      email: 'admin@gs-ai.com',
      role: 'ADMIN'
    }
  });

  console.log('Inserting 5 new AI articles analyzed for today...');
  await prisma.post.createMany({ 
    data: latestNews,
    skipDuplicates: true
  });
  
  console.log('5 News items successfully uploaded to database.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
