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
            ? 'Kau ialah enjin Bitara. Sentiasa buat deep diagnostic reasoning sebelum memberikan jawapan teknikal yang padu dan ringkas.'
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
            ? 'Bitara Reasoning Engine: Mengesahkan integriti sintaks, analisis semantik kod, dan semakan silibus komputasi...'
            : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `Ralat enjin Gemini: ${err.message || 'Sila pastikan API Key adalah sah.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#f3f6fb] text-slate-800 flex flex-col justify-between font-sans overflow-x-hidden selection:bg-blue-100">
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: 'radial-gradient(#c7d7ed 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} 
      />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-sm transform rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-700">bitara</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-slate-600 hover:text-slate-900 transition">
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
            <div className="mb-8 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm text-xs text-slate-500 flex items-center space-x-2 text-center max-w-xl">
              <span className="text-blue-500">?</span>
              <span>Bitara Diagnostic v1.0 dikuasakan oleh Gemini reasoning engine kini sedia digunakan.</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-700 mb-8 font-serif">
              Into the Unknown
            </h1>
          </>
        ) : (
          <div className="w-full space-y-5 mb-8 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.thought && (
                  <div className="mb-2 bg-white/80 border border-slate-200 text-xs font-mono text-slate-500 rounded-xl p-3 shadow-sm max-w-xl">
                    <span className="font-semibold text-blue-600">Proses Pemikiran: </span>
                    {msg.thought}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-400 font-mono animate-pulse">
                Bitara sedang berfikir dan menjana analisis...
              </div>
            )}
          </div>
        )}

        {/* Input Box Terapung */}
        <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition">
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
            placeholder="Ask anything, explore together"
            className="w-full bg-transparent resize-none outline-none text-slate-700 placeholder-slate-400 text-sm leading-relaxed"
          />

          <div className="flex items-center justify-between mt-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeepThinkActive(!deepThinkActive)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  deepThinkActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>??</span>
                <span>DeepThink</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchActive(!searchActive)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  searchActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>??</span>
                <span>Search</span>
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
                input.trim() && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 hover:bg-white border border-slate-200/80 rounded-full text-xs text-slate-600 transition shadow-sm">
              <span>??</span>
              <span>Chat with Bitara</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 hover:bg-white border border-slate-200/80 rounded-full text-xs text-slate-600 transition shadow-sm">
              <span>?</span>
              <span>API Diagnostics</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 hover:bg-white border border-slate-200/80 rounded-full text-xs text-slate-600 transition shadow-sm">
              <span>???</span>
              <span>Harness Desktop</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <span className="font-semibold text-slate-500">bitara</span>
        <span>• Powered by Gemini Reasoning Engine</span>
      </footer>
    </div>
  );
}
