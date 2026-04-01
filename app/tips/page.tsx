'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function TipsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myTokens, setMyTokens] = useState<string[]>([]);
  const [adminToken, setAdminToken] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('gsai_my_tokens');
    setMyTokens(stored ? JSON.parse(stored) : []);
    setAdminToken(localStorage.getItem('gsai_admin') || '');
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    fetch('/api/posts?category=tips')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, category: 'tips' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authorToken) {
        const newTokens = [...myTokens, data.authorToken];
        setMyTokens(newTokens);
        localStorage.setItem('gsai_my_tokens', JSON.stringify(newTokens));
      }
      setForm({ title: '', content: '', author: '' });
      setShowForm(false);
      fetchPosts();
    }
    setSubmitting(false);
  };

  const handleDelete = async (post: Post & { author_token?: string }) => {
    const token = myTokens.find(t => t === (post as unknown as Record<string, string>).author_token) || '';
    if (!token && !adminToken) { alert('삭제 권한이 없습니다.'); return; }
    if (!confirm('삭제하시겠습니까?')) return;

    const params = adminToken ? `adminToken=${adminToken}` : `token=${token}`;
    const res = await fetch(`/api/posts/${post.id}?${params}`, { method: 'DELETE' });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const canDelete = (post: Post & { author_token?: string }) => {
    return adminToken || myTokens.some(t => t === (post as unknown as Record<string, string>).author_token);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '36px' }}>💡</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>실무 팁 게시판</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
            임직원 누구나 AI 실무 팁을 자유롭게 공유하세요
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
          background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 0 20px rgba(74,222,128,0.3)',
        }}>
          + 팁 작성하기
        </button>
      </div>

      {/* Write form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '16px', padding: '28px', marginBottom: '32px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>새 실무 팁 작성</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>작성자 이름 (선택)</label>
            <input
              type="text"
              value={form.author}
              onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
              placeholder="이름 또는 닉네임 (비워두면 '익명')"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="팁 제목을 입력하세요"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>내용 *</label>
            <textarea
              value={form.content}
              onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="AI 실무 팁을 자세히 공유해주세요..."
              rows={5}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={submitting || !form.title.trim() || !form.content.trim()} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: 'white', border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
              {submitting ? '등록 중...' : '게시하기'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px',
              background: 'transparent', border: '1px solid rgba(74,222,128,0.2)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}>취소</button>
          </div>
        </form>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        </div>
      ) : posts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74,222,128,0.12)',
              borderRadius: '16px', padding: '24px', position: 'relative', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(74,222,128,0.3)'; el.style.background = 'rgba(74,222,128,0.03)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(74,222,128,0.12)'; el.style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', lineHeight: '1.4', flex: 1, paddingRight: '16px' }}>{post.title}</h3>
                {canDelete(post as Post & { author_token?: string }) && (
                  <button onClick={() => handleDelete(post as Post & { author_token?: string })} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                    background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)',
                    color: '#ff6b6b', cursor: 'pointer', flexShrink: 0,
                  }}>삭제</button>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.8', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                  {post.author}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>{post.created_at?.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74,222,128,0.1)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💡</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>첫 번째 AI 팁을 공유해보세요!</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>업무에서 도움이 된 AI 활용법을 동료와 나눠보세요</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
