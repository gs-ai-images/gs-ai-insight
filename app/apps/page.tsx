'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppDetailModal, { AppPost } from '@/components/modals/AppDetailModal';
import AppWriteModal from '@/components/modals/AppWriteModal';

// 초기 하드코딩된 게시물들은 전부 지워달라는 요청에 따라 빈 배열로 시작합니다.
const initialApps: AppPost[] = [];

export default function AppsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<AppPost[]>(initialApps);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<AppPost | null>(null);
  const [editingPost, setEditingPost] = useState<AppPost | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  // Load saved posts from API on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cached = sessionStorage.getItem('gs-cache-apps');
        if (cached) {
          setPosts(JSON.parse(cached));
          setIsLoading(false);
        }

        const res = await fetch('/api/posts?category=app', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const mappedPosts = data.map((post: any) => ({
             id: post.id,
             title: post.title,
             content: post.content,
             imgSrc: post.imageUrl || '',
             images: post.imagesData ? JSON.parse(post.imagesData) : (post.imageUrl ? [post.imageUrl] : []),
             tag: post.tag || 'AI 서비스',
             appUrl: post.sourceUrl || '',
             author: post.author?.name || '관리자',
             timeLabel: post.timeLabel || '',
             isOwner: session?.user?.role === 'ADMIN'
          }));
          setPosts(mappedPosts);
          sessionStorage.setItem('gs-cache-apps', JSON.stringify(mappedPosts));
        }
      } catch (e) {
        console.error("Failed to load apps from DB", e);
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
        router.replace('/apps', { scroll: false });
      }
    }
  }, [searchParams, posts, router]);

  const handleAddOrEditPost = async (submittedPost: AppPost) => {
    try {
        const existingIndex = posts.findIndex(p => p.id === submittedPost.id);
        const method = existingIndex >= 0 && !submittedPost.id.startsWith('app-') ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `/api/posts/${submittedPost.id}` : '/api/posts';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: submittedPost.title,
                content: submittedPost.content,
                category: 'app',
                imageUrl: submittedPost.imgSrc,
                imagesData: JSON.stringify(submittedPost.images || []),
                tag: submittedPost.tag,
                sourceUrl: submittedPost.appUrl,
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
             console.error("Failed to save app", errText);
             throw new Error(`Failed to save app: ${errText}`);
        }
    } catch (err) {
        console.error(err);
        alert("DB 저장 오류가 발생했습니다.");
        throw err;
    }
  };


  const handleDeletePost = async (id: string) => {
    try {
      if (!id.startsWith('app-')) {
          const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Delete failed");
      }
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-5">
        <div className="w-full">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fa-solid fa-rocket text-cyan-400"></i> 자체 AI 앱 서비스
          </h2>
          <p className="text-gray-400 mt-2 text-sm mb-4">
            사내/외에서 직접 제작한 맞춤형 AI 애플리케이션을 공유하고 실행해 보세요.
          </p>
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="앱 내용 검색..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-black/40 text-white text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-cyan-500 transition-colors"
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
            className="mt-4 md:mt-0 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition flex items-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap"
          >
            <i className="fa-solid fa-link"></i> 앱서비스 연동
          </button>
        )}
      </div>
      
      {isLoading && posts.length === 0 ? (
        <div className="py-20 text-center w-full min-h-[50vh] flex flex-col items-center justify-center page-fade">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-cyan-500"></i>
          <h3 className="text-xl font-bold text-gray-300">최신 정보를 불러오는 중입니다...</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <i className="fa-solid fa-layer-group text-5xl mb-5 opacity-50 text-cyan-500/50"></i>
          <p className="text-lg">등록된 자체 앱 서비스가 없습니다.<br/>{isAdmin ? '위에 있는 버튼을 눌러 첫 번째 앱을 등록해주세요.' : '관리자가 새로운 앱을 곧 추가할 예정입니다.'}</p>
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
              className="glass-panel rounded-3xl p-6 flex flex-col border border-gray-700 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition cursor-pointer group"
            >
              {post.imgSrc ? (
                <div className="w-full h-48 mb-5 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 transform group-hover:scale-[1.02] transition duration-300">
                  <img 
                    src={post.imgSrc} 
                    className="w-full h-full object-cover" 
                    alt={post.title} 
                  />
                </div>
              ) : (
                <div className="w-full h-48 mb-5 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg border border-gray-700/50 transform group-hover:scale-[1.02] transition duration-300">
                  <i className="fa-solid fa-robot text-5xl text-white"></i>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-cyan-300 transition-colors leading-snug">{post.title}</h3>
                <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-700">{post.tag}</span>
              </div>
              
              <p className="text-base text-gray-400 flex-grow leading-relaxed line-clamp-3">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <AppWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }} 
        onSubmit={handleAddOrEditPost} 
        initialData={editingPost}
      />

      <AppDetailModal 
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
