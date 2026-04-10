'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SearchItem } from '@/lib/mockData';
import BookmarkButton from '@/components/BookmarkButton';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  results: SearchItem[];
}

export default function GlobalSearchModal({ isOpen, onClose, keyword, results }: GlobalSearchModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex p-4 sm:p-8 pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-7xl mx-auto pt-16 overflow-y-auto page-fade hide-scroll pointer-events-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 sticky top-0 bg-black/50 backdrop-blur-md z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <i className="fa-solid fa-magnifying-glass text-blue-400 mr-3"></i> 
            <span className="text-blue-400">'{keyword}' 통합 검색 결과 ({results.length}건)</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-4xl transition cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fa-regular fa-face-frown text-6xl mb-4"></i>
            <p className="text-xl">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="masonry-grid pb-20">
            {results.map((item) => (
              <div 
                key={item.id}
                className="masonry-item relative group rounded-2xl overflow-hidden glass-panel border border-gray-700 hover:border-blue-500/50 transition cursor-pointer"
              >
                <div className="absolute top-3 right-3 z-10 pointer-events-auto">
                  <BookmarkButton id={item.id} />
                </div>
                
                <Link href={item.href} onClick={onClose} className="block">
                  {item.imgSrc ? (
                    <div className="relative">
                      <img src={item.imgSrc} className="w-full object-cover border-b border-gray-700" alt={item.title} />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  )}
                  
                  <div className="p-5">
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded inline-block font-bold mb-2">
                      {item.tag}
                    </span>
                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4">{item.description}</p>
                    
                    <span className="text-blue-400 hover:text-blue-300 text-xs font-bold transition flex items-center gap-1">
                      이동하기 <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
