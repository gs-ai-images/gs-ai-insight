'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'all', label: '전체', icon: '✨' },
  { id: 'image_generation', label: '이미지 생성', icon: '🖼️' },
  { id: 'video_generation', label: '영상 생성', icon: '🎬' },
  { id: 'text_generation', label: '텍스트 AI', icon: '📝' },
  { id: '3d_generation', label: '3D 생성', icon: '🎲' },
  { id: 'general', label: '일반', icon: '🤖' },
];

const SECTION_CARDS = [
  { href: '/guide', icon: '📚', title: 'AI 가이드', desc: 'LLM, Midjourney, Runway 등\n실무 AI 활용 팁', color: '#6c63ff' },
  { href: '/library', icon: '🗂️', title: 'AI 라이브러리', desc: '선행 프롬프트 & AI 소스\n아카이브', color: '#00d4ff' },
  { href: '/news', icon: '📰', title: 'AI 뉴스', desc: '최신 AI 트렌드 뉴스\n매주 자동 업데이트', color: '#ff6b9d' },
  { href: '/apps', icon: '🚀', title: 'AI 앱 서비스', desc: '자체 제작 AI 앱\n서비스 모음', color: '#ffd700' },
  { href: '/tips', icon: '💡', title: '실무 팁 게시판', desc: '임직원 AI 실무 팁\n자유롭게 공유', color: '#4ade80' },
];

interface PromptResult {
  optimizedPrompt: string;
  category: string;
  tips: string[];
}

interface SearchItem {
  id: number;
  title: string;
  category: string;
  subcategory: string;
}

export default function HomePage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/prompt-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ optimizedPrompt: '오류가 발생했습니다. 다시 시도해주세요.', category: 'error', tips: [] });
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data);
      setSearchLoading(false);
    }, 400);
  };

  const categoryLabel: Record<string, string> = {
    image_generation: '🖼️ 이미지',
    video_generation: '🎬 영상',
    text_generation: '📝 텍스트',
    '3d_generation': '🎲 3D',
    general: '🤖 일반',
  };

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .fade-in { animation: fadeInUp 0.4s ease forwards; }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
            marginBottom: '24px', fontSize: '13px', color: '#a0a0ff',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6c63ff', display: 'inline-block', boxShadow: '0 0 8px #6c63ff', animation: 'shimmer 2s ease-in-out infinite' }} />
            GS 임직원을 위한 AI 인사이트 플랫폼
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', color: 'white', letterSpacing: '-1px' }}>
            AI로 더 스마트하게<br />
            <span style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4ff,#ff6b9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              일하는 방법
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', marginBottom: '48px', lineHeight: '1.7' }}>
            최적의 AI 프롬프트 생성 · AI 도구 가이드 · 최신 AI 뉴스
          </p>

          {/* Global Search Bar */}
          <div style={{ position: 'relative', maxWidth: '620px', margin: '0 auto 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '16px', padding: '8px 8px 8px 20px', backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
              <input
                type="text"
                placeholder="콘텐츠 검색 (AI 가이드, 뉴스, 팁...)"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'white', fontSize: '15px', padding: '8px 0',
                }}
              />
              {searchLoading && (
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(108,99,255,0.3)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              )}
            </div>

            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: '#0d0d20', border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: '12px', overflow: 'hidden', zIndex: 100,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}>
                {searchResults.map(item => (
                  <Link key={item.id} href={`/${item.category}`}
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', textDecoration: 'none', color: 'white',
                      borderBottom: '1px solid rgba(108,99,255,0.1)',
                    }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: 'rgba(108,99,255,0.2)', color: '#a0a0ff', whiteSpace: 'nowrap' }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '14px' }}>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prompt Chatbot */}
      <section style={{ padding: '40px 24px 80px', maxWidth: '880px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)',
          boxShadow: '0 0 80px rgba(108,99,255,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px', filter: 'drop-shadow(0 0 20px rgba(108,99,255,0.6))' }}>🤖</div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              AI 프롬프트 최적화 챗봇
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
              원하는 내용을 한국어로 입력하면 이미지·영상·3D에 최적화된 영문 프롬프트로 변환해드립니다
            </p>
          </div>

          {/* Category selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
                padding: '7px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', border: '1px solid',
                borderColor: selectedCategory === cat.id ? 'rgba(108,99,255,0.6)' : 'rgba(108,99,255,0.2)',
                background: selectedCategory === cat.id ? 'rgba(108,99,255,0.2)' : 'transparent',
                color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s',
              }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handlePromptSubmit}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePromptSubmit(e as unknown as React.FormEvent); }}}
              placeholder={selectedCategory === 'video_generation'
                ? '예: 일몰 해변에서 천천히 걷는 사람, 시네마틱 카메라 무브, 황금빛 빛...'
                : selectedCategory === 'image_generation'
                ? '예: 미래도시 배경 사이버펑크 여성, 네온 불빛, 비오는 밤, 영화적 분위기...'
                : '예: 원하는 AI 프롬프트 내용을 자유롭게 입력하세요...'}
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '12px', padding: '16px', color: 'white', fontSize: '15px',
                resize: 'vertical', outline: 'none', lineHeight: '1.6', marginBottom: '12px',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#6c63ff')}
              onBlur={e => (e.target.style.borderColor = 'rgba(108,99,255,0.25)')}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{
              width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
              background: loading || !input.trim() ? 'rgba(108,99,255,0.2)' : 'linear-gradient(135deg,#6c63ff,#4a9eff)',
              color: 'white', border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !input.trim() ? 'none' : '0 0 24px rgba(108,99,255,0.3)',
              transition: 'all 0.3s',
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  최적화 중...
                </span>
              ) : '✨ 프롬프트 최적화하기'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div style={{ marginTop: '24px' }} className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                  background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff',
                }}>
                  {categoryLabel[result.category] || '✨ ' + result.category}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>최적화 완료</span>
              </div>

              <div style={{
                background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: '12px', padding: '20px', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#7070c0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Optimized Prompt</span>
                  <button onClick={handleCopy} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                    background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(108,99,255,0.15)',
                    border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(108,99,255,0.35)'}`,
                    color: copied ? '#4ade80' : '#a0a0ff', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    {copied ? '✓ 복사됨!' : '📋 복사하기'}
                  </button>
                </div>
                <p style={{ color: '#d0d0ff', fontSize: '15px', lineHeight: '1.8', margin: 0, wordBreak: 'break-word' }}>
                  {result.optimizedPrompt}
                </p>
              </div>

              {result.tips?.length > 0 && (
                <div style={{
                  background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '12px', padding: '16px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#00d4ff', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 활용 팁</p>
                  {result.tips.map((tip, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: i < result.tips.length - 1 ? '6px' : '0' }}>
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section Cards */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
            모든 AI 리소스를 한 곳에서
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>카테고리별로 AI 콘텐츠를 탐색하세요</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {SECTION_CARDS.map(card => (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.12)',
                borderRadius: '20px', padding: '32px 20px', textAlign: 'center',
                transition: 'all 0.3s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = card.color + '55';
                el.style.background = card.color + '0d';
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = `0 20px 60px ${card.color}18`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(108,99,255,0.12)';
                el.style.background = 'rgba(255,255,255,0.02)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '42px', marginBottom: '14px', filter: `drop-shadow(0 0 12px ${card.color}80)` }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
