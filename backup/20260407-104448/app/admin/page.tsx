'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  author: string;
  is_published: number;
  created_at: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'posts' | 'upload'>('posts');
  const [form, setForm] = useState({
    title: '', content: '', category: 'guide', subcategory: 'llm',
    youtube_url: '', image_url: '', link_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('gsai_admin');
    if (stored) { setLoggedIn(true); setToken(stored); fetchPosts(stored); }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('gsai_admin', data.token);
      setToken(data.token);
      setLoggedIn(true);
      setError('');
      fetchPosts(data.token);
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gsai_admin');
    setLoggedIn(false);
    setToken('');
    setPosts([]);
  };

  const fetchPosts = (t: string) => {
    setLoading(true);
    fetch('/api/posts').then(r => r.json()).then(data => { setPosts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch(`/api/posts/${id}?adminToken=${token}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handlePublishToggle = async (post: Post) => {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, is_published: post.is_published ? 0 : 1, adminToken: token }),
    });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: p.is_published ? 0 : 1 } : p));
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, adminToken: token }),
    });
    if (res.ok) {
      setForm({ title: '', content: '', category: 'guide', subcategory: 'llm', youtube_url: '', image_url: '', link_url: '' });
      fetchPosts(token);
      setTab('posts');
    }
    setSubmitting(false);
  };

  if (!loggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '40px 24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '400px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>관리자 로그인</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>GS AI Insight 관리자 페이지</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: '10px', padding: '14px 16px', color: 'white', fontSize: '15px',
                outline: 'none', marginBottom: '12px',
              }}
            />
            {error && <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
            <button type="submit" style={{
              width: '100%', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: '600',
              background: 'linear-gradient(135deg,#6c63ff,#4a9eff)', color: 'white', border: 'none', cursor: 'pointer',
            }}>
              로그인
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            기본 비밀번호: gsai2024admin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>🔧 관리자 패널</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>GS AI Insight 콘텐츠 관리</p>
        </div>
        <button onClick={handleLogout} style={{
          padding: '10px 20px', borderRadius: '10px', fontSize: '14px',
          background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)',
          color: '#ff6b6b', cursor: 'pointer',
        }}>로그아웃</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[{ id: 'posts', label: '📋 게시물 관리' }, { id: 'upload', label: '✍️ 새 글 작성' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as 'posts' | 'upload')} style={{
            padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', border: '1px solid',
            borderColor: tab === t.id ? 'rgba(108,99,255,0.5)' : 'rgba(108,99,255,0.15)',
            background: tab === t.id ? 'rgba(108,99,255,0.2)' : 'transparent',
            color: tab === t.id ? 'white' : 'rgba(255,255,255,0.4)',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'upload' && (
        <form onSubmit={handlePost} style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '16px', padding: '28px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>새 게시물 작성</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>카테고리</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{
                width: '100%', background: '#0d0d20', border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none',
              }}>
                <option value="guide">AI 가이드</option>
                <option value="news">AI 뉴스</option>
                <option value="library">AI 라이브러리</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>서브카테고리</label>
              <select value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))} style={{
                width: '100%', background: '#0d0d20', border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none',
              }}>
                <option value="llm">LLM (GPT/Claude/Gemini)</option>
                <option value="midjourney">Midjourney</option>
                <option value="runway">Runway</option>
                <option value="google">Google AI</option>
                <option value="higgsfield">Higgsfield</option>
                <option value="adobe">Adobe AI</option>
                <option value="comfyui">ComfyUI</option>
                <option value="3d">3D AI</option>
                <option value="etc">기타</option>
                <option value="main">메인</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>제목 *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="게시물 제목"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>내용 *</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="게시물 내용" rows={5}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
            </div>
            {[
              { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
              { key: 'image_url', label: '이미지 URL', placeholder: 'https://...' },
              { key: 'link_url', label: '링크 URL', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{f.label}</label>
                <input type="text" value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button type="submit" disabled={submitting || !form.title || !form.content} style={{
              padding: '12px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              background: 'linear-gradient(135deg,#6c63ff,#4a9eff)', color: 'white', border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
              {submitting ? '등록 중...' : '게시물 등록'}
            </button>
          </div>
        </form>
      )}

      {tab === 'posts' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(108,99,255,0.15)', background: 'rgba(108,99,255,0.08)' }}>
                    {['ID', '제목', '카테고리', '작성자', '날짜', '공개', '관리'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} style={{ borderBottom: '1px solid rgba(108,99,255,0.08)' }}>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>#{post.id}</td>
                      <td style={{ padding: '12px 16px', color: 'white', fontSize: '14px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: 'rgba(108,99,255,0.15)', color: '#a0a0ff' }}>{post.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{post.author}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{post.created_at?.split(' ')[0]}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handlePublishToggle(post)} style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: post.is_published ? 'rgba(74,222,128,0.12)' : 'rgba(255,0,0,0.12)',
                          border: `1px solid ${post.is_published ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,0,0.3)'}`,
                          color: post.is_published ? '#4ade80' : '#ff6b6b', cursor: 'pointer',
                        }}>
                          {post.is_published ? '공개' : '숨김'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleDelete(post.id)} style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                          background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)',
                          color: '#ff6b6b', cursor: 'pointer',
                        }}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>등록된 게시물이 없습니다.</div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
