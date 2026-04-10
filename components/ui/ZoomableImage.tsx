'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openFullscreen = () => {
    setIsOpen(true);
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const closeFullscreen = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    
    // Smooth scroll zooming
    const zoomSensitivity = 0.005;
    const newScale = Math.min(Math.max(1, scale - e.deltaY * zoomSensitivity), 10);
    
    // Reset position if completely zoomed out
    if (newScale === 1) {
      setPos({ x: 0, y: 0 });
    }
    
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const overlayContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => {
        // Only close if clicking the background, not the image or buttons
        if (e.target === e.currentTarget && scale === 1) {
          closeFullscreen();
        }
      }}
    >
      <button 
        onClick={closeFullscreen}
        className="absolute top-6 right-6 text-white bg-gray-800/50 hover:bg-gray-800 hover:text-cyan-400 w-12 h-12 flex items-center justify-center rounded-full transition z-10 shadow-lg cursor-pointer"
        title="닫기 (ESC)"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>

      {scale > 1 && (
        <div className="absolute top-6 left-6 text-gray-300 text-sm pointer-events-none select-none bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          <i className="fa-solid fa-hand"></i> 마우스로 드래그, 휠로 크기 조절 ({Math.round(scale * 100)}%)
        </div>
      )}

      {scale === 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm pointer-events-none select-none bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
          <i className="fa-solid fa-mouse"></i> 마우스 휠을 굴려 확대/축소하세요
        </div>
      )}

      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (scale === 1) closeFullscreen();
        }}
      >
        <img
          src={src}
          alt={alt || 'Enlarged Image'}
          draggable={false}
          className={`max-w-[95%] max-h-[95%] object-contain select-none transition-transform duration-75 ease-out ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: 'center'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent bubbling to background container
        />
      </div>
    </div>
  );

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={`cursor-zoom-in hover:opacity-95 transition-opacity ${className || ''}`}
        onClick={openFullscreen}
        title="클릭하여 이미지 확대"
      />
      {mounted && isOpen && createPortal(overlayContent, document.body)}
    </>
  );
}
