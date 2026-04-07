'use client';

import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  id: string; // unique identifier for the item being bookmarked
}

export default function BookmarkButton({ id }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const stored = localStorage.getItem('gs_ai_bookmarks');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.includes(id)) {
        setIsBookmarked(true);
      }
    }
  }, [id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsBookmarked((prev) => {
      const newState = !prev;
      
      // Update animation state
      if (newState) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300); // match animation duration
      }
      
      // Update local storage
      const stored = localStorage.getItem('gs_ai_bookmarks');
      let parsed: string[] = stored ? JSON.parse(stored) : [];
      
      if (newState) {
        if (!parsed.includes(id)) parsed.push(id);
      } else {
        parsed = parsed.filter(itemId => itemId !== id);
      }
      
      localStorage.setItem('gs_ai_bookmarks', JSON.stringify(parsed));
      
      return newState;
    });
  };

  return (
    <button 
      onClick={toggleBookmark}
      className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-auto hover:bg-black/70 transition-colors cursor-pointer"
      title="북마크 (저장하기)"
    >
      <i 
        className={`${isBookmarked ? 'fa-solid fa-bookmark text-amber-400' : 'fa-regular fa-bookmark text-gray-400 hover:text-white'} ${animate ? 'bookmark-bounce' : ''} text-lg`}
      ></i>
    </button>
  );
}
