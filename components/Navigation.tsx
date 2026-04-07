'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import GlobalSearchModal from '@/components/modals/GlobalSearchModal';
import { SearchItem } from '@/lib/mockData';

const navItems = [
  { href: '/', label: '0. 프롬프트 챗봇', color: 'blue' },
  { href: '/guide', label: '1. AI 가이드', color: 'emerald' },
  { href: '/library', label: '2. AI 라이브러리', color: 'amber' },
  { href: '/news', label: '3. AI NEWS', color: 'rose' },
  { href: '/apps', label: '4. AI 앱 서비스', color: 'cyan' },
  { href: '/cases', label: '5. AI 사례공유', color: 'purple' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [activeColor, setActiveColor] = useState('blue');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Determine active color based on pathname
    const activeRoute = navItems.find((item) => 
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    );
    if (activeRoute) {
      setActiveColor(activeRoute.color);
    } else {
      setActiveColor('blue');
    }
    
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [pathname]);
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isSearchOpen) {
      // Only set to auto if search isn't open blocking scroll
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen, isSearchOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const colorMap: Record<string, { text: string; border: string; logo: string }> = {
    blue: { text: 'text-blue-400', border: 'border-blue-400', logo: 'text-blue-500' },
    emerald: { text: 'text-emerald-400', border: 'border-emerald-400', logo: 'text-emerald-500' },
    amber: { text: 'text-amber-400', border: 'border-amber-400', logo: 'text-amber-500' },
    rose: { text: 'text-rose-400', border: 'border-rose-400', logo: 'text-rose-500' },
    cyan: { text: 'text-cyan-400', border: 'border-cyan-400', logo: 'text-cyan-500' },
    purple: { text: 'text-purple-400', border: 'border-purple-400', logo: 'text-purple-500' },
  };

  const currentTheme = colorMap[activeColor] || colorMap['blue'];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setSearchQuery(query);
        setIsSearchOpen(true);
        setMobileMenuOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 pointer-events-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]">
              <i className={`fa-solid fa-cube text-2xl transition-colors duration-500 ${currentTheme.logo}`}></i>
              <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">GS AI Insight</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-6">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const theme = colorMap[item.color];
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={(e) => {
                      if (active) {
                        e.preventDefault();
                        window.dispatchEvent(new Event('reset-view'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`border-b-2 pb-1 transition text-sm ${
                      active 
                        ? `${theme.text} ${theme.border} font-bold` 
                        : 'text-gray-400 hover:text-white border-transparent font-medium'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="통합 검색 (Enter)..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                  }}
                  className="bg-black/40 text-white text-sm rounded-full pl-10 pr-4 py-1.5 border border-gray-600 w-48 transition-all focus:w-64 focus:outline-none focus:border-blue-500"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-2.5 text-gray-400 text-sm"></i>
              </div>
              
              {session ? (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 flex items-center">
                    {/* @ts-ignore */}
                    {session.user?.role === 'ADMIN' ? (
                      <><i className="fa-solid fa-crown text-amber-400 mr-1"></i> 관리자</>
                    ) : (
                      <><i className="fa-solid fa-user text-blue-400 mr-1"></i> {session.user?.name}</>
                    )}
                  </span>
                  <button 
                    onClick={() => signOut()}
                    className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-full text-sm font-bold shadow transition text-gray-300"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => signIn()}
                  className="hidden sm:block bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold shadow hover:from-blue-500 hover:to-indigo-500 transition"
                >
                  로그인
                </button>
              )}
              
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-white text-2xl ml-2 cursor-pointer">
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center space-y-6 text-xl font-bold page-fade pointer-events-auto">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-4xl cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          {navItems.map((item) => {
            const active = isActive(item.href);
            const theme = colorMap[item.color];
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={(e) => {
                  if (active) {
                    e.preventDefault();
                    window.dispatchEvent(new Event('reset-view'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                className={`${theme.text}`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="relative mt-8 w-3/4 max-w-sm">
            <input 
              type="text" 
              placeholder="검색 후 Enter..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(e.currentTarget.value);
              }}
              className="bg-white/10 text-white text-base rounded-full pl-10 pr-4 py-3 border border-gray-500 w-full focus:outline-none focus:border-blue-500 text-center"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-gray-400 text-base"></i>
          </div>
          
          {session ? (
            <button 
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-full text-lg font-bold shadow transition mt-4 text-gray-300"
            >
              로그아웃
            </button>
          ) : (
            <button 
              onClick={() => {
                signIn();
                setMobileMenuOpen(false);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 rounded-full text-lg font-bold shadow transition mt-4"
            >
              로그인
            </button>
          )}
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        keyword={searchQuery}
        results={searchResults}
      />
    </>
  );
}
