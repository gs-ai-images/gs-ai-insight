'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LibraryDetailModal, { LibraryPost } from '@/components/modals/LibraryDetailModal';
import LibraryWriteModal from '@/components/modals/LibraryWriteModal';
import BookmarkButton from '@/components/BookmarkButton';

const initialPosts: LibraryPost[] = [];

export default function LibraryPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<LibraryPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<LibraryPost | null>(null);
  const [editingPost, setEditingPost] = useState<LibraryPost | null>(null);

  // Load saved posts from API on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts?category=library');
        if (res.ok) {
          const data = await res.json();
          // Map DB schema to LibraryPost interface
          const mappedPosts = data.map((post: any) => ({
             id: post.id,
             title: post.title,
             content: post.content,
             imgSrc: post.imageUrl || '',
             images: post.imagesData ? JSON.parse(post.imagesData) : (post.imageUrl ? [post.imageUrl] : []),
             tag: post.tag || 'LLM',
             author: post.author?.name || '관리자',
             timeLabel: post.timeLabel || '',
             isOwner: session?.user?.role === 'ADMIN' // Only Admins can modify logic for library
          }));
          setPosts(mappedPosts);
        }
      } catch (e) {
        console.error("Failed to load posts from DB", e);
      }
    };
    fetchPosts();
  }, [session]);

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

  const handleAddOrEditPost = async (submittedPost: LibraryPost) => {
    try {
        // Find if post exists
        const existingIndex = posts.findIndex(p => p.id === submittedPost.id);
        const method = existingIndex >= 0 && !submittedPost.id.startsWith('lib-') ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `/api/posts/${submittedPost.id}` : '/api/posts';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: submittedPost.title,
                content: submittedPost.content,
                category: 'library',
                imageUrl: submittedPost.imgSrc,
                imagesData: JSON.stringify(submittedPost.images || []),
                tag: submittedPost.tag,
                timeLabel: submittedPost.timeLabel
            })
        });

        if (res.ok) {
            const newDbPost = await res.json();
            const mappedPost = {
                 ...submittedPost,
                 id: newDbPost.id // Use real DB ID
            };

            setPosts(prevPosts => {
                if (method === 'PUT') {
                    return prevPosts.map(p => p.id === mappedPost.id ? mappedPost : p);
                } else {
                    return [mappedPost, ...prevPosts];
                }
            });

            if (selectedPost && selectedPost.id === submittedPost.id) {
                setSelectedPost(mappedPost);
            }
        } else {
            const errText = await res.text();
            console.error("Failed to save post", errText);
            throw new Error(`Failed to save post: ${errText}`);
        }
    } catch (err) {
        console.error(err);
        alert("DB 저장 오류가 발생했습니다.");
        throw err;
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      if (!id.startsWith('lib-')) {
          const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Delete failed");
      }
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const getTagStyle = (tag: string) => {
    if (tag.includes('LLM') || tag.includes('프롬프트')) return 'bg-blue-500/20 text-blue-300';
    if (tag.includes('이미지')) return 'bg-purple-500/20 text-purple-300';
    if (tag.includes('영상')) return 'bg-emerald-500/20 text-emerald-300';
    if (tag.includes('기타')) return 'bg-rose-500/20 text-rose-300';
    return 'bg-amber-500/20 text-amber-300';
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'prompt') return post.tag.includes('LLM') || post.tag.includes('프롬프트');
    if (activeTab === 'image') return post.tag.includes('이미지');
    if (activeTab === 'video') return post.tag.includes('영상');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fa-solid fa-images text-amber-400"></i> AI 라이브러리
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            <i className="fa-solid fa-lightbulb text-amber-500/70"></i> AI 프롬프트, 이미지, 영상 제작에 필요한 실무 백과사전입니다.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingPost(null);
              setIsWriteModalOpen(true);
            }}
            className="mt-4 md:mt-0 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition flex items-center gap-2 text-sm cursor-pointer"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> 자료 업로드
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-4 mb-8 pb-2 hide-scroll">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`transition-all duration-300 font-bold px-6 py-2.5 rounded-xl cursor-pointer shrink-0 ${
            activeTab === 'all' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-black/50 text-gray-400 border border-gray-700 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-border-all mr-2"></i>전체 보기
        </button>
        <button 
          onClick={() => setActiveTab('prompt')} 
          className={`transition-all duration-300 font-bold px-6 py-2.5 rounded-xl cursor-pointer shrink-0 ${
            activeTab === 'prompt' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-black/50 text-gray-400 border border-gray-700 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-terminal mr-2"></i>프롬프트 라이브러리
        </button>
        <button 
          onClick={() => setActiveTab('image')} 
          className={`transition-all duration-300 font-bold px-6 py-2.5 rounded-xl cursor-pointer shrink-0 ${
            activeTab === 'image' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-black/50 text-gray-400 border border-gray-700 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-image mr-2"></i>이미지 라이브러리
        </button>
        <button 
          onClick={() => setActiveTab('video')} 
          className={`transition-all duration-300 font-bold px-6 py-2.5 rounded-xl cursor-pointer shrink-0 ${
            activeTab === 'video' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-black/50 text-gray-400 border border-gray-700 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-video mr-2"></i>영상 라이브러리
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i>
          <p>등록된 라이브러리가 없습니다.<br/>첫 번째 자료를 등록해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-fade">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`glass-panel rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-500/50 transition-all relative ${
                post.isOwner ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''
              }`}
            >
              <div className="absolute top-3 right-3 z-10 pointer-events-auto">
                <BookmarkButton id={post.id} />
              </div>

              {post.imgSrc ? (
                <div className="relative pointer-events-none">
                  {post.imgSrc.startsWith('data:video') || post.imgSrc.endsWith('.mp4') ? (
                    <video src={post.imgSrc} className="w-full object-cover border-b border-gray-700 aspect-[4/3] pointer-events-none" muted loop playsInline />
                  ) : (
                    <img src={post.imgSrc} className="w-full object-cover border-b border-gray-700 aspect-[4/3] pointer-events-none" alt={post.title} />
                  )}
                  {post.tag.includes('영상') && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
                      <i className="fa-solid fa-circle-play text-4xl text-white drop-shadow-lg"></i>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-2 bg-gradient-to-r from-amber-500 to-rose-500"></div>
              )}
              
              <div className={`p-5 ${!post.imgSrc && !post.isOwner ? 'bg-gradient-to-br from-amber-900/20 to-rose-900/20' : ''}`}>
                <span className={`${getTagStyle(post.tag)} text-xs px-2 py-1 rounded mb-2 inline-block font-bold`}>
                  {post.tag}
                </span>
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{post.content}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700/50 pt-3">
                  <span className={`flex items-center gap-1 ${post.isOwner ? 'text-amber-300' : ''}`}>
                    <i className={`fa-solid fa-circle-user ${!post.isOwner ? 'text-amber-400' : ''}`}></i> {post.author}
                  </span>
                  
                  {post.isOwner ? (
                     <span className="bg-amber-900/50 text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>
                  ) : (
                     <span>{post.timeLabel}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LibraryWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }} 
        onSubmit={handleAddOrEditPost} 
        initialData={editingPost}
      />

      <LibraryDetailModal 
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
