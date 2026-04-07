'use client';

import { useState, useEffect, useRef } from 'react';
import { LibraryPost } from './LibraryDetailModal';
import { compressImage } from '@/lib/imageUtils';

interface LibraryWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: LibraryPost) => void;
  initialData?: LibraryPost | null;
}

export default function LibraryWriteModal({ isOpen, onClose, onSubmit, initialData }: LibraryWriteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [tag, setTag] = useState('LLM');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setImages(initialData.images && initialData.images.length > 0 ? initialData.images : (initialData.imgSrc ? [initialData.imgSrc] : []));
        setTag(initialData.tag);
      } else {
        setTitle('');
        setContent('');
        setImages([]);
        setInputUrl('');
        setTag('LLM');
      }
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/') || file.type === 'video/mp4') {
        e.preventDefault();
        previewFile(file);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => previewFile(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
        try {
            const base64String = await compressImage(file, 1000, 0.6);
            setImages(prev => {
                if (prev.length >= 10) return prev;
                return [...prev, base64String];
            });
        } catch (err) {
            console.error("Image compression failed:", err);
        }
    } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setImages(prev => {
            if (prev.length >= 10) return prev;
            return [...prev, base64String];
          });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddUrl = () => {
    if (inputUrl.trim()) {
      if (images.length >= 10) {
         alert('최대 10개까지만 등록할 수 있습니다.');
         return;
      }
      setImages(prev => [...prev, inputUrl.trim()]);
      setInputUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // File conversion helper inline
    const base64ToFile = async (base64Str: string, filename: string) => {
        const res = await fetch(base64Str);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    let finalImages = [...images];
    const filesToUpload: File[] = [];
    const uploadIndices: number[] = [];

    // Identify which images are brand new base64 uploads
    for (let i = 0; i < images.length; i++) {
        if (images[i].startsWith('data:')) {
            const ext = images[i].startsWith('data:video') ? 'mp4' : 'jpg';
            const converted = await base64ToFile(images[i], `upload_${Date.now()}_${i}.${ext}`);
            filesToUpload.push(converted);
            uploadIndices.push(i);
        }
    }

    if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(f => formData.append('files', f));
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.urls && Array.isArray(data.urls)) {
                // replace local base64 with real URLs
                data.urls.forEach((url: string, idx: number) => {
                    const originalIndex = uploadIndices[idx];
                    finalImages[originalIndex] = url;
                });
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("파일 업로드 중 오류가 발생했습니다.");
            return;
        }
    }

    const newPost: LibraryPost = {
      id: initialData ? initialData.id : `lib-${Date.now()}`,
      title,
      content,
      imgSrc: finalImages.length > 0 ? finalImages[0] : '',
      images: finalImages,
      tag,
      author: initialData ? initialData.author : '나(작성자)',
      timeLabel: initialData ? initialData.timeLabel : '방금 전',
      isOwner: true,
    };
    
    try {
      await onSubmit(newPost);
      onClose();
      setTimeout(() => alert(initialData ? '라이브러리가 성공적으로 수정되었습니다!' : '라이브러리가 성공적으로 등록되었습니다!'), 50);
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-500">
            <i className="fa-solid fa-pen-nib text-amber-400"></i> {initialData ? 'AI 라이브러리 수정' : '새 라이브러리 등록'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">제목</label>
            <input 
              type="text" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 미드저니로 상세페이지 제작하기" 
              className="w-full bg-black/50 border border-gray-600 focus:border-purple-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex justify-between">
              <span>이미지/영상 첨부 (최대 10개)</span>
              <span className="text-amber-400 text-xs">{images.length} / 10개</span>
            </label>
            <div className="space-y-3">
              {images.length < 10 && (
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/mp4" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 rounded-xl font-bold transition flex items-center justify-center cursor-pointer"
                    title="내 PC에서 영상/이미지 파일 찾기"
                  >
                    <i className="fa-solid fa-folder-open"></i>
                  </button>                  
                  <input 
                    type="text" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                       }
                    }}
                    className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-2 placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-white text-sm"
                    placeholder="이미지/영상 URL 입력(엔터) 또는 파일 찾기"
                  />
                  <button type="button" onClick={handleAddUrl} className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-xl font-bold transition whitespace-nowrap text-sm cursor-pointer">
                     추가
                  </button>
                </div>
              )}
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1 hide-scroll">
                  {images.map((img, idx) => {
                    const isVideo = img.startsWith('data:video') || img.endsWith('.mp4');
                    return (
                    <div key={idx} className="relative w-16 h-16 shrink-0 border border-gray-600 rounded-lg overflow-hidden group">
                      {isVideo ? (
                         <video src={img} className="w-full h-full object-cover bg-black/30" />
                      ) : (
                         <img src={img} alt={`미리보기 ${idx+1}`} className="w-full h-full object-cover bg-black/30" />
                      )}
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-amber-600/90 text-white text-[9px] text-center font-bold py-[2px] leading-none">
                          대표
                        </span>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] cursor-pointer"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-300 mb-2">AI 툴 카테고리</label>
              <select 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 focus:border-purple-500 text-white rounded-xl px-4 py-3 outline-none transition appearance-none"
              >
                <option value="LLM">LLM</option>
                <option value="이미지AI">이미지AI</option>
                <option value="영상AI">영상AI</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-300 mb-2">외부 영상 링크 (옵션)</label>
              <input 
                type="url" 
                placeholder="https:// 유튜브 등 영상 주소" 
                className="w-full bg-black/50 border border-gray-600 focus:border-purple-500 text-white rounded-xl px-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">내용 / 프롬프트</label>
            <textarea 
              required 
              rows={24} 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="활용 사례나 노하우, 프롬프트를 자유롭게 적어주세요." 
              className="w-full bg-black/50 border border-gray-600 focus:border-purple-500 text-white rounded-xl px-4 py-3 outline-none transition resize-y min-h-[500px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/50">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl border border-gray-500 hover:bg-gray-700 transition cursor-pointer"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
