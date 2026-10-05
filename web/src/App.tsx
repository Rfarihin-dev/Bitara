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
        model: 'gemini-3.8-flash',
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
    <div className="relative min-h-screen w-screen bg-black text-neutral-100 flex flex-col justify-between font-sans overflow-x-hidden selection:bg-neutral-700">
      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-neutral-900 bg-black">
        <div className="flex items-center cursor-pointer">
          <img
            src="/icon.png"
            alt="Bitara"
            className="h-7 w-auto object-contain brightness-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div>
          <button className="text-neutral-400 hover:text-white transition">
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
            <div className="mb-8 px-4 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center space-x-2">
              <span className="text-neutral-200">?</span>
              <span>Bitara Diagnostic v1.0</span>
            </div>

            <div className="mb-6 flex justify-center">
              <img
                src="/logo.png"
                alt="Bitara Logo"
                className="h-30 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              />
            </div>

            <p className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-8">
              Beyond the syntax.
            </p>
          </>
        ) : (
          <div className="w-full space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.thought && (
                  <div className="mb-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 rounded-xl p-3 max-w-xl">
                    <span className="text-neutral-200 font-semibold">Diagnostic: </span>
                    {msg.thought}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neutral-200 text-neutral-950 font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-neutral-500 font-mono animate-pulse">
                Analyzing...
              </div>
            )}
          </div>
        )}

        {/* Input Box */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl focus-within:border-neutral-600 transition">
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
            className="w-full bg-transparent resize-none outline-none text-neutral-200 placeholder-neutral-500 text-sm leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeepThinkActive(!deepThinkActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${
                  deepThinkActive
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'
                    : 'text-neutral-500 hover:text-neutral-300'
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
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'
                    : 'text-neutral-500 hover:text-neutral-300'
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
                  ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
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
            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">
              ?? Workspace
            </button>
            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">
              ? Diagnostics
            </button>
            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">
              ?? Curriculum
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 text-center text-xs font-mono text-neutral-600 flex items-center justify-center space-x-2 border-t border-neutral-900">
        <span>BITARA</span>
      </footer>
    </div>
  );
}
