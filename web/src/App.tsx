import { useState } from 'react';
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

  const handleSend = async () => {
    const userPrompt = input.trim();
    if (!userPrompt || loading) return;

    setInput('');

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userPrompt },
    ];

    setMessages(newHistory);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is missing from your .env file.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: deepThinkActive
            ? 'Kau ialah enjin Bitara. Sentiasa berikan analisis berstruktur, logik mendalam, dan teknikal.'
            : 'Kau ialah enjin Bitara. Jawab soalan secara pantas dan tepat.',
        },
      });

      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: response.text || 'Tiada respon diterima.',
          thought: deepThinkActive
            ? 'Bitara Diagnostic: Validating AST patterns & aligning curriculum logic...'
            : undefined,
        },
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Sila pastikan API Key adalah sah.';

      setMessages([
        ...newHistory,
        { role: 'assistant', content: `Ralat enjin: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <header className="flex items-center justify-between border-b border-white/10 bg-black px-6 py-4 md:px-8">
        <img
          src="/logo.png"
          alt="Bitara"
          className="h-7 w-auto object-contain"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />

        <button
          type="button"
          aria-label="Open menu"
          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-12">
        {messages.length === 0 ? (
          <>
            <div className="mb-8 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold text-white">
                B
              </span>
              <span>BITARA DIAGNOSTIC V1.0</span>
            </div>

            <img
              src="/logo.png"
              alt="Bitara Logo"
              className="mb-6 h-16 w-auto object-contain md:h-20"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />

            <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.25em] text-white/50">
              Don&apos;t just pass. Dominate.
            </p>
          </>
        ) : (
          <div className="mb-8 max-h-[60vh] w-full space-y-5 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {message.thought && (
                  <div className="mb-2 max-w-xl rounded-xl border border-white/15 bg-white/5 p-3 font-mono text-xs text-white/60">
                    <span className="font-semibold text-white">Diagnostic: </span>
                    {message.thought}
                  </div>
                )}

                <div
                  className={`max-w-xl whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-white font-medium text-black'
                      : 'border border-white/15 bg-white/5 text-white/90'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="animate-pulse font-mono text-xs text-white/50">
                Menganalisis data...
              </div>
            )}
          </div>
        )}

        <div className="w-full rounded-2xl border border-white/20 bg-black p-4 shadow-2xl transition focus-within:border-white/50">
          <textarea
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tanya apa-apa berkaitan kod atau silibus..."
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/35"
          />

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={deepThinkActive}
                onClick={() => setDeepThinkActive((active) => !active)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                  deepThinkActive
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 18h6m-5 4h4m-2-20a7 7 0 0 0-4 12.75c.5.35 1 1.25 1 2.25h6c0-1 .5-1.9 1-2.25A7 7 0 0 0 12 2Z"
                  />
                </svg>
                DeepThink
              </button>

              <button
                type="button"
                aria-pressed={searchActive}
                onClick={() => setSearchActive((active) => !active)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                  searchActive
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
                  <path
                    strokeLinecap="round"
                    strokeWidth={1.8}
                    d="m16 16 4 4"
                  />
                </svg>
                Search
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                input.trim() && !loading
                  ? 'bg-white text-black hover:bg-white/80'
                  : 'cursor-not-allowed bg-white/10 text-white/30'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19V5m-7 7 7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {['Workspace', 'Diagnostics', 'Curriculum'].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="flex items-center justify-center border-t border-white/10 px-8 py-4 text-center font-mono text-xs text-white/40">
        BITARA — Autonomous Computing Diagnostics
      </footer>
    </div>
  );
}