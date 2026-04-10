'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuideDetailModal, { GuidePost } from '@/components/modals/GuideDetailModal';
import GuideWriteModal from '@/components/modals/GuideWriteModal';
import BookmarkButton from '@/components/BookmarkButton';

const guideTabs = [
  { id: '전체', label: '전체 게시물', icon: 'fa-border-all' },
  { id: '1-1. LLM', label: '1-1. LLM', icon: 'fa-brain' },
  { id: '1-2. Midjourney', label: '1-2. Midjourney', icon: 'fa-palette' },
  { id: '1-3. Runway', label: '1-3. Runway', icon: 'fa-clapperboard' },
  { id: '1-4. Google', label: '1-4. Google', icon: 'fa-google', brand: true },
  { id: '1-5. Higgsfield', label: '1-5. Higgsfield', icon: 'fa-atom' },
  { id: '1-6. Adobe AI', label: '1-6. Adobe AI', icon: 'fa-bezier-curve' },
  { id: '1-7. ComfyUI', label: '1-7. ComfyUI', icon: 'fa-diagram-project' },
  { id: '1-8. 3D AI', label: '1-8. 3D AI', icon: 'fa-cubes' },
  { id: '1-9. 기타 AI', label: '1-9. 기타 AI', icon: 'fa-boxes-stacked' },
];

const getBadgeStyles = (tag: string) => {
  const tab = guideTabs.find(t => t.id === tag);
  const label = tab ? tab.label.replace(/^[0-9-]+\.\s*/, '') : tag.replace(/^[0-9-]+\.\s*/, '');
  const icon = tab ? tab.icon : 'fa-wand-magic-sparkles';
  const brand = tab && tab.brand ? 'fa-brands' : 'fa-solid';

  let colorClass = 'bg-emerald-600';
  if (label.includes('LLM')) colorClass = 'bg-blue-600';
  else if (label.includes('Midjourney')) colorClass = 'bg-purple-600';
  else if (label.includes('Runway')) colorClass = 'bg-pink-600';
  else if (label.includes('Google')) colorClass = 'bg-red-500';
  else if (label.includes('Higgsfield')) colorClass = 'bg-indigo-600';
  else if (label.includes('Adobe')) colorClass = 'bg-rose-600';
  else if (label.includes('ComfyUI')) colorClass = 'bg-emerald-600';
  else if (label.includes('3D AI')) colorClass = 'bg-teal-600';
  else if (label.includes('기타')) colorClass = 'bg-gray-600';

  return { label, colorClass, icon, brand };
};

function GuideContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<GuidePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<GuidePost | null>(null);
  const [editingPost, setEditingPost] = useState<GuidePost | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load saved posts from API on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cached = sessionStorage.getItem('gs-cache-guide');
        if (cached) {
          setPosts(JSON.parse(cached));
          setIsLoading(false);
        }

        const res = await fetch('/api/posts?category=guide', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const mappedPosts = data.map((post: any) => ({
             id: post.id,
             title: post.title,
             content: post.content,
             imgSrc: post.imageUrl || '',
             images: post.imagesData ? JSON.parse(post.imagesData) : (post.imageUrl ? [post.imageUrl] : []),
             tag: post.tag || '전체',
             author: post.author?.name || '관리자',
             timeLabel: post.timeLabel || '',
             isOwner: session?.user?.role === 'ADMIN'
          }));
          setPosts(mappedPosts);
          sessionStorage.setItem('gs-cache-guide', JSON.stringify(mappedPosts));
        }
      } catch (e) {
        console.error("Failed to load guide posts from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [session]);

  // Close modals when active nav tab is clicked
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
        router.replace('/guide', { scroll: false });
      }
    }
  }, [searchParams, posts, router]);

  const handleAddOrEditPost = async (submittedPost: GuidePost) => {
    try {
        const existingIndex = posts.findIndex(p => p.id === submittedPost.id);
        const method = existingIndex >= 0 && !submittedPost.id.startsWith('guide-') ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `/api/posts/${submittedPost.id}` : '/api/posts';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: submittedPost.title,
                content: submittedPost.content,
                category: 'guide',
                imageUrl: submittedPost.imgSrc,
                imagesData: JSON.stringify(submittedPost.images || []),
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
             console.error("Failed to save post");
        }
    } catch (err) {
        console.error(err);
        alert("DB 저장 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      if (!id.startsWith('guide-')) {
          const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Delete failed");
      }
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === '전체' || post.tag === activeTab;
    const matchesSearch = localSearch === '' || 
      post.title.toLowerCase().includes(localSearch.toLowerCase()) || 
      post.content.toLowerCase().includes(localSearch.toLowerCase()) ||
      post.tag.toLowerCase().includes(localSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-5">
        <div className="w-full">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fa-solid fa-book-open-reader text-emerald-400"></i> AI 가이드 (실무 TIP)
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base flex items-center gap-2 mb-4">
            <i className="fa-solid fa-bolt text-emerald-500/70"></i> 실무에 즉시 적용 가능한 AI 활용 백서! 업무 효율을 극대화할 최신 툴 튜토리얼을 만나보세요.
          </p>
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="가이드 내용 검색..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-black/40 text-white text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-emerald-500 transition-colors"
              autoComplete="off"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-gray-500"></i>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingPost(null);
              setIsWriteModalOpen(true);
            }}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition flex items-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> 가이드 작성
          </button>
        )}
      </div>

      {/* Sub Tabs Container */}
      <div className="relative mb-6 group">
        <button 
          onClick={() => scrollTabs('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 -ml-4 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700 shadow-xl hidden md:flex"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div 
          ref={scrollContainerRef}
          className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex overflow-x-auto gap-3 pb-4 hide-scroll relative scroll-smooth"
        >
          {guideTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-all duration-300 whitespace-nowrap px-5 py-2.5 rounded-full border flex items-center gap-2 font-bold cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 text-gray-400 border-gray-700 hover:text-white hover:border-white/30'
                }`}
              >
                <i className={`${tab.brand ? 'fa-brands' : 'fa-solid'} ${tab.icon}`}></i> {tab.label}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => scrollTabs('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 -mr-4 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700 shadow-xl hidden md:flex"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* Content Area */}
      {isLoading && filteredPosts.length === 0 ? (
        <div className="py-20 text-center w-full min-h-[50vh] flex flex-col items-center justify-center page-fade">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-emerald-500"></i>
          <h3 className="text-xl font-bold text-gray-300">최신 정보를 불러오는 중입니다...</h3>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-2xl page-fade border-dashed border-gray-600">
            <i className="fa-solid fa-robot text-6xl mb-4 text-gray-600 opacity-50"></i>
            <h3 className="text-xl font-bold text-gray-300 mb-2">등록된 가이드가 없거나 AI 에이전트 수집 대기 중입니다.</h3>
            <p className="text-gray-500">직접 가이드를 작성하시거나,<br />다음 주 화요일 07:50 에 자동 업로드되는 가이드를 기다려주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-fade">
          {filteredPosts.map((post) => {
            const badge = getBadgeStyles(post.tag);
            return (
            <div 
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="glass-panel rounded-2xl p-4 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group relative" 
            >
              <div className="absolute top-6 right-6 z-10 pointer-events-auto">
                <BookmarkButton id={post.id} />
              </div>

              {post.imgSrc ? (
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img src={post.imgSrc} className="w-full aspect-video object-cover transition duration-500 group-hover:scale-110" alt={post.title} />
                  <span className={`absolute top-2 left-2 ${badge.colorClass} text-white text-xs px-2.5 py-1 rounded font-bold shadow flex items-center gap-1`}>
                    <i className={`${badge.brand} ${badge.icon}`}></i> {badge.label}
                  </span>
                </div>
              ) : (
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mb-4"></div>
              )}
              
              <h3 className="font-bold text-lg leading-snug mb-2">{post.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{post.content}</p>
              
              <div className="text-xs text-gray-500 flex items-center justify-between border-t border-gray-700/50 pt-3">
                <span className="flex items-center gap-1 font-bold">
                  <i className="fa-solid fa-circle-user text-emerald-500"></i> {post.author}
                </span>
                <span>{post.timeLabel}</span>
              </div>
            </div>
          )})}
        </div>
      )}

      <GuideWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }} 
        onSubmit={handleAddOrEditPost} 
        initialData={editingPost}
      />

      <GuideDetailModal 
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

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-500"></i>
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}
