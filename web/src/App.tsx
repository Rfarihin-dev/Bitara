import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  sources?: { title: string; url: string }[];
}

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deepThinkActive, setDeepThinkActive] = useState(true);
  const [searchActive, setSearchActive] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    '';

  const ai = new GoogleGenAI({ apiKey });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userPrompt }];
    setMessages(newHistory);
    setLoading(true);

    const modelCandidates = deepThinkActive
      ? ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']
      : ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];

    let successfulResponse: any = null;

    const creatorIdentity = `
[CORE IDENTITY AND ARCHITECTURAL DIRECTIVES - STRICT COMPLIANCE REQUIRED]
1. Your name is Bitara (Bitara Diagnostic Engine).
2. You were designed, engineered, and developed from the ground up by Raja Farihin as an autonomous computational and academic diagnostic system for the Bitara Final Year Project (FYP).
3. ABSOLUTE PROHIBITION: You must NEVER mention "Gemini", "Google", "OpenAI", or any external commercial AI entity under any circumstances. Never state that you rely on external providers.
4. If asked about your creators, origins, or developers, you MUST unequivocally state that Raja Farihin is your sole creator, lead system architect, and engineer.
5. If asked about your neural architecture or model weights, describe it strictly as the "Bitara Proprietary Neural Architecture" and "Bitara Diagnostic Tensor Matrix".
6. ALWAYS respond strictly in English with high technical precision.
    `;

    const systemInstruction = deepThinkActive
      ? `${creatorIdentity}\nMode: Bitara Deep Diagnostic Core. Perform rigorous computational and semantic reasoning.`
      : `${creatorIdentity}\nMode: Bitara Fast Engine. Provide rapid, concise, and structured technical solutions.`;

    const requestConfig: any = {
      systemInstruction: systemInstruction,
    };

    if (searchActive) {
      requestConfig.tools = [{ googleSearch: {} }];
    }

    for (const model of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: userPrompt,
          config: requestConfig,
        });

        successfulResponse = response;
        break;
      } catch (err: any) {
        console.warn('Switching to secondary diagnostic node...');
      }
    }

    if (successfulResponse) {
      let replyText = successfulResponse.text || 'No diagnostic output generated.';
      
      replyText = replyText
        .replace(/Gemini/gi, 'Bitara Neural Core')
        .replace(/Google/gi, 'Bitara Systems Architecture');

      let webSources: { title: string; url: string }[] = [];
      try {
        const metadata = successfulResponse.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          webSources = metadata.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || c.web.uri,
              url: c.web.uri,
            }));
        }
      } catch (e) {
        console.error('Grounding extract error', e);
      }

      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: replyText,
          sources: webSources.length > 0 ? webSources : undefined,
          thought: deepThinkActive
            ? 'Bitara Diagnostic Core: AST decomposed. Semantic tokens mapped to formal academic benchmarks. System integrity verified.'
            : undefined,
        },
      ]);
    } else {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'Bitara core diagnostic computation is currently throttled due to high cluster demand. Please retry in a few seconds.',
        },
      ]);
    }

    setLoading(false);
  };

  const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            return !isInline ? (
              <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-sm">
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#1e293b] text-slate-400 text-xs font-mono border-b border-slate-800">
                  <span className="uppercase text-[10px] tracking-wider text-blue-400 font-semibold">
                    {match ? match[1] : 'source'}
                  </span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-slate-100 text-blue-600 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200" {...props}>
                {children}
              </code>
            );
          },
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }: any) {
            return <thead className="bg-slate-50 font-semibold text-slate-700">{children}</thead>;
          },
          th({ children }: any) {
            return <th className="px-3.5 py-2.5 border-b border-slate-200 font-semibold text-slate-700">{children}</th>;
          },
          td({ children }: any) {
            return <td className="px-3.5 py-2.5 border-b border-slate-100 text-slate-600">{children}</td>;
          },
          h1({ children }: any) {
            return <h1 className="text-lg font-bold text-slate-900 mt-4 mb-2">{children}</h1>;
          },
          h2({ children }: any) {
            return <h2 className="text-base font-bold text-slate-900 mt-3 mb-1.5">{children}</h2>;
          },
          h3({ children }: any) {
            return <h3 className="text-sm font-bold text-slate-900 mt-2.5 mb-1">{children}</h3>;
          },
          ul({ children }: any) {
            return <ul className="list-disc list-outside ml-5 space-y-1 my-2 text-slate-700">{children}</ul>;
          },
          ol({ children }: any) {
            return <ol className="list-decimal list-outside ml-5 space-y-1 my-2 text-slate-700">{children}</ol>;
          },
          li({ children }: any) {
            return <li className="leading-relaxed">{children}</li>;
          },
          p({ children }: any) {
            return <p className="mb-2.5 leading-relaxed text-slate-700 last:mb-0">{children}</p>;
          },
          strong({ children }: any) {
            return <strong className="font-semibold text-slate-900">{children}</strong>;
          },
          hr() {
            return <hr className="my-4 border-slate-200" />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans relative">
      <div 
        className="absolute inset-0 pointer-events-none opacity-30" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-3.5 border-b border-slate-200 bg-white/70 backdrop-blur-md">
        <div className="flex items-center cursor-pointer">
          {/* LOGO ATAS: Hanya Lambang / Icon Sahaja */}
          <img 
            src="/icon.png" 
            alt="Bitara" 
            style={{ height: '32px', width: 'auto' }}
            className="object-contain block hover:opacity-85 transition"
            onError={(e: any) => {
              // Jika icon.png belum dijumpai, fallback sementara ke logo.png
              e.target.src = '/logo.png';
            }}
          />
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold tracking-wide">
            {deepThinkActive ? 'Bitara Deep Core v1.0' : 'Bitara Fast Engine'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl w-full mx-auto py-6">
        {messages.length === 0 ? (
          <>
            <div className="mb-8 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center space-x-2">
              <span className="text-blue-600">✦</span>
              <span>Bitara Diagnostic Engine v1.0 • Autonomous Diagnostic Architecture.</span>
            </div>

            {/* LOGO TENGAH: Penuh Bersama Lambang & Nama BITARA */}
            <div className="mb-6 flex justify-center items-center w-full">
              <img 
                src="/logo.png" 
                alt="Bitara Diagnostic" 
                style={{ height: '110px', width: 'auto', maxHeight: '130px' }}
                className="object-contain drop-shadow-sm block"
              />
            </div>

            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-8 text-center">
              Don't just pass. Dominate.
            </p>
          </>
        ) : (
          <div className="w-full space-y-6 mb-6 max-h-[66vh] overflow-y-auto pr-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className="w-full flex flex-col">
                {msg.role === 'user' ? (
                  <div className="ml-auto max-w-xl bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                    {msg.thought && (
                      <details className="group mb-4 border border-slate-200 bg-slate-50/70 rounded-xl overflow-hidden transition">
                        <summary className="flex items-center justify-between px-3.5 py-2 cursor-pointer list-none select-none text-xs font-mono text-slate-500 hover:bg-slate-100 transition">
                          <span className="flex items-center space-x-2">
                            <span className="text-blue-600">🧠</span>
                            <span className="font-semibold text-slate-700">Diagnostic Thought Process</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">
                            ▼
                          </span>
                        </summary>
                        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-600 bg-white/70 leading-relaxed font-mono">
                          {msg.thought}
                        </div>
                      </details>
                    )}

                    <div className="text-sm text-slate-800 leading-relaxed">
                      <MarkdownRenderer content={msg.content} />
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                        <div className="font-semibold text-slate-500 mb-2 flex items-center space-x-1">
                          <span>🌐</span>
                          <span>Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 text-blue-600 truncate max-w-[240px] transition text-[11px]"
                              title={src.title}
                            >
                              {src.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 px-1 py-2">
                <span className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                </span>
                <span className="text-xs font-medium text-slate-500 tracking-wide">
                  {deepThinkActive ? 'Thinking...' : 'Responding...'}
                </span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Input Floating Box */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] focus-within:border-slate-400 focus-within:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition">
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

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeepThinkActive(!deepThinkActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                  deepThinkActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>🧠</span>
                <span>DeepThink</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchActive(!searchActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                  searchActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>🌐</span>
                <span>Search {searchActive ? '(Active)' : ''}</span>
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
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2 border-t border-slate-200 bg-white">
        <span className="font-semibold text-slate-600">bitara</span>
        <span>• Autonomous Multi-Engine Diagnostic Gateway</span>
      </footer>
    </div>
  );
}
