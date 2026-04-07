"use client";

import { useState } from "react";
import { Sparkles, Copy, FileText, Image as ImageIcon, Video, Box, X } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "General", icon: <Sparkles className="w-4 h-4" /> },
  { id: "image_generation", label: "Image UI", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "video_generation", label: "Video Gen", icon: <Video className="w-4 h-4" /> },
  { id: "text_generation", label: "Text AI", icon: <FileText className="w-4 h-4" /> },
  { id: "3d_generation", label: "3D Models", icon: <Box className="w-4 h-4" /> },
];

export default function PromptAutomator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
       if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
             const reader = new FileReader();
             reader.onload = (event) => {
               if (event.target?.result) setUploadedImage(event.target.result as string);
             };
             reader.readAsDataURL(blob);
          }
       }
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/prompt-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, category: selectedCategory, image: uploadedImage }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        optimizedPrompt: "An error occurred. Please try again.",
        category: "error",
        tips: ["Verify network connection"],
      });
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-neutral-100 flex flex-col items-center max-w-4xl tracking-tight">
      
      <div className="flex flex-col items-center gap-3 mb-10 text-center">
        <div className="w-20 h-20 rounded-full bg-black text-[#ccff00] flex items-center justify-center shadow-2xl shadow-black/20 mb-2">
           <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900">
          Prompt Automator
        </h2>
        <p className="text-neutral-500 font-medium text-lg">
          Generate high-quality, production-ready AI prompts instantly.
        </p>
      </div>

      <div className="w-full relative">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-3 rounded-full text-sm font-black uppercase tracking-widest border transition-all flex items-center gap-2
                ${selectedCategory === cat.id 
                  ? "bg-black text-[#ccff00] border-black shadow-lg shadow-black/10 scale-105" 
                  : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                }
              `}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handlePromptSubmit} className="space-y-6 w-full">
          <div className="relative w-full bg-neutral-50/80 rounded-[2.5rem] border border-neutral-200 focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 transition-all p-4">
            {uploadedImage && (
              <div className="relative w-32 h-32 mb-4 ml-4 mt-2 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadedImage} alt="Pasted reference" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder="Describe your desired output or hit Ctrl+V to paste an image..."
              rows={uploadedImage ? 3 : 5}
              className="w-full px-6 py-4 bg-transparent border-none text-black text-xl font-medium placeholder:text-neutral-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || (!input.trim() && !uploadedImage)}
            className="w-full py-6 bg-black text-white font-black uppercase text-xl md:text-2xl tracking-tight rounded-[2.5rem] hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1"
          >
            {loading ? (
               <><div className="w-8 h-8 border-[3px] border-white/20 border-t-[#ccff00] rounded-full animate-spin" /> Auto-Optimizing...</>
            ) : (
              <>
                 Generate Optimal Prompt <ArrowRight className="w-6 h-6 text-[#ccff00]" />
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-12 bg-[#F8F9FA] rounded-[3rem] p-8 md:p-10 border border-neutral-100 animate-in fade-in slide-in-from-bottom-8 duration-500 relative shadow-xl">
             <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#ccff00] text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#ccff00]/20 border-2 border-black">
               Optimized Result
             </div>
             
             <div className="flex justify-between items-center mb-6 mt-4">
               <h4 className="text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                 <Copy className="w-5 h-5 text-neutral-400" /> Result Prompt
               </h4>
               <button 
                 onClick={handleCopy}
                 className="px-6 py-3 bg-white rounded-full border border-neutral-200 hover:bg-neutral-100 hover:border-black hover:text-black transition-all text-neutral-600 flex items-center gap-2 shadow-sm font-black uppercase tracking-widest text-[11px]"
               >
                 {copied ? 'Copied to Clipboard!' : 'Copy Prompt'}
               </button>
             </div>
             
             <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm mb-8 text-lg font-medium leading-relaxed text-black/80 whitespace-pre-wrap">
               {result.optimizedPrompt}
             </div>

             {result.tips && result.tips.length > 0 && (
               <div className="px-4">
                 <h5 className="text-[12px] font-black uppercase tracking-widest text-neutral-400 mb-4 items-center flex gap-2">
                   <Sparkles className="w-4 h-4 text-orange-400" /> Practical Tips
                 </h5>
                 <ul className="space-y-3">
                   {result.tips.map((tip: string, i: number) => (
                     <li key={i} className="flex gap-4 items-start">
                       <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                       <span className="text-[15px] font-semibold text-neutral-600 leading-snug">{tip}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal ArrowRight icon to prevent missing import
function ArrowRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
