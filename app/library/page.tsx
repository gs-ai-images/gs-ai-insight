'use client';

import { useState, useEffect, useCallback } from 'react';

interface Prompt {
  id: number;
  title: string;
  prompt_text: string;
  category: string;
  image_url: string;
  tags: string;
  created_at: string;
}

interface Source {
  id: number;
  title: string;
  description: string;
  image_url: string;
  source_url: string;
  tool_name: string;
  created_at: string;
}

const PROMPT_CATEGORIES = [
  { id: '', label: '전체' },
  { id: 'image_generation', label: '🖼️ 이미지' },
  { id: 'video_generation', label: '🎬 영상' },
  { id: 'text_generation', label: '📝 텍스트' },
  { id: '3d_generation', label: '🎲 3D' },
];

export default function LibraryPage() {
  const [tab, setTab] = useState<'prompts' | 'sources'>('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const [pForm, setPForm] = useState({ title: '', prompt_text: '', category: 'image_generation', image_url: '', tags: '' });
  const [sForm, setSForm] = useState({ title: '', description: '', image_url: '', source_url: '', tool_name: '' });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (tab === 'prompts') {
      const res = await fetch('/api/library?type=prompts').catch(() => null);
      if (res?.ok) setPrompts(await res.json());
    } else {
      const res = await fetch('/api/library?type=sources').catch(() => null);
      if (res?.ok) setSources(await res.json());
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setAdminToken(localStorage.getItem('gsai_admin') || '');
    fetchData();
  }, [fetchData]);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('프롬프트가 클립보드에 복사되었습니다!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pForm.title || !pForm.prompt_text) return;
    setSubmitting(true);
    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'prompts', adminToken, ...pForm }),
    });
    if (res.ok) {
      setPForm({ title: '', prompt_text: '', category: 'image_generation', image_url: '', tags: '' });
      setShowForm(false);
      fetchData();
      showToast('프롬프트가 등록되었습니다!');
    }
    setSubmitting(false);
  };

  const handleSubmitSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sForm.title) return;
    setSubmitting(true);
    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sources', adminToken, ...sForm }),
    });
    if (res.ok) {
      setSForm({ title: '', description: '', image_url: '', source_url: '', tool_name: '' });
      setShowForm(false);
      fetchData();
      showToast('소스가 등록되었습니다!');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch(`/api/library?id=${id}&type=${tab}&adminToken=${adminToken}`, { method: 'DELETE' });
    if (tab === 'prompts') setPrompts(prev => prev.filter(p => p.id !== id));
    else setSources(prev => prev.filter(s => s.id !== id));
  };

  const filteredPrompts = prompts.filter(p => {
    const matchCat = !filterCat || p.category === filterCat;
    const matchSearch = !search || p.title.includes(search) || p.prompt_text.includes(search) || p.tags?.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '36px' }}>🗂️</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>AI 라이브러리</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>선행 프롬프트와 AI 소스를 한 곳에서 관리하세요</p>
        </div>
        {adminToken && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
            background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0,212,255,0.3)',
          }}>
            {showForm ? '✕ 닫기' : '+ 새 항목 등록'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'prompts', label: '프롬프트 라이브러리', icon: '✍️', sub: '프롬프트 + 결과물' },
          { id: 'sources', label: 'AI 소스 라이브러리', icon: '🔗', sub: '이미지 + 소스 위치' },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as 'prompts' | 'sources'); setShowForm(false); }} style={{
            padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', border: '1px solid',
            borderColor: tab === t.id ? 'rgba(0,212,255,0.5)' : 'rgba(108,99,255,0.15)',
            background: tab === t.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
            color: tab === t.id ? 'white' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>{t.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div>{t.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: '400' }}>{t.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Upload form */}
      {showForm && adminToken && (
        <div style={{
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '16px', padding: '28px', marginBottom: '24px',
        }}>
          {tab === 'prompts' ? (
            <form onSubmit={handleSubmitPrompt}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>✍️ 새 프롬프트 등록</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>제목 *</label>
                  <input type="text" value={pForm.title} onChange={e => setPForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="프롬프트 제목"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>카테고리</label>
                  <select value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', background: '#0d0d20', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }}>
                    <option value="image_generation">🖼️ 이미지 생성</option>
                    <option value="video_generation">🎬 영상 생성</option>
                    <option value="text_generation">📝 텍스트</option>
                    <option value="3d_generation">🎲 3D 생성</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>태그 (쉼표 구분)</label>
                  <input type="text" value={pForm.tags} onChange={e => setPForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="cyberpunk,neon,city"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>프롬프트 내용 *</label>
                  <textarea value={pForm.prompt_text} onChange={e => setPForm(p => ({ ...p, prompt_text: e.target.value }))}
                    placeholder="영문 프롬프트를 입력하세요..." rows={4}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>결과 이미지 URL (선택)</label>
                  <input type="text" value={pForm.image_url} onChange={e => setPForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: 'white', border: 'none', cursor: 'pointer' }}>
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>취소</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitSource}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>🔗 새 소스 등록</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { key: 'title', label: '제목 *', placeholder: 'Midjourney v6 가이드', full: true },
                  { key: 'tool_name', label: 'AI 도구명', placeholder: 'Midjourney' },
                  { key: 'source_url', label: '소스 URL', placeholder: 'https://...' },
                  { key: 'image_url', label: '이미지 URL', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : undefined }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{f.label}</label>
                    <input type="text" value={sForm[f.key as keyof typeof sForm]} onChange={e => setSForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>설명</label>
                  <textarea value={sForm.description} onChange={e => setSForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="소스에 대한 설명..." rows={3}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: 'white', border: 'none', cursor: 'pointer' }}>
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>취소</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Prompt filters */}
      {tab === 'prompts' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {PROMPT_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{
              padding: '6px 14px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', border: '1px solid',
              borderColor: filterCat === cat.id ? 'rgba(0,212,255,0.5)' : 'rgba(108,99,255,0.2)',
              background: filterCat === cat.id ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: filterCat === cat.id ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.2s',
            }}>{cat.label}</button>
          ))}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="검색..."
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', padding: '7px 14px', color: 'white', fontSize: '13px', outline: 'none', width: '180px' }} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        </div>
      ) : tab === 'prompts' ? (
        filteredPrompts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredPrompts.map((item, i) => (
              <div key={item.id} className="animate-fade-in" style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: '14px', padding: '20px',
                display: 'grid', gridTemplateColumns: item.image_url ? '1fr 180px' : '1fr auto',
                gap: '16px', alignItems: 'start',
                animationDelay: `${i * 0.05}s`, opacity: 0,
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{item.title}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', whiteSpace: 'nowrap' }}>
                      {item.category === 'image_generation' ? '🖼️ 이미지' : item.category === 'video_generation' ? '🎬 영상' : item.category === '3d_generation' ? '🎲 3D' : '📝 텍스트'}
                    </span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#b0d0f0', lineHeight: '1.7', marginBottom: '10px', wordBreak: 'break-word' }}>
                    {item.prompt_text}
                  </div>
                  {item.tags && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {item.tags.split(',').filter(Boolean).map(tag => (
                        <span key={tag} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(108,99,255,0.1)', color: '#a0a0ff' }}>#{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {item.image_url && (
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: `url(${item.image_url}) center/cover no-repeat, rgba(108,99,255,0.1)`, flexShrink: 0 }} />
                  )}
                  <button onClick={() => handleCopy(item.prompt_text, item.id)} style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                    background: copiedId === item.id ? 'rgba(74,222,128,0.15)' : 'rgba(0,212,255,0.1)',
                    border: `1px solid ${copiedId === item.id ? 'rgba(74,222,128,0.4)' : 'rgba(0,212,255,0.3)'}`,
                    color: copiedId === item.id ? '#4ade80' : '#00d4ff', cursor: 'pointer',
                  }}>
                    {copiedId === item.id ? '✓ 복사됨' : '📋 복사'}
                  </button>
                  {adminToken && (
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '11px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff6b6b', cursor: 'pointer', whiteSpace: 'nowrap' }}>삭제</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="✍️" title="등록된 프롬프트가 없습니다" desc={adminToken ? "'+ 새 항목 등록' 버튼으로 프롬프트를 추가하세요" : "관리자가 프롬프트를 등록하면 여기에 표시됩니다"} />
        )
      ) : (
        sources.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {sources.map((item, i) => (
              <div key={item.id} className="animate-fade-in" style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: '14px', overflow: 'hidden', transition: 'all 0.3s',
                animationDelay: `${i * 0.05}s`, opacity: 0,
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,0.35)'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 40px rgba(0,212,255,0.08)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,0.1)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
                {item.image_url && (
                  <div style={{ height: '140px', background: `url(${item.image_url}) center/cover no-repeat` }} />
                )}
                {!item.image_url && (
                  <div style={{ height: '80px', background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(108,99,255,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🔗</div>
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', lineHeight: '1.3' }}>{item.title}</h3>
                    {adminToken && (
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff6b6b', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}>삭제</button>
                    )}
                  </div>
                  {item.tool_name && <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(108,99,255,0.12)', color: '#a0a0ff', display: 'inline-block', marginBottom: '8px' }}>{item.tool_name}</span>}
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', marginBottom: '12px' }}>{item.description}</p>
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      소스 보러가기 →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="🔗" title="등록된 소스가 없습니다" desc="관리자가 AI 소스를 등록하면 여기에 표시됩니다" />
        )
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '20px' }}>
      <div style={{ fontSize: '60px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>{desc}</p>
    </div>
  );
}
