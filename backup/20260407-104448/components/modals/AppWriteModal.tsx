'use client';

import { useState, useEffect, useRef } from 'react';
import { AppPost } from './AppDetailModal';
import { compressImage } from '@/lib/imageUtils';

interface AppWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: AppPost) => void;
  initialData?: AppPost | null;
}

export default function AppWriteModal({ isOpen, onClose, onSubmit, initialData }: AppWriteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [tag, setTag] = useState('마케팅');
  const [appUrl, setAppUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setImages(initialData.images && initialData.images.length > 0 ? initialData.images : (initialData.imgSrc ? [initialData.imgSrc] : []));
        setTag(initialData.tag);
        setAppUrl(initialData.appUrl);
      } else {
        setTitle('');
        setContent('');
        setImages([]);
        setInputUrl('');
        setTag('마케팅');
        setAppUrl('');
      }
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert("앱 아이콘 또는 이미지를 등록해주세요.");
      return;
    }

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

    const newPost: AppPost = {
      id: initialData ? initialData.id : `app-${Date.now()}`,
      title,
      content,
      imgSrc: finalImages[0],
      images: finalImages,
      tag,
      appUrl,
      author: initialData ? initialData.author : '나(작성자)',
      timeLabel: initialData ? initialData.timeLabel : '방금 전',
      isOwner: true,
    };
    
    try {
      await onSubmit(newPost);
      onClose();
      setTimeout(() => {
        alert(initialData ? '앱 정보가 성공적으로 수정되었습니다!' : '새로운 앱 서비스가 성공적으로 등록되었습니다!');
      }, 50);
    } catch (err) {
      console.error(err);
      alert("등록 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-cyan-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-cyan-400">
            <i className="fa-solid fa-rocket text-cyan-400"></i> {initialData ? '앱 서비스 수정' : '새 앱 등록'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">앱 이름 (제목)</label>
            <input 
              type="text" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: GS Auto-Blogger" 
              className="w-full bg-black/50 border border-gray-600 focus:border-cyan-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex justify-between">
              <span>이미지 첨부 (최대 10장)</span>
              <span className="text-cyan-400 text-xs">{images.length} / 10장</span>
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
                    className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-2 placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-white text-sm"
                    placeholder="이미지 URL 입력(엔터) 또는 파일 찾기"
                  />
                  <button type="button" onClick={handleAddUrl} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-xl font-bold transition whitespace-nowrap text-sm cursor-pointer">
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
                        <span className="absolute bottom-0 left-0 right-0 bg-cyan-600/90 text-white text-[9px] text-center font-bold py-[2px] leading-none">
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-300 mb-2">카테고리</label>
              <select 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 focus:border-cyan-500 text-white rounded-xl px-4 py-3 outline-none transition appearance-none"
              >
                <option value="마케팅">마케팅</option>
                <option value="생산성">생산성</option>
                <option value="번역/언어">번역/언어</option>
                <option value="기획/리서치">기획/리서치</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-300 mb-2">앱 실행 URL (선택사항)</label>
              <input 
                type="url" 
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https:// 앱으로 연결되는 주소" 
                className="w-full bg-black/50 border border-cyan-700 focus:border-cyan-400 text-white rounded-xl px-4 py-3 outline-none transition shadow-[0_0_10px_rgba(34,211,238,0.1)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">서비스 소개 및 활용 노하우</label>
            <textarea 
              required 
              rows={12} 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handleImagePaste}
              placeholder="이 앱 서비스가 어떤 기능을 제공하는지 상세히 적어주세요. (여기에 이미지를 Ctrl+V로 바로 붙여넣기할 수 있습니다.)" 
              className="w-full bg-black/50 border border-gray-600 focus:border-cyan-500 text-white rounded-xl px-4 py-3 outline-none transition resize-y min-h-[300px]"
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
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '앱 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
