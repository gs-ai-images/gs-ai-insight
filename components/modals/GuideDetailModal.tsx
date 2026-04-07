import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export type GuidePost = {
  id: string;
  title: string;
  content: string;
  imgSrc: string;
  images?: string[];
  tag: string;
  author: string;
  timeLabel: string;
  isOwner: boolean;
};

interface GuideDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: GuidePost | null;
  onDelete: (id: string) => void;
  onEdit?: (post: GuidePost) => void;
}

export default function GuideDetailModal({ isOpen, onClose, post, onDelete, onEdit }: GuideDetailModalProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (isOpen || zoomImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, zoomImage]);

  if (!isOpen || !post) return null;

  const handleDelete = () => {
    if (confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      try {
        onDelete(post.id);
      } catch (err) {
        console.error(err);
      }
      onClose();
      setTimeout(() => {
        alert("게시물이 삭제되었습니다.");
      }, 50);
    }
  };

  const imagesToRender = post.images && post.images.length > 0 ? post.images : (post.imgSrc ? [post.imgSrc] : []);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex items-center justify-center p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-white/95 backdrop-blur-2xl relative w-full h-full max-w-none rounded-none p-0 page-fade overflow-y-auto flex flex-col pointer-events-auto">
        
        {/* Header - Minimal Sticky Close Button */}
        <div className="flex justify-end p-4 sticky top-0 z-10 pointer-events-none">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition text-3xl cursor-pointer pointer-events-auto bg-white/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-sm">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-12 md:px-12 max-w-4xl w-full mx-auto flex-grow -mt-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{post.title}</h2>
          
          {/* Post Metadata & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
             <div className="flex items-center gap-3 flex-wrap">
               <div className="font-bold text-gray-900 flex items-center gap-1.5">
                 <i className="fa-solid fa-circle-user text-emerald-600"></i> {post.author}
               </div>
               <span className="text-gray-300">|</span>
               <div className="text-sm text-gray-500">{post.timeLabel}</div>
               <span className="text-gray-300 hidden sm:inline">|</span>
               <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-md font-bold">
                 {post.tag}
               </span>
             </div>

             {/* Visible Edit / Delete buttons for Author */}
              <div className="flex-1"></div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button 
                      onClick={() => { onClose(); onEdit(post); }}
                      className="text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> 가이드 수정
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
          
          {imagesToRender.length > 0 && (
            <div className="flex flex-col gap-6 mb-8">
              {imagesToRender.map((img, idx) => (
                <div 
                  key={idx} 
                  className="w-full flex justify-center bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-zoom-in hover:shadow-md transition"
                  onClick={() => setZoomImage(img)}
                >
                  <img 
                    src={img} 
                    className="max-h-[60vh] object-contain w-full pointer-events-none" 
                    alt={`${post.title} - 첨부 이미지 ${idx+1}`} 
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap mb-12">
            {post.content}
          </div>

          {/* Go Back button at bottom */}
          <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
             <button 
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
             >
                <i className="fa-solid fa-arrow-left"></i> 목록으로 돌아가기
             </button>
          </div>
        </div>
        
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out page-fade overflow-hidden"
          onClick={() => {
            setZoomImage(null);
            setZoomScale(1);
          }}
          onWheel={(e) => {
             // Prevent the default scroll to avoid behind-content scroll, though body is hidden
             e.stopPropagation();
             setZoomScale(prev => {
                const newScale = e.deltaY < 0 ? prev + 0.15 : prev - 0.15;
                return Math.max(0.5, Math.min(newScale, 5)); // Allow scale from 0.5x to 5x
             });
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setZoomImage(null); setZoomScale(1); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-4xl p-2 z-[70] cursor-pointer transition flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img 
            src={zoomImage} 
            className="max-w-full max-h-full object-contain pointer-events-none rounded-lg shadow-2xl transition-transform duration-100 ease-out" 
            style={{ transform: `scale(${zoomScale})` }}
            alt="Enlarged" 
          />
        </div>
      )}
    </div>
  );
}
