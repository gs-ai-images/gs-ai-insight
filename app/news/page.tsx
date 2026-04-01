'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  youtube_url: string;
  image_url: string;
  created_at: string;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts?category=news')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '36px' }}>📰</span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>AI 뉴스</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px' }}>
          최신 AI 트렌드 뉴스 — 매주 화요일 자동 업데이트
        </p>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>소스: 조코딩 YouTube 채널</span>
          <a href="https://www.youtube.com/@jocoding/featured" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: '#6c63ff', textDecoration: 'none' }}>채널 바로가기 →</a>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>뉴스를 불러오는 중...</p>
        </div>
      ) : posts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,107,157,0.15)',
              borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,107,157,0.4)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(255,107,157,0.1)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,107,157,0.15)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
              {post.image_url && (
                <div style={{ height: '180px', background: `url(${post.image_url}) center/cover no-repeat, rgba(108,99,255,0.1)` }} />
              )}
              {!post.image_url && (
                <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(108,99,255,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  📰
                </div>
              )}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px', lineHeight: '1.4' }}>{post.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{post.created_at?.split(' ')[0]}</span>
                  {post.youtube_url && (
                    <a href={post.youtube_url} target="_blank" rel="noopener noreferrer" style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                      background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)',
                      color: '#ff6b6b', textDecoration: 'none',
                    }}>▶ 영상 보기</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,107,157,0.1)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>아직 뉴스가 없습니다</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', lineHeight: '1.7' }}>
            매주 화요일 오전 7시 50분에<br />조코딩 채널의 AI 뉴스가 자동으로 업로드됩니다
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
