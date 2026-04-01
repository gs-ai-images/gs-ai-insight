'use client';

import { useState, useEffect } from 'react';

interface AppService {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  created_at: string;
}

export default function AppsPage() {
  const [apps, setApps] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [form, setForm] = useState({ title: '', description: '', image_url: '', link_url: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAdminToken(localStorage.getItem('gsai_admin') || '');
    fetch('/api/apps').then(r => r.json()).then(data => { setApps(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.link_url) return;
    setSubmitting(true);
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, adminToken }),
    });
    if (res.ok) {
      const data = await res.json();
      setApps(prev => [{ id: data.id, ...form, created_at: new Date().toISOString() }, ...prev]);
      setForm({ title: '', description: '', image_url: '', link_url: '' });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch(`/api/apps?id=${id}&adminToken=${adminToken}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '36px' }}>🚀</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>AI 앱 서비스</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>GS가 제작한 AI 앱 서비스 모음</p>
        </div>
        {adminToken && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
            background: 'linear-gradient(135deg,#6c63ff,#4a9eff)', color: 'white', border: 'none', cursor: 'pointer',
          }}>
            + 앱 등록
          </button>
        )}
      </div>

      {/* Upload form */}
      {showForm && adminToken && (
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: '16px', padding: '28px', marginBottom: '32px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>새 앱 서비스 등록</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'title', label: '앱 이름 *', placeholder: '예: AI 이미지 생성기' },
              { key: 'link_url', label: '앱 링크 *', placeholder: 'https://...' },
              { key: 'image_url', label: '이미지 URL', placeholder: 'https://... (썸네일)' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{field.label}</label>
                <input
                  type="text"
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.25)',
                    borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>설명</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="앱에 대한 간단한 설명을 입력하세요"
                rows={2}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" disabled={submitting} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              background: 'linear-gradient(135deg,#6c63ff,#4a9eff)', color: 'white', border: 'none', cursor: 'pointer',
            }}>
              {submitting ? '등록 중...' : '등록하기'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px',
              background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}>취소</button>
          </div>
        </form>
      )}

      {/* Apps grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        </div>
      ) : apps.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {apps.map(app => (
            <div key={app.id} style={{ position: 'relative' }}>
              <a href={app.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,215,0,0.4)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 48px rgba(255,215,0,0.08)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,215,0,0.15)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
                  <div style={{
                    height: '160px',
                    background: app.image_url ? `url(${app.image_url}) center/cover no-repeat` : 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,215,0,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!app.image_url && <span style={{ fontSize: '48px' }}>🚀</span>}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{app.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>{app.description}</p>
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd700', fontSize: '13px', fontWeight: '600' }}>
                      앱 사용하기 →
                    </div>
                  </div>
                </div>
              </a>
              {adminToken && (
                <button onClick={() => handleDelete(app.id)} style={{
                  position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px',
                  borderRadius: '50%', background: 'rgba(255,0,0,0.3)', border: '1px solid rgba(255,0,0,0.5)',
                  color: 'white', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.1)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>등록된 앱이 없습니다</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>관리자가 AI 앱 서비스를 등록하면 여기에 표시됩니다</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
