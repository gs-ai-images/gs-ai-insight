import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "GS AI Insight",
  description: "GS 임직원을 위한 AI 인사이트 플랫폼 - 프롬프트 챗봇, AI 가이드, 뉴스, 라이브러리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen grid-bg" style={{ background: '#050510' }}>
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', top: '30%', right: '-15%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '30%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(255,107,157,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <footer style={{ borderTop: '1px solid rgba(108,99,255,0.15)', background: 'rgba(0,0,0,0.3)', padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            © 2024 GS AI Insight — AI로 더 스마트한 업무를
          </footer>
        </div>
      </body>
    </html>
  );
}
