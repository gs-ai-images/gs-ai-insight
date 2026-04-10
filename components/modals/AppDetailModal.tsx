import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TextWithLinks from '@/components/TextWithLinks';
import ZoomableImage from '@/components/ui/ZoomableImage';

export type AppPost = {
  id: string;
  title: string;
  content: string;
  imgSrc: string;
  images?: string[];
  tag: string;
  appUrl: string;
  author: string;
  timeLabel: string;
  isOwner: boolean;
};

interface AppDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: AppPost | null;
  onDelete: (id: string) => void;
  onEdit?: (post: AppPost) => void;
}

export default function AppDetailModal({ isOpen, onClose, post, onDelete, onEdit }: AppDetailModalProps) {
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
    if (confirm("정말 이 앱 서비스를 삭제하시겠습니까?")) {
      try {
        onDelete(post.id);
      } catch (err) {
        console.error(err);
      }
      onClose();
      setTimeout(() => {
        alert("앱 서비스가 삭제되었습니다.");
      }, 50);
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition text-3xl cursor-pointer pointer-events-auto bg-white/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-sm">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-12 md:px-12 max-w-4xl w-full mx-auto flex-grow -mt-4">
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">{post.title}</h2>
            <span className="bg-cyan-100/80 text-cyan-800 border border-cyan-200 text-sm px-3 py-1 rounded-lg font-bold shadow-sm inline-block">
              {post.tag}
            </span>
          </div>
          
          {/* Post Metadata & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
             <div className="flex items-center gap-3 flex-wrap">
               <div className="font-bold text-gray-900 flex items-center gap-1.5">
                 <i className="fa-solid fa-circle-user text-cyan-600"></i> 관리자 (앱 등록)
               </div>
               <span className="text-gray-300">|</span>
               <div className="text-sm text-gray-500">{post.timeLabel}</div>
             </div>

             {/* Visible Edit / Delete buttons for Admin */}
              <div className="flex-1"></div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button 
                      onClick={() => { onClose(); onEdit(post); }}
                      className="text-sm text-white bg-cyan-600 hover:bg-cyan-700 transition px-4 py-2 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> 패치 설정 (수정)
                    </button>
                  )}
                  <button 
                    onClick={handleDelete}
                    className="text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 transition px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fa-regular fa-trash-can"></i> 스토어 삭제
                  </button>
                </div>
              )}
          </div>
          
          
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-cyan-500 pl-3">앱 서비스 소개</h3>
          
          {(post.images && post.images.length > 0) ? (
            <div className="mb-8 space-y-4">
              {post.images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex justify-center bg-gray-50">
                  <ZoomableImage 
                    src={imgUrl} 
                    alt={`${post.title} 이미지 ${idx + 1}`} 
                    className="w-full h-auto object-contain max-h-[800px]"
                  />
                </div>
              ))}
            </div>
          ) : post.imgSrc && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex justify-center bg-gray-50">
              <ZoomableImage 
                src={post.imgSrc} 
                alt={post.title} 
                className="w-full h-auto object-contain max-h-[800px]"
              />
            </div>
          )}

          <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap mb-16 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
            <TextWithLinks text={post.content} />
          </div>

        </div>
        
      </div>
    </div>
  );
}
