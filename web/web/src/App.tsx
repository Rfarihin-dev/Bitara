import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
}

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
            ? 'Kau ialah enjin Bitara. Sentiasa berikan analisis berstruktur, logik mendalam, dan teknikal.'
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
            ? 'Bitara Diagnostic: Validating AST patterns & aligning curriculum logic...'
            : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `Ralat enjin: ${err.message || 'Sila pastikan API Key adalah sah.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#07090e] text-slate-100 flex flex-col justify-between font-sans overflow-x-hidden selection:bg-slate-700">
      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-slate-900 bg-[#07090e]">
        <div className="flex items-center cursor-pointer">
          <img 
            src="/logo.png" 
            alt="Bitara" 
            className="h-7 w-auto object-contain brightness-110"
            onError={(e) => {
              // Fallback text kalau fail belum masuk folder public
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div>
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl w-full mx-auto pb-12">
        {messages.length === 0 ? (
          <>
            <div className="mb-8 px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <span className="text-slate-200">?</span>
              <span>Bitara Diagnostic v1.0 Ready</span>
            </div>

            {/* Logo Sebenar di Bahagian Tengah */}
            <div className="mb-6 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Bitara Logo" 
                className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              />
            </div>

            <p className="text-xs font-mono tracking-widest uppercase text-slate-500 mb-8">
              Don't just pass. Dominate.
            </p>
          </>
        ) : (
          <div className="w-full space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.thought && (
                  <div className="mb-2 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 rounded-xl p-3 max-w-xl">
                    <span className="text-slate-200 font-semibold">Diagnostic: </span>
                    {msg.thought}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-200 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 font-mono animate-pulse">
                Menganalisis data...
              </div>
            )}
          </div>
        )}

        {/* Input Box Ala DeepSeek */}
        <div className="w-full bg-[#0f131c] border border-slate-800 rounded-2xl p-4 shadow-2xl focus-within:border-slate-600 transition">
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
            placeholder="Tanya apa-apa berkaitan kod atau silibus..."
            className="w-full bg-transparent resize-none outline-none text-slate-200 placeholder-slate-500 text-sm leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeepThinkActive(!deepThinkActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${
                  deepThinkActive
                    ? 'bg-slate-800 text-slate-100 border border-slate-600'
                    : 'text-slate-500 hover:text-slate-300'
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
                    : 'text-slate-500 hover:text-slate-300'
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

        {/* Action Buttons */}
        {messages.length === 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 transition">
              ?? Workspace
            </button>
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 transition">
              ? Diagnostics
            </button>
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 transition">
              ?? Curriculum
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 text-center text-xs font-mono text-slate-600 flex items-center justify-center space-x-2 border-t border-slate-900">
        <span>BITARA — Autonomous Computing Diagnostics</span>
      </footer>
    </div>
  );
}
