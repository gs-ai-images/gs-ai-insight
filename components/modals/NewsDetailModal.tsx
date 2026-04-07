import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  imgSrc: string;
  sourceUrl: string;
  sourceName: string;
  tag: string;
  timeLabel: string;
};

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: NewsPost | null;
  onDelete: (id: string) => void;
  onEdit?: (post: NewsPost) => void;
}

export default function NewsDetailModal({ isOpen, onClose, post, onDelete, onEdit }: NewsDetailModalProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const handleDelete = () => {
    if (confirm("정말 이 뉴스를 삭제하시겠습니까?")) {
      onDelete(post.id);
      onClose();
      alert("뉴스가 삭제되었습니다.");
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex items-center justify-center p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-white/95 backdrop-blur-2xl relative w-full h-full max-w-none rounded-none p-0 page-fade overflow-y-auto flex flex-col pointer-events-auto">
        
        {/* Header - Minimal Sticky Close Button */}
        <div className="flex justify-end p-4 sticky top-0 z-10 pointer-events-none">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition text-3xl cursor-pointer pointer-events-auto bg-white/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-sm border border-gray-200">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-12 md:px-12 max-w-4xl w-full mx-auto flex-grow -mt-4">
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-rose-100 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-md font-bold uppercase flex items-center gap-1">
               <i className="fa-solid fa-bolt"></i> {post.tag}
            </span>
            <span className="text-gray-500 text-sm font-semibold">{post.timeLabel}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight break-keep">{post.title}</h2>
          
          <div className="bg-rose-50 border-l-4 border-rose-500 p-5 mb-8 rounded-r-xl">
             <h4 className="font-bold text-rose-800 mb-2 drop-shadow-sm"><i className="fa-solid fa-quote-left mr-1 opacity-50"></i> 핵심 요약</h4>
             <p className="text-rose-900/80 font-medium leading-relaxed">{post.summary}</p>
          </div>
          
          {/* Post Metadata & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
             <div className="flex items-center gap-3 flex-wrap">
               <span className="font-bold text-gray-600 flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                 <i className="fa-solid fa-newspaper text-gray-400"></i> 출처: {post.sourceName}
               </span>
               
               {post.sourceUrl && (
                  <a 
                    href={post.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                  >
                    원문 이동 <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                  </a>
               )}
             </div>

              <div className="flex-1"></div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button 
                      onClick={() => { onClose(); onEdit(post); }}
                      className="text-sm text-white bg-rose-600 hover:bg-rose-700 transition px-4 py-2 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> 뉴스 수정
                    </button>
                  )}
                  <button 
                    onClick={handleDelete}
                    className="text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 transition px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fa-regular fa-trash-can"></i> 삭제
                  </button>
                </div>
              )}
          </div>
          
          {post.imgSrc && (
            <div className="w-full flex justify-center bg-black/5 rounded-2xl mb-10 border border-gray-200 shadow-inner overflow-hidden">
                <img 
                  src={post.imgSrc} 
                  className="max-h-[50vh] object-contain w-full" 
                  alt={post.title} 
                />
            </div>
          )}
          
          <div className="text-gray-800 leading-[2.2] tracking-wide text-lg whitespace-pre-wrap mb-16 font-medium bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {post.content}
          </div>

          {/* Go Back button at bottom */}
          <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
             <button 
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm border border-gray-300"
             >
                <i className="fa-solid fa-arrow-left"></i> 목록으로 돌아가기
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
