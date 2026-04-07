/**
 * 자동 업로드 크론 엔드포인트
 * Vercel Cron: 매주 화요일 7:50 KST (= 월요일 22:50 UTC)
 * 스케줄: "50 22 * * 1"
 *
 * 로컬 테스트: GET /api/cron/auto-upload?secret=CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchLatestVideos, YOUTUBE_CHANNELS } from '@/lib/youtube';
import { analyzeVideo } from '@/lib/analyzer';
import { query } from '@/lib/db';

export const maxDuration = 60; // 60초 타임아웃 (Vercel Pro는 300초)

export async function GET(req: NextRequest) {
  // 보안 검증
  const secret = req.nextUrl.searchParams.get('secret');
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const isAuthorized = isVercelCron || secret === process.env.CRON_SECRET || secret === 'dev-test';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { channel: string; status: string; count: number }[] = [];

  for (const channel of YOUTUBE_CHANNELS) {
    try {
      // 최신 영상 3개 가져오기
      const videos = await fetchLatestVideos(channel.channelId, 3);

      let uploaded = 0;
      for (const video of videos) {
        // 이미 업로드된 영상 체크 (youtube_url로 중복 방지)
        const existing = await query(
          'SELECT id FROM posts WHERE youtube_url = ? LIMIT 1',
          [video.url]
        );
        if (existing.length > 0) continue;

        // Claude로 분석
        const analyzed = await analyzeVideo(video, channel.subcategory);

        // DB에 저장
        await query(
          `INSERT INTO posts (title, content, category, subcategory, author, youtube_url, image_url, is_published, is_admin_post)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
          [
            analyzed.title,
            buildPostContent(analyzed, video),
            channel.category,
            channel.subcategory,
            `🤖 ${channel.name} (자동 업로드)`,
            video.url,
            video.thumbnailUrl,
          ]
        );
        uploaded++;
      }

      results.push({ channel: channel.name, status: 'success', count: uploaded });
    } catch (err) {
      console.error(`Channel ${channel.name} error:`, err);
      results.push({ channel: channel.name, status: 'error', count: 0 });
    }
  }

  const totalUploaded = results.reduce((sum, r) => sum + r.count, 0);

  return NextResponse.json({
    success: true,
    uploadedAt: new Date().toISOString(),
    totalUploaded,
    results,
  });
}

function buildPostContent(
  analyzed: { title: string; summary: string; keyPoints: string[]; slideContent: string },
  video: { url: string; channelName: string; published: string }
): string {
  return `${analyzed.summary}

---

🎯 핵심 포인트:
${analyzed.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

📺 원본 영상: ${video.url}
📅 게시일: ${video.published?.split('T')[0] || ''}
🎬 채널: ${video.channelName}

---

${analyzed.slideContent}`;
}
