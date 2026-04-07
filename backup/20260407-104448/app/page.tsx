'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [promptOutput, setPromptOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // Multimodal state
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaMimeType, setMediaMimeType] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [recommendedTool, setRecommendedTool] = useState<string>('');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        processFile(file);
      }
    }
  };

  const processFile = (file: File) => {
    setMediaMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const resultStr = ev.target.result as string;
        setMediaPreview(resultStr);
        // extract base64 payload without prefix
        const base64Data = resultStr.split(',')[1];
        setMediaBase64(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaBase64(null);
    setMediaMimeType(null);
    const fileInput = document.getElementById('mediaUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const generatePrompt = async () => {
    if (!input.trim() && !mediaBase64) {
      alert('상황을 설명하거나 레퍼런스 이미지/영상을 첨부해주세요!');
      return;
    }
    
    setIsLoading(true);
    setShowResult(true);
    setRecommendedTool('');
    setPromptOutput('Gemini 3.1 멀티모달이 파일과 문맥을 분석하여 최적의 툴을 추천하고 역설계 중입니다...');

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input,
          mediaBase64,
          mediaMimeType 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API 요청 실패');
      }

      setPromptOutput(data.prompt);
      setRecommendedTool(data.tool || '추천 툴 판별 완료');
    } catch (error: any) {
      console.error(error);
      setPromptOutput(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = () => {
    if (promptOutput) {
      navigator.clipboard.writeText(promptOutput).then(() => {
        alert('프롬프트가 클립보드에 복사되었습니다.');
      });
    }
  };

  const getToolTheme = () => {
    if (recommendedTool.includes('Runway')) return 'emerald';
    if (recommendedTool.includes('Midjourney')) return 'blue';
    return 'purple';
  };

  const curTheme = getToolTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] pointer-events-none page-fade">
      <div className="w-full max-w-4xl text-center flex flex-col items-center pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-2xl pointer-events-auto">
          상상하는 모든 것을 <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            최적의 프롬프트
          </span>로
        </h1>
        <p className="text-gray-200 text-lg mb-8 drop-shadow-md pointer-events-auto">
          원하는 장면을 설명하거나 <b className="text-blue-300">이미지/영상을 첨부</b>하면,<br className="hidden md:block"/> 
          AI가 구조를 파악해 가장 적합한 툴을 제안하고 영문 프롬프트로 역설계 해드립니다.
        </p>
        
        <div className="w-full glass-panel rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 hover:border-blue-500/50 focus-within:border-blue-500/80 transition-colors duration-300 pointer-events-auto">
          
          {/* File Upload Button */}
          <label 
            htmlFor="mediaUpload" 
            className="cursor-pointer shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white w-12 h-12 rounded-xl transition flex items-center justify-center sm:ml-1"
            title="레퍼런스 이미지/영상 첨부"
          >
            <i className="fa-solid fa-photo-film text-xl"></i>
          </label>
          <input 
            type="file" 
            id="mediaUpload" 
            accept="image/*, video/mp4" 
            className="hidden" 
            onChange={handleMediaChange} 
          />

          {/* Media Preview Container */}
          {mediaPreview && (
            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-gray-500 shadow-inner">
              <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={removeMedia} 
                className="absolute top-0 right-0 bg-red-500/90 text-white w-5 h-5 text-xs flex items-center justify-center rounded-bl-lg hover:bg-red-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePrompt()}
            onPaste={handlePaste}
            placeholder="상황 설명 또는 파일 첨부 후 추가 요구사항 입력 (Ctrl+V로 이미지 붙여넣기 기능 지원)..." 
            className="w-full bg-transparent text-white text-base md:text-lg px-3 py-3 focus:outline-none placeholder-gray-500 min-w-0"
          />
          <button 
            onClick={generatePrompt}
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2"></i> 분석/설계 중...</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> 프롬프트 설계</>
            )}
          </button>
        </div>
        
        <div className={`w-full mt-6 glass-panel rounded-2xl p-6 text-left transition-all border border-blue-500/30 pointer-events-auto ${showResult ? 'block' : 'hidden'}`}>
          <div className="flex justify-between items-center mb-4 border-b border-gray-700/50 pb-4">
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <i className="fa-solid fa-robot text-blue-400"></i> AI 최적화 프롬프트
              </h3>
            </div>
            <button 
              onClick={copyPrompt}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2 border border-gray-600 cursor-pointer"
            >
              <i className="fa-regular fa-copy"></i> 복사하기
            </button>
          </div>
          <div className="bg-black/50 p-5 rounded-xl border border-gray-700/50 relative">
            <p className={`font-mono text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap ${isLoading ? 'text-blue-400 animate-pulse' : 'text-gray-200'}`}>
              {promptOutput}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
