'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NewsDetailModal, { NewsPost } from '@/components/modals/NewsDetailModal';
import NewsWriteModal from '@/components/modals/NewsWriteModal';
import BookmarkButton from '@/components/BookmarkButton';

export default function NewsClient({ initialDbPosts = [] }: { initialDbPosts?: NewsPost[] }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<NewsPost[]>(initialDbPosts);
  const [loading, setLoading] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?category=news');
      const data = await res.json();
      
      const mapped = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        imgSrc: post.imageUrl || '',
        sourceUrl: post.sourceUrl || '',
        sourceName: post.sourceName || '',
        tag: post.tag || '',
        timeLabel: post.timeLabel || '',
      }));
      
      if (JSON.stringify(mapped) !== JSON.stringify(posts)) {
        setPosts(mapped);
      }

      // If no news posts, seed the initial ones (fallback for dev)
      if (mapped.length === 0 && initialDbPosts.length === 0) {
        await fetch('/api/posts/seed-news', { method: 'POST' });
        const seededRes = await fetch('/api/posts?category=news');
        const seededData = await seededRes.json();
        setPosts(seededData.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          summary: post.summary || '',
          imgSrc: post.imageUrl || '',
          sourceUrl: post.sourceUrl || '',
          sourceName: post.sourceName || '',
          tag: post.tag || '',
          timeLabel: post.timeLabel || '',
        })));
      }
    } catch(err) {
      console.error("Failed to fetch latest posts", err);
    }
  }, [posts, initialDbPosts.length]);

  useEffect(() => {
    if (initialDbPosts.length === 0) {
      fetchPosts();
    }
  }, [fetchPosts, initialDbPosts.length]);

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
        router.replace('/news', { scroll: false });
      }
    }
  }, [searchParams, posts, router]);

  const handleAddOrEditPost = async (submittedPost: NewsPost) => {
    const isNew = submittedPost.id.startsWith('news-');
    
    const payload = {
      title: submittedPost.title,
      content: submittedPost.content,
      summary: submittedPost.summary,
      imageUrl: submittedPost.imgSrc,
      sourceUrl: submittedPost.sourceUrl,
      sourceName: submittedPost.sourceName,
      tag: submittedPost.tag,
      timeLabel: submittedPost.timeLabel,
      category: 'news'
    };
    
    if (isNew) {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Failed to save news: ${errText}`);
      }
    } else {
      const res = await fetch(`/api/posts/${submittedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Failed to update news: ${errText}`);
      }
    }
    
    await fetchPosts();
    
    // Refresh modal if editing
    if (!isNew && selectedPost && selectedPost.id === submittedPost.id) {
      setSelectedPost(submittedPost);
    }
  };

  const handleDeletePost = async (id: string) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    await fetchPosts();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="mb-6 border-b border-gray-800 pb-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full">
          <div>
            <h2 className="text-3xl font-extrabold flex items-center gap-3">
              <i className="fa-regular fa-newspaper text-rose-400"></i> AI 트렌드 뉴스
            </h2>
            <p className="text-gray-400 mt-2 text-sm flex items-center gap-2 mb-4">
              <i className="fa-solid fa-satellite-dish text-rose-500/70"></i> 
              국내/외 최신 AI 이슈를 실시간 에이전트 수집 혹은 수동으로 종합하여 요약 제공합니다.
            </p>
            <div className="relative max-w-sm w-full">
              <input 
                type="text" 
                placeholder="뉴스 내용 검색..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-black/40 text-white text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-rose-500 transition-colors"
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
              className="mt-4 md:mt-0 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition flex items-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap"
            >
              <i className="fa-solid fa-pen-to-square"></i> 뉴스 작성 / 에이전트 연동
            </button>
          )}
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="py-20 text-center w-full">
           <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-rose-500"></i>
           <h3 className="text-xl font-bold text-gray-300">최신 뉴스를 불러오는 중입니다...</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-2xl page-fade border-dashed border-rose-900/50">
            <i className="fa-solid fa-satellite text-6xl mb-4 text-rose-900/50"></i>
            <h3 className="text-xl font-bold text-gray-300 mb-2">등록된 AI 뉴스가 없습니다.</h3>
            <p className="text-gray-500">
              관리자로 로그인하여 직접 작성하시거나,<br />
              현재 대화 중인 <strong>AI 어시스턴트(저)</strong>에게 <br />
              <span className="text-rose-400">"오늘의 뉴스를 검색해서 올려줘"</span>라고 지시해 보세요!
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(250px,_auto)] page-fade">
          {posts
            .filter(post => 
              localSearch === '' || 
              post.title.toLowerCase().includes(localSearch.toLowerCase()) || 
              post.content.toLowerCase().includes(localSearch.toLowerCase()) ||
              post.tag.toLowerCase().includes(localSearch.toLowerCase())
            )
            .map((post: NewsPost, index: number) => {
            // Bento Box layout pattern (repeats every 10 items)
            const layoutPattern = [
              "md:col-span-2 md:row-span-2 flex-col",                     // 0: Hero wide & tall
              "md:col-span-1 md:row-span-2 flex-col",                     // 1: Tall vertical
              "md:col-span-1 md:row-span-1 flex-col justify-end",         // 2: Square
              "md:col-span-1 md:row-span-1 flex-col justify-end",         // 3: Square
              "md:col-span-2 md:row-span-1 flex-row items-center",        // 4: Wide horizontal
              "md:col-span-1 md:row-span-1 flex-col",                     // 5: Square
              "md:col-span-1 md:row-span-1 flex-col",                     // 6: Square
              "md:col-span-2 md:row-span-1 flex-row flex-row-reverse items-center", // 7: Wide horizontal reverse
              "md:col-span-1 md:row-span-1 flex-col",                     // 8: Square
              "md:col-span-1 md:row-span-1 flex-col",                     // 9: Square
            ];
            
            const layoutClass = layoutPattern[index % 10];
            const isWide = layoutClass.includes("flex-row");
            const isHero = index % 10 === 0;

            return (
              <div 
                key={post.id}
                className={`glass-panel rounded-3xl p-5 cursor-pointer hover:-translate-y-1 hover:border-rose-400/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-500 group relative flex overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/80 ${layoutClass}`} 
                onClick={() => setSelectedPost(post)}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                   <BookmarkButton id={post.id} />
                </div>
                
                {post.imgSrc ? (
                  <div className={`relative overflow-hidden rounded-2xl shrink-0 ${isWide ? 'w-2/5 h-full min-h-[160px] mr-4' : 'w-full mb-4'} ${isHero ? 'aspect-video' : 'aspect-square md:aspect-auto'}`}>
                    <img 
                      src={post.imgSrc} 
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" 
                      alt="News Thumbnail" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span className="absolute bottom-3 left-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs px-2.5 py-1 rounded-md font-bold shadow-lg uppercase flex items-center gap-1 backdrop-blur-md border border-white/20">
                      <i className="fa-solid fa-sparkles"></i> {post.tag || "AI Trend"}
                    </span>
                  </div>
                ) : (
                  <div className={`relative overflow-hidden rounded-2xl shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 ${isWide ? 'w-2/5 h-full min-h-[160px] mr-4' : 'w-full mb-4 aspect-video'}`}>
                    <i className="fa-solid fa-newspaper text-3xl text-gray-600"></i>
                    <span className="absolute bottom-3 left-3 bg-gray-700/80 text-white text-xs px-2.5 py-1 rounded-md font-bold shadow-lg uppercase border border-white/10">
                      {post.tag || "News"}
                    </span>
                  </div>
                )}
                
                <div className={`flex flex-col flex-grow z-10 ${isWide ? 'justify-center pl-2' : ''}`}>
                  <h3 className={`font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 group-hover:from-white group-hover:to-rose-200 transition-colors ${isHero ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} line-clamp-2`}>
                    {post.title}
                  </h3>
                  
                  {post.summary && (
                    <div className={`text-sm text-gray-400/90 mb-4 tracking-wide leading-relaxed ${isHero ? 'line-clamp-4' : 'line-clamp-2 md:line-clamp-3'}`}>
                      {post.summary.split('\n').map((line, i) => (
                        <p key={i} className="flex items-start gap-2 mb-1">
                          <span className="text-rose-500 font-bold mt-0.5">•</span>
                          <span className="flex-1">{line.replace(/^-\s*/, '')}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {!post.summary && (
                    <p className={`text-sm text-gray-400 mb-4 flex-grow ${isHero ? 'line-clamp-4' : 'line-clamp-2 md:line-clamp-3'}`}>
                      {post.content.slice(0, 150)}...
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500/80 flex items-center justify-between border-t border-gray-700/50 pt-3 mt-auto">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                        <i className="fa-solid fa-bolt text-[10px] text-rose-400"></i>
                      </div>
                      {post.sourceName || 'AI타임스'}
                    </span>
                    <span className="bg-gray-800/50 px-2 py-1 rounded-md font-medium">{post.timeLabel || new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write/Edit Modal */}
      <NewsWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }} 
        onSubmit={handleAddOrEditPost} 
        initialData={editingPost}
      />

      {/* Detail Modal */}
      <NewsDetailModal 
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
