'use client';

import { useState, useEffect } from 'react';
import { CasePost } from './CaseDetailModal';

interface CaseWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: CasePost) => void;
  initialData?: CasePost | null;
}

export default function CaseWriteModal({ isOpen, onClose, onSubmit, initialData }: CaseWriteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [tag, setTag] = useState('LLM');

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setImgSrc(initialData.imgSrc);
        setTag(initialData.tag);
      } else {
        setTitle('');
        setContent('');
        setImgSrc('');
        setTag('LLM');
      }
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      previewFile(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      previewFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        previewFile(file);
      }
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImgSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPost: CasePost = {
      id: initialData ? initialData.id : `post-${Date.now()}`,
      title,
      content,
      imgSrc,
      tag,
      author: initialData ? initialData.author : '나(작성자)',
      timeLabel: initialData ? initialData.timeLabel : '방금 전',
      isOwner: true,
    };
    
    onSubmit(newPost);
    alert(initialData ? '게시물이 성공적으로 수정되었습니다!' : '게시물이 성공적으로 공유되었습니다!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-modal relative w-full max-w-4xl rounded-2xl p-6 md:p-8 page-fade max-h-[90vh] overflow-y-auto pointer-events-auto border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-pen-nib text-purple-400"></i> {initialData ? '업무 사례 공유 수정' : '새 업무 사례 공유'}
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

          <div
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all outline-none focus:ring-2 focus:ring-purple-500/50 ${
              isDragging ? 'border-purple-400 bg-purple-900/30' : 'border-gray-600 bg-black/30 hover:border-purple-500 hover:bg-black/50'
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange}
            />
            {imgSrc ? (
                 <div className="absolute inset-0 p-2 pointer-events-none">
                     <img src={imgSrc} className="w-full h-full object-contain rounded-lg" alt="Upload Preview" />
                 </div>
            ) : (
                <div className="flex flex-col items-center pointer-events-none text-gray-400 hover:text-white">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                  <span className="text-sm font-bold">클릭 후 Ctrl+V 또는 이미지를 스크린으로 드래그</span>
                  <span className="text-xs mt-1 text-gray-500">JPG, PNG 파일 첨부 가능</span>
                </div>
            )}
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
              className="bg-purple-600 hover:bg-purple-500 px-8 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition cursor-pointer"
            >
              {initialData ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
