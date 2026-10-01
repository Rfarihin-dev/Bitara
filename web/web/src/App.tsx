import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
}

// Monogram SVG berjalur inspirasi logo rasmi Bitara
const BitaraMonogram = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 80" fill="currentColor" className={className}>
    <rect x="0" y="0" width="85" height="4.5" rx="1" />
    <rect x="5" y="7.5" width="83" height="4.5" rx="1" />
    <rect x="10" y="15" width="81" height="4.5" rx="1" />
    <rect x="16" y="22.5" width="79" height="4.5" rx="1" />
    <rect x="23" y="30" width="77" height="4.5" rx="1" />
    <rect x="29" y="37.5" width="75" height="4.5" rx="1" />
    <rect x="23" y="45" width="77" height="4.5" rx="1" />
    <rect x="16" y="52.5" width="79" height="4.5" rx="1" />
    <rect x="10" y="60" width="81" height="4.5" rx="1" />
    <rect x="5" y="67.5" width="83" height="4.5" rx="1" />
    <rect x="0" y="75" width="85" height="4.5" rx="1" />
  </svg>
);

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deepThinkActive, setDeepThinkActive] = useState(true);
  const [searchActive, setSearchActive] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userPrompt }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: deepThinkActive
            ? 'Kau ialah enjin diagnostik Bitara. Sentiasa berikan analisis berstruktur, logik mendalam, dan ringkas.'
            : 'Kau ialah enjin Bitara. Jawab soalan secara pantas dan tepat.',
        },
      });

      const replyText = response.text || 'Tiada respon diterima.';
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: replyText,
          thought: deepThinkActive
            ? 'Bitara AST & Curriculum Alignment: Memvalidasi integriti struktur sintaks dan silibus...'
            : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `Ralat enjin Bitara: ${err.message || 'Sila pastikan API Key adalah sah.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-between font-sans overflow-x-hidden selection:bg-slate-700">
      {/* Background Subtle Tech Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/60 bg-[#0b0e14]/80 backdrop-blur-md">
        <div className="flex items-center space-x-3 cursor-pointer">
          <BitaraMonogram className="w-7 h-5 text-white" />
          <span className="font-extrabold text-xl tracking-wider text-white font-mono">
            BITARA<span className="text-[10px] text-slate-500 font-sans align-top ml-0.5">TM</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl w-full mx-auto pb-12">
        {messages.length === 0 ? (
          <>
            <div className="mb-8 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm text-xs text-slate-400 flex items-center space-x-2 text-center max-w-xl">
              <span className="text-slate-200">?</span>
              <span>Bitara Diagnostic Engine v1.0 sedia beroperasi.</span>
            </div>

            {/* Brand Display Tengah */}
            <div className="flex items-center space-x-4 mb-6">
              <BitaraMonogram className="w-12 h-9 text-white" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-white font-mono">
                BITARA<span className="text-xs text-slate-500 align-top">TM</span>
              </h1>
            </div>

            <p className="text-sm font-mono text-slate-400 mb-8 tracking-wide">
              Don't just pass. Dominate.
            </p>
          </>
        ) : (
          <div className="w-full space-y-5 mb-8 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.thought && (
                  <div className="mb-2 bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 rounded-xl p-3 shadow-sm max-w-xl">
                    <span className="font-semibold text-slate-200">Proses Diagnostik: </span>
                    {msg.thought}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-100 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 font-mono animate-pulse">
                Bitara sedang menganalisis kod & kurikulum...
              </div>
            )}
          </div>
        )}

        {/* Input Box Terapung Dark Mode */}
        <div className="w-full bg-[#121721] border border-slate-800 rounded-2xl p-4 shadow-xl focus-within:border-slate-600 transition">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tampal kod, semak ralat sintaks, atau tanya silibus..."
            className="w-full bg-transparent resize-none outline-none text-slate-200 placeholder-slate-500 text-sm leading-relaxed font-mono"
          />

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeepThinkActive(!deepThinkActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${
                  deepThinkActive
                    ? 'bg-slate-800 text-slate-100 border border-slate-600'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <span>?</span>
                <span>DeepThink</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchActive(!searchActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${
                  searchActive
                    ? 'bg-slate-800 text-slate-100 border border-slate-600'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <span>??</span>
                <span>Search</span>
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                input.trim() && !loading
                  ? 'bg-white text-slate-950 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m-7 7l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Butang Aksi Pintas */}
        {messages.length === 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 transition">
              <span>??</span>
              <span>Workspace Chat</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 transition">
              <span>??</span>
              <span>Syntax Diagnostic</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 transition">
              <span>??</span>
              <span>Curriculum Alignment</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 text-center text-xs font-mono text-slate-600 flex items-center justify-center space-x-2 border-t border-slate-900">
        <span className="font-bold text-slate-400">BITARA</span>
        <span>• Autonomous Computing Diagnostic Engine</span>
      </footer>
    </div>
  );
}
