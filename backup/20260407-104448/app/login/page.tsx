'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (res?.error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] w-full pointer-events-auto px-4 mt-16">
      <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-50px] -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-[-50px] -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-user-shield text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center">관리자 시스템 접속</h1>
          <p className="text-gray-400 text-sm mt-2 text-center text-balance">
            컨텐츠 관리 및 기능 설정을 위해 계정 정보를 입력해주세요.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5 ml-1">
              아이디
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-white"
                placeholder="관리자 계정 입력"
                required
              />
              <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-400"></i>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-300 mb-1.5 ml-1">
              비밀번호
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-white"
                placeholder="비밀번호 입력"
                required
              />
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-gray-400"></i>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> 인증 처리 중...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket"></i> 로그인</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
