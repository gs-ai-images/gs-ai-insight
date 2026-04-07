'use client';

import { useState, useEffect } from 'react';
import { NewsPost } from './NewsDetailModal';

interface NewsWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: NewsPost) => void;
  initialData?: NewsPost | null;
}

export default function NewsWriteModal({ isOpen, onClose, onSubmit, initialData }: NewsWriteModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [tag, setTag] = useState('Hot Issue');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSummary(initialData.summary);
      setContent(initialData.content);
      setImgSrc(initialData.imgSrc);
      setSourceUrl(initialData.sourceUrl);
      setSourceName(initialData.sourceName);
      setTag(initialData.tag);
    } else {
      setTitle('');
      setSummary('');
      setContent('');
      setImgSrc('');
      setSourceUrl('');
      setSourceName('');
      setTag('Hot Issue');
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

  const handleImagePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64String = event.target?.result as string;
                    setImgSrc(base64String);
                };
                reader.readAsDataURL(file);
                e.preventDefault();
            }
        }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default values mapping
    const finalSourceName = sourceName.trim() || 'AI News Tracker';
    
    let finalImgSrc = imgSrc;
    
    // Upload image if it's base64 (data URI)
    if (imgSrc.startsWith('data:image')) {
        try {
            // Convert base64 to File
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            // Assign dummy extensions based on type using string check
            const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
            const file = new File([blob], `news_upload_${Date.now()}.${ext}`, { type: blob.type });
            
            const formData = new FormData();
            formData.append('files', file);
            
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await uploadRes.json();
            
            if (data.urls && data.urls.length > 0) {
                finalImgSrc = data.urls[0];
            } else {
                alert("이미지 업로드에 실패했습니다. (응답 없음)");
                return;
            }
        } catch (err) {
            console.error("News image upload failed:", err);
            alert("이미지 업로드 중 오류가 발생했습니다.");
            return;
        }
    }
    
    const newPost: NewsPost = {
      id: initialData ? initialData.id : `news-${Date.now()}`,
      title,
      summary,
      content,
      imgSrc: finalImgSrc,
      sourceUrl,
      sourceName: finalSourceName,
      tag,
      timeLabel: initialData ? initialData.timeLabel : '방금 전 (수동 업로드)',
    };
    
    onSubmit(newPost);
    alert(initialData ? '뉴스가 성공적으로 수정되었습니다!' : '뉴스가 성공적으로 발행되었습니다!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-rose-500/30">
        <div className="flex justify-between items-center mb-6 border-b border-rose-900/50 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-rose-400">
            <i className="fa-solid fa-pen-nib text-rose-400"></i> {initialData ? 'AI 뉴스 수정' : '새 AI 뉴스 발행'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-heading mr-1"></i> 헤드라인 (제목)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition text-white font-bold text-lg"
              placeholder="뉴스 헤드라인을 입력하세요."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-quote-left mr-1"></i> 핵심 요약 (Summary)</label>
            <textarea 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-rose-500 transition text-rose-100 font-medium h-24"
              placeholder="리스트에서 보여질 1~2줄 분량의 핵심 요약을 적어주세요."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-black/30 p-4 rounded-xl border border-gray-700/50">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-tag mr-1"></i> 주요 태그</label>
              <select 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 transition cursor-pointer appearance-none"
              >
                <option value="Hot Issue">Hot Issue</option>
                <option value="Model Update">Model Update</option>
                <option value="Investment">Investment</option>
                <option value="Regulation">Regulation</option>
                <option value="Domestic">Domestic (국내)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-regular fa-image mr-1"></i> 대표 썸네일 이미지</label>
              {imgSrc ? (
                 <div className="relative w-full h-12 bg-black/50 border border-gray-600 rounded-xl px-4 flex items-center justify-between">
                     <span className="text-rose-400 text-sm font-bold truncate">이미지 1개 첨부됨</span>
                     <button type="button" onClick={() => setImgSrc('')} className="text-gray-400 hover:text-red-400 text-xs px-2 cursor-pointer transition">삭제</button>
                 </div>
              ) : (
                <input 
                  type="text" 
                  value={imgSrc}
                  onChange={(e) => setImgSrc(e.target.value)}
                  className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition text-white text-sm"
                  placeholder="URL 입력 또는 상세 내용에 Ctrl+V"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-newspaper mr-1"></i> 출처 명칭 (예: Reuters, AI Daily)</label>
              <input 
                type="text" 
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-rose-500 transition text-white text-sm"
                placeholder="자동화 에이전트 수집 시 자동 기입"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5"><i className="fa-solid fa-link mr-1"></i> 출처 원문 URL</label>
              <input 
                type="text" 
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-rose-500 transition text-white text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-300 mb-1.5 flex justify-between items-center">
                <span><i className="fa-solid fa-align-left mr-1"></i> 상세 본문</span>
                <span className="text-xs text-rose-400 font-normal bg-rose-900/30 px-2 py-0.5 rounded border border-rose-500/30">
                    입력 창에 직접 이미지 붙여넣기(Ctrl+V) 가능
                </span>
             </label>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               onPaste={handleImagePaste}
               className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-4 placeholder:text-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition text-white min-h-[300px]"
               placeholder="기사 본문 전체 내용을 작성해주세요."
               required
             ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-rose-900/50 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold bg-black border border-gray-700 hover:bg-gray-800 text-gray-300 transition cursor-pointer"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(225,29,72,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '발행하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
