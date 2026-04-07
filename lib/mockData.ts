// Centralized mock data store for Search functionality

export type SearchItem = {
  id: string;
  type: 'guide' | 'library' | 'news' | 'app' | 'case';
  title: string;
  description: string;
  tag: string;
  imgSrc: string;
  href: string; // The base route where this item belongs (e.g., /guide, /cases)
};

export const globalMockData: SearchItem[] = [
  // AI Guides (page-1)
  {
    id: 'guide-1',
    type: 'guide',
    title: 'GPT-4o 실무 프롬프트 완벽 가이드',
    description: '역할 부여(Role-playing), 예시 제공(Few-shot) 등 업무 생산성을 극대화하는 프롬프트 공식을 요약했습니다.',
    tag: 'LLM',
    imgSrc: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600',
    href: '/guide'
  },
  {
    id: 'guide-2',
    type: 'guide',
    title: 'Runway 모션 브러시로 자연스러운 움직임 만들기',
    description: '제공해주신 런웨이 튜토리얼 영상을 기반으로 모션 브러시 세팅값(Horizontal, Vertical)을 요약했습니다.',
    tag: 'Runway',
    imgSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=600',
    href: '/guide'
  },

  // AI Library (page-2)
  {
    id: 'lib-1',
    type: 'library',
    title: 'Midjourney v6 - 사이버펑크 네온 시티 레퍼런스',
    description: 'Cyberpunk futuristic city scape, neon pink and cyan lights, flying cars, fog, cinematic lighting, 8k, photorealistic --ar 16:9',
    tag: 'Midjourney',
    imgSrc: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=600',
    href: '/library'
  },
  {
    id: 'lib-2',
    type: 'library',
    title: 'DALL-E 3 - 액체 추상화 아트 레퍼런스',
    description: 'Abstract liquid art, vibrant colors, macro photography, highly detailed, fluid dynamics, studio lighting',
    tag: 'DALL-E',
    imgSrc: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600',
    href: '/library'
  },
  {
    id: 'lib-3',
    type: 'library',
    title: '사이버보안 UI 컨셉 아트',
    description: '\\\\Server\\Design\\References\\UI',
    tag: 'Pinterest',
    imgSrc: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    href: '/library'
  },

  // AI News (page-3)
  {
    id: 'news-1',
    type: 'news',
    title: '오픈AI, 새로운 GPT 모델 전격 공개!',
    description: '조코딩 채널 요약: 오픈AI의 최신 모델 발표와 변경된 API 요금제를 2장으로 요약했습니다.',
    tag: '조코딩',
    imgSrc: 'https://images.unsplash.com/photo-1675557008682-14eb022f4625?auto=format&fit=crop&q=80&w=600',
    href: '/news'
  },

  // AI Apps (page-4)
  {
    id: 'app-1',
    type: 'app',
    title: 'GS Auto-Blogger',
    description: '키워드만 입력하면 SEO에 최적화된 블로그 포스팅 초안을 자동 생성하는 앱입니다.',
    tag: '마케팅 자동화 툴',
    imgSrc: 'https://images.unsplash.com/photo-1664575198308-3959904fa430?auto=format&fit=crop&q=80&w=200',
    href: '/apps'
  },
  {
    id: 'app-2',
    type: 'app',
    title: 'Vision Translator',
    description: '해외 디자인 레퍼런스 이미지의 텍스트를 인식(OCR)하여 번역해주는 서비스입니다.',
    tag: '디자인 번역 툴',
    imgSrc: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600', // Reusing an image
    href: '/apps'
  },

  // AI Cases (page-5)
  {
    id: 'case-1',
    type: 'case',
    title: '미드저니 V6 광고 시안 활용법',
    description: '최근 신제품 기획안 작성 시 실사 이미지를 뽑은 사례입니다.',
    tag: 'Midjourney',
    imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
    href: '/cases'
  },
  {
    id: 'case-2',
    type: 'case',
    title: '엑셀 매크로 대신 파이썬 + GPT-4o',
    description: '매달 하던 데이터 취합 업무를 GPT를 통해 1분 만에 자동화했습니다. 프롬프트 구조화 방법 공유합니다.',
    tag: 'ChatGPT',
    imgSrc: '',
    href: '/cases'
  },
  {
    id: 'case-3',
    type: 'case',
    title: '모션 브러시 적용 테스트 영상',
    description: '정지된 이미지에서 하늘의 구름만 자연스럽게 움직이게 하는 세팅 팁입니다.',
    tag: 'Runway',
    imgSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=600',
    href: '/cases'
  }
];
