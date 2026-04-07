import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "GS AI Insight",
  description: "올인원 AI 포털 - 프롬프트 챗봇, AI 가이드, 라이브러리, 앱 서비스, 사례공유",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#050505] text-white overflow-x-hidden font-pretendard">
        {/* Fallback Mobile Background */}
        <div className="bg-fallback md:hidden z-[-2] pointer-events-none"></div>
        
        {/* Spline 3D Interactive Background (Desktop Only) */}
        <div className="fixed top-0 left-0 w-[100vw] h-[100vh] z-0 pointer-events-auto hidden md:block">
          <iframe 
            src="https://my.spline.design/nexbotrobotcharacterconcept-fFJgazImbtpj4fRdVIXwYBxx/" 
            frameBorder="0" 
            width="100%" 
            height="100%" 
            className="w-full h-full"
          />
        </div>

        <Providers>
          <Navigation />

          <main className="flex-grow flex flex-col items-center justify-start relative z-10 w-full mt-16 pb-20 pointer-events-none">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
