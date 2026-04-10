'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CaseDetailModal, { CasePost } from '@/components/modals/CaseDetailModal';
import CaseWriteModal from '@/components/modals/CaseWriteModal';
import BookmarkButton from '@/components/BookmarkButton';

const initialPosts: CasePost[] = [];

function CasesContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<CasePost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CasePost | null>(null);
  const [editingPost, setEditingPost] = useState<CasePost | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  // Load saved posts from API on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cached = sessionStorage.getItem('gs-cache-cases');
        if (cached) {
          setPosts(JSON.parse(cached));
          setIsLoading(false);
        }

        const res = await fetch('/api/posts?category=case', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const mappedPosts = data.map((post: any) => ({
             id: post.id,
             title: post.title,
             content: post.content,
             imgSrc: post.imageUrl || '',
             tag: post.tag || '기타',
             author: post.author?.name || '관리자',
             timeLabel: post.timeLabel || '',
             isOwner: session?.user?.role === 'ADMIN' || session?.user?.name === post.author?.name
          }));
          setPosts(mappedPosts);
          sessionStorage.setItem('gs-cache-cases', JSON.stringify(mappedPosts));
        }
      } catch (e) {
        console.error("Failed to load cases from DB", e);
      } finally {
        setIsLoading(false);
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

  // Handle deep link to specific post from global search
  useEffect(() => {
    const postId = searchParams.get('postId');
    if (postId && posts.length > 0) {
      const target = posts.find(p => p.id === postId);
      if (target) {
        setSelectedPost(target);
        // Clear the param so it doesn't reopen if closed
        router.replace('/cases', { scroll: false });
      }
    }
  }, [searchParams, posts, router]);

  const handleAddOrEditPost = async (submittedPost: CasePost) => {
    try {
        const existingIndex = posts.findIndex(p => p.id === submittedPost.id);
        const method = existingIndex >= 0 && !submittedPost.id.startsWith('case-') && !submittedPost.id.startsWith('post-') ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `/api/posts/${submittedPost.id}` : '/api/posts';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: submittedPost.title,
                content: submittedPost.content,
                category: 'case',
                imageUrl: submittedPost.imgSrc,
                tag: submittedPost.tag,
                timeLabel: submittedPost.timeLabel
            })
        });

        if (res.ok) {
            const newDbPost = await res.json();
            const mappedPost = { ...submittedPost, id: newDbPost.id };

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
             console.error("Failed to save case", errText);
             throw new Error(`Failed to save case: ${errText}`);
        }
    } catch (err) {
        console.error(err);
        alert("DB 저장 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      if (!id.startsWith('case-') && !id.startsWith('post-')) {
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
    if (tag.includes('Midjourney') || tag.includes('이미지AI')) return 'bg-blue-500/20 text-blue-300';
    if (tag.includes('Runway') || tag.includes('영상AI')) return 'bg-emerald-500/20 text-emerald-300';
    if (tag.includes('기타')) return 'bg-amber-500/20 text-amber-300';
    return 'bg-purple-500/20 text-purple-300'; // Default ChatGPT / LLM
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-700 pb-4">
        <div className="w-full">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fa-solid fa-people-group text-purple-400"></i> AI 업무 사례공유
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base mb-4">
            동료들의 실제 AI 활용 사례와 프롬프트 팁을 자유롭게 나누어보세요.
          </p>
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="사례 내용 검색..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-black/40 text-white text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
              autoComplete="off"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-gray-500"></i>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            setIsWriteModalOpen(true);
          }}
          className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition flex items-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap"
        >
          <i className="fa-solid fa-pen-to-square"></i> 글 작성
        </button>
      </div>

      {isLoading && posts.length === 0 ? (
        <div className="py-20 text-center w-full min-h-[50vh] flex flex-col items-center justify-center page-fade">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-purple-500"></i>
          <h3 className="text-xl font-bold text-gray-300">최신 정보를 불러오는 중입니다...</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <i className="fa-solid fa-people-group text-5xl mb-5 opacity-50 text-purple-500/50"></i>
          <p className="text-lg">등록된 자체 앱 서비스가 없습니다.<br/>{isAdmin ? '위에 있는 버튼을 눌러 첫 번째 사례를 등록해주세요.' : '관리자가 새로운 사례를 곧 추가할 예정입니다.'}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-fade">
        {posts
          .filter(post => 
            localSearch === '' || 
            post.title.toLowerCase().includes(localSearch.toLowerCase()) || 
            post.content.toLowerCase().includes(localSearch.toLowerCase()) ||
            post.tag.toLowerCase().includes(localSearch.toLowerCase())
          )
          .map((post) => (
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
      )}

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

export default function CasesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
      </div>
    }>
      <CasesContent />
    </Suspense>
  );
}
