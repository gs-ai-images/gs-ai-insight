'use client';

import { useState, useEffect } from 'react';

const GUIDE_TABS = [
  { id: 'llm', label: 'LLM', icon: '🧠', desc: 'GPT, Claude, Gemini', color: '#6c63ff' },
  { id: 'midjourney', label: 'Midjourney', icon: '🎨', desc: '이미지 AI', color: '#ff6b9d' },
  { id: 'runway', label: 'Runway', icon: '🎬', desc: '영상 생성 AI', color: '#00d4ff' },
  { id: 'google', label: 'Google AI', icon: '🔮', desc: 'Flow, Stitch 등', color: '#4285f4' },
  { id: 'higgsfield', label: 'Higgsfield', icon: '⚡', desc: '영상 AI', color: '#ff9500' },
  { id: 'adobe', label: 'Adobe AI', icon: '🅰️', desc: 'Firefly, Gen Fill', color: '#ff0000' },
  { id: 'comfyui', label: 'ComfyUI', icon: '⚙️', desc: 'AI 워크플로우', color: '#4ade80' },
  { id: '3d', label: '3D AI', icon: '🎲', desc: 'Meshy, Varco 등', color: '#ffd700' },
  { id: 'etc', label: '기타', icon: '🌐', desc: '기타 AI 도구', color: '#a0a0ff' },
];

const YOUTUBE_LINKS: Record<string, { url: string; title: string }[]> = {
  llm: [{ url: 'https://www.youtube.com/@ai.yeongseon', title: 'AI 연선 채널' }],
  midjourney: [{ url: 'https://www.youtube.com/@mjKorea123', title: 'MJ Korea 채널' }],
  runway: [
    { url: 'https://www.youtube.com/watch?v=2vK59Dfv6ZM', title: 'Runway 기초 가이드' },
    { url: 'https://www.youtube.com/watch?v=sC4ZtMSaqmo', title: 'Runway 활용법 2' },
    { url: 'https://www.youtube.com/watch?v=4C4zVz4H5fE', title: 'Runway 활용법 3' },
    { url: 'https://www.youtube.com/watch?v=hEOUqgZp9bs', title: 'Runway 활용법 4' },
    { url: 'https://www.youtube.com/watch?v=_GRVcvG3wkY', title: 'Runway 활용법 5' },
    { url: 'https://www.youtube.com/watch?v=iEeouu1mwiI', title: 'Runway 활용법 6' },
    { url: 'https://www.youtube.com/watch?v=TRlwZCcuUpc', title: 'Runway 활용법 7' },
    { url: 'https://www.youtube.com/watch?v=rBmH74tpXh0', title: 'Runway 활용법 8' },
  ],
  google: [
    { url: 'https://www.youtube.com/watch?v=WmBPTQ5r8X4', title: 'Google Flow 가이드' },
    { url: 'https://www.youtube.com/watch?v=mr3IHoexK3o', title: '나노바나나 활용' },
    { url: 'https://www.youtube.com/watch?v=bQ5XN9ECBmA', title: 'Google Stitch' },
  ],
  higgsfield: [
    { url: 'https://www.youtube.com/watch?v=WefGzuy7gwA', title: 'Higgsfield 기초' },
    { url: 'https://www.youtube.com/watch?v=ogk5DKbX3FI', title: 'Higgsfield 심화' },
  ],
  adobe: [
    { url: 'https://helpx.adobe.com/kr/firefly/web.html', title: 'Adobe Firefly 공식 문서' },
    { url: 'https://www.youtube.com/watch?v=YjXRzBHziyA', title: 'Adobe AI 활용법' },
  ],
  comfyui: [
    { url: 'https://www.youtube.com/watch?v=MN4PpubmG10', title: 'ComfyUI 입문' },
    { url: 'https://www.youtube.com/watch?v=14Y0lIZtOI8', title: 'ComfyUI 워크플로우' },
  ],
  '3d': [
    { url: 'https://www.youtube.com/watch?v=IaEXLG4L06g', title: '3D AI 기초' },
    { url: 'https://www.youtube.com/watch?v=R4az7Hd-FeA', title: 'Meshy 활용' },
    { url: 'https://www.youtube.com/watch?v=MszK9mm5hTo', title: 'Varco 3D' },
    { url: 'https://www.youtube.com/watch?v=PN20RT3hCqQ', title: '3D AI 심화' },
  ],
  etc: [
    { url: 'https://www.youtube.com/watch?v=XMnHBbEGw_8', title: '기타 AI 도구' },
  ],
};

interface Post {
  id: number;
  title: string;
  content: string;
  youtube_url: string;
  created_at: string;
}

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('llm');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?category=guide&subcategory=${activeTab}`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeTab]);

  const tab = GUIDE_TABS.find(t => t.id === activeTab)!;
  const links = YOUTUBE_LINKS[activeTab] || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '36px' }}>📚</span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>AI 가이드</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px' }}>
          실무에서 바로 쓸 수 있는 AI 도구별 가이드 & 실무 팁
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid rgba(108,99,255,0.12)' }}>
        {GUIDE_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', border: '1px solid',
            borderColor: activeTab === t.id ? t.color + '80' : 'rgba(108,99,255,0.15)',
            background: activeTab === t.id ? t.color + '20' : 'rgba(255,255,255,0.02)',
            color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main content */}
        <div>
          {/* Tab header */}
          <div style={{
            background: `linear-gradient(135deg, ${tab.color}15, transparent)`,
            border: `1px solid ${tab.color}30`,
            borderRadius: '16px', padding: '24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <span style={{ fontSize: '48px', filter: `drop-shadow(0 0 16px ${tab.color}80)` }}>{tab.icon}</span>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{tab.label}</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>{tab.desc}</p>
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              로딩 중...
            </div>
          ) : posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map(post => (
                <div key={post.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.15)',
                  borderRadius: '16px', padding: '24px', transition: 'all 0.2s',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>{post.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.7' }}>{post.content}</p>
                  {post.youtube_url && (
                    <a href={post.youtube_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
                      color: '#ff6b6b', fontSize: '13px', textDecoration: 'none',
                    }}>▶ 유튜브에서 보기</a>
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '12px' }}>{post.created_at}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 40px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.1)',
              borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>아직 등록된 가이드가 없습니다</p>
              <p style={{ fontSize: '14px' }}>매주 화요일 자동으로 업데이트됩니다</p>
            </div>
          )}
        </div>

        {/* Sidebar: YouTube links */}
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.15)',
            borderRadius: '16px', padding: '24px', position: 'sticky', top: '80px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ff6b6b' }}>▶</span> 참고 영상 & 링크
            </h3>
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', padding: '12px', borderRadius: '10px', marginBottom: '8px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.1)',
                textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '13px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>
                  {link.url.includes('youtube') || link.url.includes('youtu') ? '▶' : '🔗'}
                </span>
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
