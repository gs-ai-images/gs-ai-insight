import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const latestNews = [
  {
    title: "Rise of Agentic AI: Anthropic's 'Conway' Leads the Charge",
    summary: "The industry is shifting from reactive generative AI to proactive 'Agentic AI', with digital coworkers managing complex tasks autonomously.",
    content: "As of April 2026, the artificial intelligence landscape is defined by a massive shift toward 'agentic AI'—systems capable of autonomously planning and executing multi-step workflows. Anthropic has released its 'Conway' agent, and Microsoft alongside Salesforce have introduced new agentic workflows, deploying AI as digital coworkers that require minimal human oversight.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://switas.com",
    sourceName: "Switas",
    tag: "Agentic AI",
    timeLabel: "1시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "OpenAI Unveils 'Super App' Strategy Amid Record CapEx",
    summary: "OpenAI confirmed a major funding round to fuel its super app consolidating chat, coding, search, and agent capabilities.",
    content: "OpenAI has officially confirmed a major funding round to support its 'super app' strategy, consolidating various AI capabilities—chat, coding, search, and autonomous agents—into a single unified interface. Concurrently, industry analysts predict that AI-driven capital expenditures by hyperscalers will reach an unprecedented $725 billion in 2026, aimed at upgrading data centers.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://marketingprofs.com",
    sourceName: "MarketingProfs",
    tag: "Business & Strategy",
    timeLabel: "3시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "Project Glasswing: Tech Giants Unite for Open-Source Security",
    summary: "Major tech firms form Project Glasswing to leverage advanced AI models in detecting and patching software vulnerabilities.",
    content: "The Linux Foundation has officially launched Project Glasswing, a major collaboration involving Google, Microsoft, Apple, and NVIDIA. This initiative utilizes advanced AI models, including Anthropic's 'Claude Mythos', to help open-source maintainers detect, patch, and prevent vulnerabilities at scale, fortifying defenses against AI-generated cyber threats.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://linuxfoundation.org",
    sourceName: "Linux Foundation",
    tag: "Security",
    timeLabel: "5시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "USC Researchers Break Thermal Limits with 700°C Memristor",
    summary: "A new memory device technology operating under extreme temperatures promises to revolutionize AI-computing hardware.",
    content: "Researchers at the University of Southern California have announced a landmark breakthrough in memory device technology. They developed a novel 'memristor' capable of operating at temperatures up to 700°C (1300°F). This advancement could fundamentally change the design of AI-computing hardware, enabling processors to overcome long-standing thermal limits for faster, denser compute.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://sciencedaily.com",
    sourceName: "ScienceDaily",
    tag: "Hardware Research",
    timeLabel: "7시간 전",
    category: "news",
    authorId: "1"
  },
  {
    title: "Google Launches Gemma 4 Open-Weight Models",
    summary: "Google's Gemma 4 brings advanced reasoning and agentic workflows to edge devices and data centers.",
    content: "Google has officially released its Gemma 4 family of open-weight models. Aiming to compete with leading global open-source ecosystems, Gemma 4 is optimized for varying scales, providing advanced reasoning and autonomous agentic capabilities from compact edge devices directly to large data centers.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://marketingprofs.com",
    sourceName: "Google Releases",
    tag: "Open Source AI",
    timeLabel: "10시간 전",
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
