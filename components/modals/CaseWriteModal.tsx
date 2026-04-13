'use client';

import { useState, useEffect, useRef } from 'react';
import { CasePost } from './CaseDetailModal';
import { compressImage } from '@/lib/imageUtils';

interface CaseWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: CasePost) => void;
  initialData?: CasePost | null;
}

export default function CaseWriteModal({ isOpen, onClose, onSubmit, initialData }: CaseWriteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [tag, setTag] = useState('LLM');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      // Migrate existing imgSrc if images array doesn't exist
      setImages(initialData.images && initialData.images.length > 0 ? initialData.images : (initialData.imgSrc ? [initialData.imgSrc] : []));
      setTag(initialData.tag);
    } else {
      setTitle('');
      setContent('');
      setImages([]);
      setInputUrl('');
      setTag('LLM');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalPaste = async (e: globalThis.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                  e.preventDefault(); 
                  try {
                      const base64String = await compressImage(file, 1000, 0.6);
                      setImages(prev => {
                          if (prev.length >= 10) return prev;
                          return [...prev, base64String];
                      });
                  } catch (err) {
                      console.error("Compression failed:", err);
                  }
              }
          }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(async (file) => {
        if (file.type.startsWith('image/')) {
            try {
                const base64String = await compressImage(file, 1000, 0.6);
                setImages(prev => {
                    if (prev.length >= 10) return prev;
                    return [...prev, base64String];
                });
            } catch (err) {
                console.error("Compression failed:", err);
            }
        }
    });
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
     if (inputUrl.trim()) {
        if (images.length >= 10) {
           alert('최대 10장까지만 이미지를 등록할 수 있습니다.');
           return;
        }
        setImages(prev => [...prev, inputUrl.trim()]);
        setInputUrl('');
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base64ToFile = async (base64Str: string, filename: string) => {
        const res = await fetch(base64Str);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    let finalImages = [...images];
    const filesToUpload: File[] = [];
    const uploadIndices: number[] = [];

    for (let i = 0; i < images.length; i++) {
        if (images[i].startsWith('data:')) {
            const ext = images[i].startsWith('data:video') ? 'mp4' : images[i].startsWith('data:image/webp') ? 'webp' : 'jpg';
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
    
    const newPost: CasePost = {
      id: initialData ? initialData.id : `post-${Date.now()}`,
      title,
      content,
      imgSrc: finalImages.length > 0 ? finalImages[0] : '', // 첫번째 이미지를 대표이미지로 지정
      images: finalImages,
      tag,
      author: initialData ? initialData.author : '나(작성자)',
      timeLabel: initialData ? initialData.timeLabel : '방금 전',
      isOwner: true,
    };
    
    try {
      await onSubmit(newPost);
      onClose();
      setTimeout(() => {
        alert(initialData ? '업무 사례가 성공적으로 수정되었습니다!' : '업무 사례가 성공적으로 공유되었습니다!');
      }, 50);
    } catch (err) {
      console.error(err);
      alert("등록 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-400">
            <i className="fa-solid fa-pen-nib text-purple-400"></i> {initialData ? '업무 사례 공유 수정' : '새 업무 사례 공유'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-heading mr-1"></i> 제목</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-white"
              placeholder="예: 미드저니로 상세페이지 제작하기"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-tag mr-1"></i> AI 툴 카테고리</label>
                <select 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-black/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition cursor-pointer appearance-none"
                >
                  <option value="LLM">LLM</option>
                  <option value="이미지AI">이미지AI</option>
                  <option value="영상AI">영상AI</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-brands fa-youtube mr-1"></i> 외부 영상 링크 (옵션)</label>
                <input 
                  type="url" 
                  placeholder="https:// 유튜브 등 영상 주소" 
                  className="w-full bg-black/50 border border-gray-600 focus:border-purple-500 text-white rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
            </div>
            
            <div className="row-span-2 md:row-span-1 border-l-0 md:border-l border-gray-600/50 md:pl-5">
              <label className="block text-sm font-bold text-gray-300 mb-1.5 flex justify-between">
                <span><i className="fa-regular fa-image mr-1"></i> 이미지 첨부 (최대 10장)</span>
                <span className="text-purple-400 text-xs">{images.length} / 10장</span>
              </label>
              <div className="space-y-3">
                {images.length < 10 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex w-full gap-2 relative">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 rounded-xl font-bold transition flex items-center justify-center cursor-pointer shrink-0"
                        title="내 PC에서 이미지 파일 찾기"
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
                        className="w-full bg-black/50 border border-gray-600 rounded-xl px-3 py-2 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-white text-sm"
                        placeholder="이미지 URL(엔터)"
                      />
                      <button type="button" onClick={handleAddUrl} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl font-bold transition whitespace-nowrap text-sm cursor-pointer shrink-0">
                         추가
                      </button>
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1 hide-scroll">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 shrink-0 border border-gray-600 rounded-lg overflow-hidden group">
                        <img src={img} alt={`첨부 이미지 ${idx+1}`} className="w-full h-full object-cover bg-black/30" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-purple-600/90 text-white text-[9px] text-center font-bold py-[2px] leading-none">
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
                    ))}
                  </div>
                )}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center text-gray-400 mt-2 bg-black/20 p-4 rounded-lg border border-dashed border-purple-500/50 hover:bg-purple-900/20 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-file-import text-2xl mb-2 text-purple-400"></i>
                  <span className="text-sm font-bold text-gray-300">클릭 또는 이미지 복사/붙여넣기(Ctrl+V)</span>
                  <span className="text-xs mt-1 text-gray-500 text-center">모달창 어디서든 Ctrl+V로 이미지를 추가할 수 있습니다</span>
                </div>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-300 mb-1.5 flex justify-between items-center">
                <span><i className="fa-solid fa-align-left mr-1"></i> 내용 / 프롬프트</span>
                <span className="text-xs text-purple-400 font-normal bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30">
                    <i className="fa-solid fa-paste"></i> 로컬 파일, 이미지 URL 첨부는 물론, <b>여기에 이미지 복붙(Ctrl+V)</b> 모두 가능합니다!
                </span>
             </label>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-4 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-white min-h-[400px]"
               placeholder="활용 사례나 노하우, 프롬프트를 자유롭게 적어주세요. (이미지를 Ctrl+V로 바로 붙여넣기 할 수 있습니다.)"
               required
             ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-700/50 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
