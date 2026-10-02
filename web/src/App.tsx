import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "bitara";
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deepThinkActive, setDeepThinkActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isAiLoading) return;

    const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim() : "";

    if (!apiKey) {
      alert("VITE_GEMINI_API_KEY tidak ditemui. Sila pastikan ia wujud dalam fail web/.env dan mulakan semula terminal (npm run dev).");
      return;
    }

    const userMsgId = Date.now().toString();
    const botMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: trimmed },
      { id: botMsgId, sender: "bitara", text: "" },
    ]);
    setInputText("");
    setIsAiLoading(true);

    const systemPrompt = `
You are BITARA, an elite, authentic, and friendly AI programming mentor.
Your primary language is clear, professional, and approachable English.

LANGUAGE RULES:
- By default, answer in English.
- If the student asks or pastes messages in Bahasa Melayu, immediately switch 100% of your explanation to natural, helpful Bahasa Melayu.

PEDAGOGICAL RULES:
- Help students debug, evaluate logic flaws, explain concepts, and improve their code.
- Avoid dumping mindless complete answers directly; challenge students intellectually while staying encouraging and supportive.
- Wrap all code snippets or keywords in markdown code blocks (\`\`\`language ... \`\`\`) so they render properly in monospace.

SETTINGS:
- DeepThink Reasoning: ${deepThinkActive ? "ACTIVE (Provide deep, rigorous architectural reasoning)" : "OFF"}
- Search Grounding: ${searchActive ? "ACTIVE (Verify standard technical specifications)" : "OFF"}
`.trim();

    // Senarai endpoint model rasmi untuk dicuba secara berurutan
    const candidateModels = ["gemini-2.0-flash", "gemini-2.0-flash", "gemini-2.0-flash"];
    let streamSuccess = false;
    let lastErrorMessage = "";

    for (const model of candidateModels) {
      if (streamSuccess) break;

      try {
        const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `${systemPrompt}\n\nStudent Query / Code:\n${trimmed}` }] },
            ],
            generationConfig: {
              temperature: deepThinkActive ? 0.4 : 0.2,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (!response.ok) {
          let errorDetail = "";
          try {
            const errJson = await response.json();
            errorDetail = errJson.error?.message || response.statusText;
          } catch (e) {
            errorDetail = response.statusText || `Status ${response.status}`;
          }
          lastErrorMessage = `Model ${model} gagal: HTTP ${response.status} (${errorDetail})`;
          continue; // Cuba model seterusnya jika berlaku 404
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        if (reader) {
          streamSuccess = true;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.replace("data: ", "").trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId ? { ...msg, text: msg.text + chunk } : msg
                    )
                  );
                } catch (e) {}
              }
            }
          }
        }
      } catch (networkErr: any) {
        lastErrorMessage = networkErr.message || "Failed to fetch";
      }
    }

    if (!streamSuccess) {
      let finalDiagnostic = lastErrorMessage;
      if (lastErrorMessage.toLowerCase().includes("failed to fetch")) {
        finalDiagnostic += " -> Sekatan rangkaian dikesan. Sila matikan Ad Blocker, Tracker Blocker, atau VPN pada pelayar Opera anda.";
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId ? { ...msg, text: `Ralat Sistem BITARA: ${finalDiagnostic}` } : msg
        )
      );
    }

    setIsAiLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "BITARA Analysis", text });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Message copied to clipboard!");
    }
  };

  const renderFormattedText = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const firstLine = lines[0]?.trim() || "";
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const lang = hasLang ? firstLine : "code";
        const codeText = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-[#0f141c] text-neutral-100 shadow-sm text-left">
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#1b2230] text-[11px] text-neutral-400 font-sans border-b border-neutral-800">
              <span className="font-semibold uppercase tracking-wider">{lang}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(codeText)}
                className="hover:text-white transition cursor-pointer"
              >
                Copy code
              </button>
            </div>
            <pre className="p-4 text-xs font-code overflow-x-auto leading-relaxed text-[#7ee787]">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index} className="font-sans leading-relaxed whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] text-neutral-900 font-sans">
      {/* 1. TOP HEADER */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="flex items-center cursor-pointer" onClick={() => setMessages([])} title="Reset to Home">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-7 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/icon.png')) {
                target.src = '/icon.png';
              }
            }}
          />
        </div>

        {/* 3-BAR HAMBURGER OPTIONS */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition cursor-pointer"
            title="Options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in">
              <div className="text-[11px] font-semibold text-neutral-400 px-3 py-1.5 uppercase tracking-wider">
                System Options
              </div>
              <div className="flex flex-col gap-1 py-1">
                <div className="px-3 py-2 hover:bg-neutral-50 rounded-lg flex justify-between items-center text-xs">
                  <span className="font-medium text-neutral-700">Model: Multi-Engine Fallback</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Ready</span>
                </div>
                <div
                  onClick={() => setDeepThinkActive(!deepThinkActive)}
                  className="px-3 py-2 hover:bg-neutral-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-medium text-neutral-700">DeepThink Mode</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${deepThinkActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                    {deepThinkActive ? "ON" : "OFF"}
                  </span>
                </div>
                <div
                  onClick={() => setSearchActive(!searchActive)}
                  className="px-3 py-2 hover:bg-neutral-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-medium text-neutral-700">Search Grounding</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${searchActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                    {searchActive ? "ON" : "OFF"}
                  </span>
                </div>
                <div
                  onClick={() => { setMessages([]); setMenuOpen(false); }}
                  className="px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer text-xs font-medium"
                >
                  New Conversation
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY CONTENT: HERO vs CHAT */}
      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center my-auto pb-12">
            <div className="flex items-center justify-center mb-5">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.endsWith('/icon.png')) {
                    target.src = '/icon.png';
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 tracking-tight mb-2">
              Don't just pass. Dominate.
            </h1>
            <p className="text-sm text-neutral-500 mb-8">
              Ask anything, explore together, or paste your code directly below.
            </p>

            <div className="w-full bg-white border border-neutral-300 rounded-2xl p-3 shadow-md focus-within:border-neutral-500 focus-within:shadow-lg transition">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={4}
                placeholder="Ask anything or paste code..."
                className="w-full bg-transparent outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
              />

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeepThinkActive(!deepThinkActive)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
                      deepThinkActive
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>DeepThink</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchActive(!searchActive)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
                      searchActive
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isAiLoading}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white transition flex items-center justify-center cursor-pointer"
                  title="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col gap-6 pb-28 pt-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} w-full`}
              >
                {msg.sender === "user" ? (
                  <div className="max-w-[85%] bg-neutral-100 border border-neutral-200 rounded-2xl px-5 py-3 text-sm text-neutral-900 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                ) : (
                  <div className="w-full bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logo.png"
                          alt="Logo"
                          className="h-4 w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.endsWith('/icon.png')) {
                              target.src = '/icon.png';
                            }
                          }}
                        />
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(msg.text)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-800 leading-relaxed">
                      {msg.text ? (
                        renderFormattedText(msg.text)
                      ) : (
                        <div className="flex items-center gap-2 text-neutral-400 py-2">
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-neutral-400 border-t-transparent rounded-full"></span>
                          <span>Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 3. STICKY BOTTOM INPUT */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-4 pb-4 px-4 z-30">
          <div className="max-w-3xl mx-auto w-full bg-white border border-neutral-300 rounded-2xl p-2.5 shadow-lg focus-within:border-neutral-500 transition">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder="Ask a follow-up question or paste code..."
              className="w-full bg-transparent outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 font-sans px-2 pt-1"
            />
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeepThinkActive(!deepThinkActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                    deepThinkActive
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>DeepThink</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchActive(!searchActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                    searchActive
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isAiLoading}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white transition flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER CREDIT */}
      <footer className="w-full py-3 text-center text-xs text-neutral-400 border-t border-neutral-100 bg-white">
        BITARA // Engineered by Raja Farihin Ikhsan
      </footer>
    </div>
  );
}
