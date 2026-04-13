'use client';

import { useState, useEffect, useRef } from 'react';
import { GuidePost } from './GuideDetailModal';
import { compressImage } from '@/lib/imageUtils';

interface GuideWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: GuidePost) => void;
  initialData?: GuidePost | null;
}

export default function GuideWriteModal({ isOpen, onClose, onSubmit, initialData }: GuideWriteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [tag, setTag] = useState('1-1. LLM');

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
      setTag('1-1. LLM');
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

  const handleImagePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
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

  if (!isOpen) return null;

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
    
    const newPost: GuidePost = {
      id: initialData ? initialData.id : `guide-${Date.now()}`,
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
        alert(initialData ? '가이드가 성공적으로 수정되었습니다!' : '가이드가 성공적으로 업로드되었습니다!');
      }, 50);
    } catch (err) {
      console.error(err);
      alert("등록 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-emerald-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
            <i className="fa-solid fa-pen-nib text-emerald-400"></i> {initialData ? 'AI 가이드 수정' : '새 가이드 등록'}
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
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-white"
              placeholder="게시물 제목을 입력하세요."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-tag mr-1"></i> 분류 설정</label>
              <select 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition cursor-pointer appearance-none"
              >
                <option value="1-1. LLM">1-1. LLM</option>
                <option value="1-2. Midjourney">1-2. Midjourney</option>
                <option value="1-3. Runway">1-3. Runway</option>
                <option value="1-4. Google">1-4. Google</option>
                <option value="1-5. Higgsfield">1-5. Higgsfield</option>
                <option value="1-6. Adobe AI">1-6. Adobe AI</option>
                <option value="1-7. ComfyUI">1-7. ComfyUI</option>
                <option value="1-8. 3D AI">1-8. 3D AI</option>
                <option value="1-9. 기타 AI">1-9. 기타 AI</option>
              </select>
            </div>
            
            <div className="row-span-2 md:row-span-1">
              <label className="block text-sm font-bold text-gray-300 mb-1.5 flex justify-between">
                <span><i className="fa-regular fa-image mr-1"></i> 이미지 첨부 (최대 10장)</span>
                <span className="text-emerald-400 text-xs">{images.length} / 10장</span>
              </label>
              <div className="space-y-3">
                {images.length < 10 && (
                  <div className="flex gap-2">
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
                      className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 rounded-xl font-bold transition flex items-center justify-center cursor-pointer"
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
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-2 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-white text-sm"
                      placeholder="이미지 URL 입력(엔터) 또는 파일 찾기"
                    />
                    <button type="button" onClick={handleAddUrl} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl font-bold transition whitespace-nowrap text-sm cursor-pointer">
                       추가
                    </button>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1 hide-scroll">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 shrink-0 border border-gray-600 rounded-lg overflow-hidden group">
                        <img src={img} alt={`첨부 이미지 ${idx+1}`} className="w-full h-full object-cover bg-black/30" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[9px] text-center font-bold py-[2px] leading-none">
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
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-300 mb-1.5 flex justify-between items-center">
                <span><i className="fa-solid fa-align-left mr-1"></i> 상세 내용</span>
                <span className="text-xs text-emerald-400 font-normal bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30">
                    <i className="fa-solid fa-paste"></i> 로컬 파일 첨부, 이미지 URL 입력, 혹은 여기에 복붙 모두 가능합니다!
                </span>
             </label>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               onPaste={handleImagePaste}
               className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-4 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-white min-h-[500px]"
               placeholder="게시물 상세 내용을 작성해주세요. (여기에 이미지를 Ctrl+V로 바로 붙여넣기 할 수 있습니다.)"
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
