/**
 * YouTube RSS 피드에서 최신 영상을 가져옵니다.
 * YouTube는 채널/플레이리스트 RSS를 공개 제공합니다.
 */

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  published: string;
  description: string;
  channelName: string;
  thumbnailUrl: string;
}

// 채널 URL에서 채널 ID 추출 (핸들 → ID 변환)
const CHANNEL_IDS: Record<string, string> = {
  '@ai.yeongseon': 'UCkz5O3oHN2GVSF-5U1sSGxA',  // 실제 채널 ID (핸들로 조회 필요)
  '@mjKorea123': 'UCX5mhF7DYxEPUY5-qvU7GkA',
  '@jocoding': 'UC6LQcxE89cDYrNvPBYkEhyw',
};

// YouTube RSS URL 생성
function getRssUrl(source: string): string {
  // 채널 핸들
  if (source.startsWith('@') && CHANNEL_IDS[source]) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_IDS[source]}`;
  }
  // 채널 ID 직접 지정
  if (source.startsWith('UC') && source.length === 24) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${source}`;
  }
  // 재생목록 ID
  if (source.startsWith('PL')) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=${source}`;
  }
  // 유튜브 URL에서 video ID 추출 → 개별 영상은 RSS가 없으므로 null
  return '';
}

// XML 파싱 유틸
function extractText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
  return match ? match[1] : '';
}

export async function fetchLatestVideos(
  channelId: string,
  limit = 3
): Promise<YoutubeVideo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const channelName = extractText(xml, 'title').split('\n')[0] || 'YouTube';

    // entry 블록 추출
    const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const videos: YoutubeVideo[] = [];

    for (const entry of entryMatches.slice(0, limit)) {
      const videoId = extractText(entry, 'yt:videoId') || extractAttr(entry, 'link', 'href').split('v=')[1];
      const title = extractText(entry, 'title');
      const published = extractText(entry, 'published');
      const description = extractText(entry, 'media:description').slice(0, 500);
      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

      if (videoId && title) {
        videos.push({
          id: videoId,
          title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          published,
          description,
          channelName: channelName.replace(/\n.*/, '').trim(),
          thumbnailUrl,
        });
      }
    }
    return videos;
  } catch (err) {
    console.error('YouTube RSS fetch error:', err);
    return [];
  }
}

// 알려진 채널 ID 맵
export const YOUTUBE_CHANNELS: { category: string; subcategory: string; channelId: string; name: string }[] = [
  { category: 'guide', subcategory: 'llm', channelId: 'UCkz5O3oHN2GVSF-5U1sSGxA', name: 'AI 연선' },
  { category: 'guide', subcategory: 'midjourney', channelId: 'UCX5mhF7DYxEPUY5-qvU7GkA', name: 'MJ Korea' },
  { category: 'news', subcategory: 'main', channelId: 'UC6LQcxE89cDYrNvPBYkEhyw', name: '조코딩' },
];
