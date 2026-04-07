'use client';

import { useState, useEffect } from 'react';

export type SlideData = {
  heading: string;
  text: string;
};

export type AgentData = {
  tag: string;
  tagColor: string;
  title: string;
  youtubeId: string;
  slides: SlideData[];
};

interface SlideViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AgentData | null;
}

export default function SlideViewerModal({ isOpen, onClose, data }: SlideViewerModalProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const curTheme = data.tagColor;

  // Shadow calculation logic based on theme
  const getShadowColor = () => {
    switch (curTheme) {
      case 'rose': return 'rgba(244,63,94,0.15)';
      case 'emerald': return 'rgba(16,185,129,0.15)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex justify-center p-0 pointer-events-auto overflow-y-auto page-fade bg-black/60 backdrop-blur-sm">
      {/* Notion-style Document Page */}
      <div 
        className="relative w-full max-w-4xl bg-white min-h-[100dvh] flex flex-col shadow-2xl transition-colors"
        style={{ 
          boxShadow: `0 0 50px ${getShadowColor()}`,
        }}
      >
        {/* Document Header */}
        <div className="p-8 md:p-12 pb-6 border-b border-gray-200 flex justify-between items-start">
          <div className="flex-grow pr-4">
            <span className={`text-${curTheme}-600 bg-${curTheme}-100 text-xs px-2 py-1 rounded font-bold mb-4 inline-block border border-${curTheme}-200`}>
               {data.tag}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {data.title}
            </h1>
          </div>
          <button 
            onClick={onClose} 
            className="shrink-0 bg-gray-100 text-gray-500 hover:text-gray-900 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Document Body */}
        <div className="flex flex-col p-8 md:p-12 pt-6">
          
          {/* Video Block at the top */}
          <div className="w-full bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-10">
            <iframe 
               id="youtubeFrame" 
               className="w-full aspect-video" 
               src={`https://www.youtube.com/embed/${data.youtubeId}`} 
               frameBorder="0" 
               allowFullScreen
            />
          </div>

          {/* Unrolled Slides Content */}
          <div className="flex flex-col gap-10">
            {data.slides.map((slide, idx) => (
              <div key={idx} className="flex flex-col border-l-4 pl-6" style={{ borderColor: `rgba(var(--color-${curTheme}-500, 200, 200, 200), 0.5)` }}>
                <h3 className={`text-2xl font-bold text-gray-900 mb-3`}>
                  {idx + 1}. {slide.heading}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {slide.text}
                </p>
              </div>
            ))}
          </div>
          
          {/* Go Back Button */}
          <div className="flex justify-center mt-16 mt-auto pt-8 border-t border-gray-200">
             <button 
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
             >
                <i className="fa-solid fa-arrow-left"></i> 목록으로 돌아가기
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
