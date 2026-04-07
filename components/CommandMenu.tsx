"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Sparkles, AppWindow, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(108,99,255,0.15)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-[13px] whitespace-nowrap">검색</span>
        <kbd className="ml-1 font-sans px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)} style={{ background: 'rgba(5,5,16,0.7)' }}>
          <div 
            className="w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ background: '#0a0a1a', border: '1px solid rgba(108,99,255,0.3)', boxShadow: '0 0 40px rgba(108,99,255,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full">
              <div className="flex items-center px-4" style={{ borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
                <Search className="w-5 h-5 mr-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <Command.Input 
                  autoFocus
                  placeholder="무엇이든 검색해보세요..." 
                  className="flex-1 py-4 text-[15px] outline-none bg-transparent"
                  style={{ color: 'white' }}
                />
                <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>ESC</kbd>
              </div>

              <Command.List className="max-h-[350px] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  검색 결과가 없습니다.
                </Command.Empty>

                <Command.Group heading="단축 이동" className="px-2 py-3 text-xs font-semibold [&_[cmdk-item]]:mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Command.Item 
                    onSelect={() => { router.push('/guide'); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5 aria-selected:bg-white/10"
                    style={{ color: 'white' }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(108,99,255,0.15)' }}><Sparkles className="w-4 h-4 text-purple-400" /></div>
                    <span className="font-semibold text-[14px]">AI 가이드 (실무 팁)</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-30" />
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/library'); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5 aria-selected:bg-white/10"
                    style={{ color: 'white' }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.15)' }}><FileText className="w-4 h-4 text-cyan-400" /></div>
                    <span className="font-semibold text-[14px]">AI 라이브러리</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-30" />
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/apps'); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5 aria-selected:bg-white/10"
                    style={{ color: 'white' }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(255,107,157,0.15)' }}><AppWindow className="w-4 h-4 text-pink-400" /></div>
                    <span className="font-semibold text-[14px]">AI 앱 서비스</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-30" />
                  </Command.Item>
                </Command.Group>
                
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
