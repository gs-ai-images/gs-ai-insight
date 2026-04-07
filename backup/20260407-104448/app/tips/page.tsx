"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, Send, X } from "lucide-react";
import { format } from "date-fns";

export default function TipsPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tips");
      const data = await res.json();
      setTips(Array.isArray(data) ? data : []);
    } catch {
      //
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setShowForm(false);
        fetchTips(); // reload
      } else {
        alert("You must be logged in to post.");
      }
    } catch (e) {
      alert("Failed to submit");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 font-sans selection:bg-purple-300">
      
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-50 shadow-sm border-b border-neutral-100">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 hover:scale-95 transition-transform text-black group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <span className="font-extrabold text-xl tracking-tighter uppercase text-purple-900">Free Board</span>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 active:scale-95"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        
        <div className="mb-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600">
             <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-purple-900">Share Your <br/><span className="text-purple-600">AI Tips</span></h1>
          <p className="text-lg text-neutral-500 font-medium max-w-xl">
            A community board to share your personal AI hacks, prompts, and insights with other GS employees.
          </p>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-purple-100 mb-12 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-black uppercase mb-6 text-purple-900">New Post</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
                className="w-full p-4 bg-neutral-50 border-none rounded-2xl font-bold placeholder:text-neutral-400 focus:ring-4 focus:ring-purple-600/10 focus:bg-white transition-all text-neutral-800"
              />
              <textarea
                placeholder="Share your practical tips..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                className="w-full p-4 bg-neutral-50 border-none rounded-2xl font-medium placeholder:text-neutral-400 focus:ring-4 focus:ring-purple-600/10 focus:bg-white transition-all text-neutral-700 resize-none"
              />
              <div className="flex justify-end mt-4">
                 <button 
                   type="submit" 
                   disabled={submitting || !title || !content}
                   className="bg-purple-600 text-white px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
                 >
                   {submitting ? "Posting..." : <><Send className="w-4 h-4" /> Post Tip</>}
                 </button>
              </div>
            </div>
          </form>
        )}

        {/* Tip Feed */}
        <div className="space-y-6">
          {loading ? (
             <div className="flex justify-center p-12">
               <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
             </div>
          ) : tips.length > 0 ? (
            tips.map(tip => (
              <div key={tip.id} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-purple-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black uppercase tracking-tight text-neutral-800 group-hover:text-purple-700">{tip.title}</h3>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{format(new Date(tip.createdAt), 'MMM dd')}</span>
                </div>
                <div className="flex items-center gap-2 mb-6 text-xs font-bold text-neutral-500">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 uppercase">
                     {(tip.author?.name?.[0] || tip.author?.email?.[0] || '?')}
                  </div>
                  <span>{tip.author?.name || tip.author?.email?.split('@')[0] || 'Anonymous User'}</span>
                </div>
                <p className="text-neutral-600 font-medium leading-relaxed whitespace-pre-line">{tip.content}</p>
              </div>
            ))
          ) : (
             <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border border-neutral-100">
               <span className="text-neutral-400 font-black tracking-widest uppercase block mb-2">No Posts Yet</span>
               <span className="text-neutral-400 text-sm font-medium">Be the first to share an AI practical tip!</span>
             </div>
          )}
        </div>

      </main>
    </div>
  );
}
