'use client';

import { useState, useEffect } from 'react';
import CaseDetailModal, { CasePost } from '@/components/modals/CaseDetailModal';
import CaseWriteModal from '@/components/modals/CaseWriteModal';
import BookmarkButton from '@/components/BookmarkButton';

const initialPosts: CasePost[] = [
  {
    id: 'post-1',
    title: '미드저니 V6 광고 시안 활용법',
    content: '최근 신제품 기획안 작성 시 미드저니의 style raw 파라미터를 활용해 실사 이미지를 뽑은 사례입니다. 프롬프트: A hyper-realistic cinematic shot of a futuristic product --ar 16:9 --style raw --v 6.0',
    imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
    tag: 'Midjourney',
    author: '김디자인',
    timeLabel: '2시간 전',
    isOwner: false,
  },
  {
    id: 'post-2',
    title: '엑셀 매크로 대신 파이썬 + GPT-4o',
    content: '매달 하던 데이터 취합 업무를 GPT를 통해 1분 만에 자동화했습니다. 프롬프트 구조화 방법 공유합니다.\n\n프롬프트: 첨부한 엑셀 파일들을 하나로 병합하고 피벗 테이블을 그려주는 파이썬 코드를 짜줘.',
    imgSrc: '',
    tag: 'ChatGPT',
    author: '이기획',
    timeLabel: '어제',
    isOwner: false,
  },
  {
    id: 'post-3',
    title: '모션 브러시 적용 테스트 영상',
    content: '정지된 이미지에서 하늘의 구름만 자연스럽게 움직이게 하는 세팅 팁입니다.\n\n모션 브러시 1번을 구름에 칠하고 Vertical 방향으로 2.5 값을 줍니다.',
    imgSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=600',
    tag: 'Runway',
    author: '박영상',
    timeLabel: '3일 전',
    isOwner: false,
  }
];

export default function CasesPage() {
  const [posts, setPosts] = useState<CasePost[]>(initialPosts);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CasePost | null>(null);
  const [editingPost, setEditingPost] = useState<CasePost | null>(null);

  // Load saved posts from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gs-ai-cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Append user's saved posts to the default mock list
        const userPosts = parsed.filter((p: CasePost) => p.isOwner);
        setPosts([...userPosts, ...initialPosts]);
      } catch (e) {
        console.error("Failed to load posts from localStorage", e);
      }
    }
  }, []);

  // Listen for the custom "reset-view" event fired by the navigation bar when the active tab is clicked again
  useEffect(() => {
    const handleReset = () => {
      setSelectedPost(null);
      setIsWriteModalOpen(false);
      setEditingPost(null);
    };
    window.addEventListener('reset-view', handleReset);
    return () => window.removeEventListener('reset-view', handleReset);
  }, []);

  const handleAddOrEditPost = (submittedPost: CasePost) => {
    const existingIndex = posts.findIndex(p => p.id === submittedPost.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...posts];
      updated[existingIndex] = submittedPost;
    } else {
      updated = [submittedPost, ...posts];
    }
    setPosts(updated);
    
    // Save only user-created posts
    const userPosts = updated.filter(p => p.isOwner);
    localStorage.setItem('gs-ai-cases', JSON.stringify(userPosts));
    
    // Refresh modal if we are viewing the edited post
    if (selectedPost && selectedPost.id === submittedPost.id) {
      setSelectedPost(submittedPost);
    }
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    
    // Update storage
    const userPosts = updated.filter(p => p.isOwner);
    localStorage.setItem('gs-ai-cases', JSON.stringify(userPosts));
  };

  const getTagStyle = (tag: string) => {
    if (tag.includes('Midjourney') || tag.includes('이미지AI')) return 'bg-blue-500/20 text-blue-300';
    if (tag.includes('Runway') || tag.includes('영상AI')) return 'bg-emerald-500/20 text-emerald-300';
    if (tag.includes('기타')) return 'bg-amber-500/20 text-amber-300';
    return 'bg-purple-500/20 text-purple-300'; // Default ChatGPT / LLM
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fa-solid fa-people-group text-purple-400"></i> AI 업무 사례공유
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            동료들의 실제 AI 활용 사례와 프롬프트 팁을 자유롭게 나누어보세요.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            setIsWriteModalOpen(true);
          }}
          className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition flex items-center gap-2 text-sm cursor-pointer"
        >
          <i className="fa-solid fa-pen-to-square"></i> 글 작성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-fade">
        {posts.map((post) => (
          <div 
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className={`glass-panel rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:border-purple-500/50 transition-all relative ${
              post.isOwner ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''
            }`}
          >
            <div className="absolute top-3 right-3 z-10 pointer-events-auto">
              <BookmarkButton id={post.id} />
            </div>

            {post.imgSrc ? (
              <div className="relative">
                <img src={post.imgSrc} className="w-full object-cover border-b border-gray-700 aspect-[4/3]" alt={post.title} />
                {post.tag.includes('Runway') && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
                    <i className="fa-solid fa-circle-play text-4xl text-white drop-shadow-lg"></i>
                  </div>
                )}
              </div>
            ) : (
              // Gradient wrapper for non-image posts
              <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            )}
            
            <div className={`p-5 ${!post.imgSrc && !post.isOwner ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20' : ''}`}>
              <span className={`${getTagStyle(post.tag)} text-xs px-2 py-1 rounded mb-2 inline-block font-bold`}>
                {post.tag}
              </span>
              <h3 className="font-bold text-lg mb-2">{post.title}</h3>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{post.content}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700/50 pt-3">
                <span className={`flex items-center gap-1 ${post.isOwner ? 'text-purple-300' : ''}`}>
                  <i className={`fa-solid fa-circle-user ${!post.isOwner ? 'text-purple-400' : ''}`}></i> {post.author}
                </span>
                
                {post.isOwner ? (
                   <span className="bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>
                ) : (
                   <span>{post.timeLabel}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CaseWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }} 
        onSubmit={handleAddOrEditPost} 
        initialData={editingPost}
      />

      <CaseDetailModal 
        isOpen={selectedPost !== null} 
        onClose={() => setSelectedPost(null)} 
        post={selectedPost} 
        onDelete={handleDeletePost}
        onEdit={(post) => {
          setEditingPost(post);
          setIsWriteModalOpen(true);
        }}
      />
    </div>
  );
}
