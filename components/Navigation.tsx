'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/guide', label: 'AI 가이드', icon: '📚' },
  { href: '/library', label: 'AI 라이브러리', icon: '🗂️' },
  { href: '/news', label: 'AI 뉴스', icon: '📰' },
  { href: '/apps', label: 'AI 앱', icon: '🚀' },
  { href: '/tips', label: '실무 팁', icon: '💡' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    setAdminMode(!!localStorage.getItem('gsai_admin'));
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(5,5,16,0.96)' : 'rgba(5,5,16,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(108,99,255,0.12)',
        transition: 'background 0.3s ease',
      }}>
        <nav style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', height: '60px', gap: '24px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white',
              boxShadow: '0 0 14px rgba(108,99,255,0.5)',
              flexShrink: 0,
            }}>G</div>
            <span style={{ fontSize: '17px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              GS{' '}
              <span style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Insight
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hide-mobile" style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} style={{
                  textDecoration: 'none', padding: '7px 13px', borderRadius: '8px',
                  fontSize: '13.5px', fontWeight: active ? '600' : '500',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  background: active ? 'rgba(108,99,255,0.18)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(108,99,255,0.38)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <span style={{ fontSize: '15px' }}>{item.icon}</span>{item.label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {adminMode ? (
              <Link href="/admin" style={{
                textDecoration: 'none', padding: '7px 14px', borderRadius: '8px',
                background: 'linear-gradient(135deg,#6c63ff,#4a9eff)',
                color: 'white', fontSize: '13px', fontWeight: '600',
                boxShadow: '0 0 12px rgba(108,99,255,0.35)',
              }}>⚙️ 관리자</Link>
            ) : (
              <Link href="/admin" style={{
                textDecoration: 'none', padding: '7px 14px', borderRadius: '8px',
                border: '1px solid rgba(108,99,255,0.35)',
                color: 'rgba(255,255,255,0.55)', fontSize: '13px',
              }}>로그인</Link>
            )}

            {/* Hamburger */}
            <button
              className="hide-desktop"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: mobileOpen ? 'rgba(108,99,255,0.2)' : 'transparent',
                border: '1px solid rgba(108,99,255,0.25)',
                color: 'white', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div style={{
          maxHeight: mobileOpen ? '400px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          background: 'rgba(5,5,16,0.98)',
          borderBottom: mobileOpen ? '1px solid rgba(108,99,255,0.12)' : 'none',
        }}>
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} style={{
                  textDecoration: 'none', padding: '12px 16px', borderRadius: '10px',
                  color: active ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px',
                  background: active ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', gap: '10px', fontWeight: active ? '600' : '400',
                }}>
                  <span>{item.icon}</span> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}
