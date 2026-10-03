warning: in the working copy of 'web\web\src\App.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git "a/web\\src\\App.tsx" "b/web\\web\\src\\App.tsx"[m
[1mindex 0cd558f..f946bb9 100644[m
[1m--- "a/web\\src\\App.tsx"[m
[1m+++ "b/web\\web\\src\\App.tsx"[m
[36m@@ -1,4 +1,4 @@[m
[31m-﻿import { useState } from 'react';[m
[32m+[m[32mimport React, { useState } from 'react';[m
 import { GoogleGenAI } from '@google/genai';[m
 [m
 interface ChatMessage {[m
[36m@@ -14,28 +14,19 @@[m [mexport default function App() {[m
   const [deepThinkActive, setDeepThinkActive] = useState(true);[m
   const [searchActive, setSearchActive] = useState(false);[m
 [m
[32m+[m[32m  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';[m
[32m+[m[32m  const ai = new GoogleGenAI({ apiKey });[m
[32m+[m
   const handleSend = async () => {[m
[31m-    const userPrompt = input.trim();[m
[31m-    if (!userPrompt || loading) return;[m
[32m+[m[32m    if (!input.trim() || loading) return;[m
 [m
[32m+[m[32m    const userPrompt = input;[m
     setInput('');[m
[31m-[m
[31m-    const newHistory: ChatMessage[] = [[m
[31m-      ...messages,[m
[31m-      { role: 'user', content: userPrompt },[m
[31m-    ];[m
[31m-[m
[32m+[m[32m    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userPrompt }];[m
     setMessages(newHistory);[m
     setLoading(true);[m
 [m
     try {[m
[31m-      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;[m
[31m-[m
[31m-      if (!apiKey) {[m
[31m-        throw new Error('VITE_GEMINI_API_KEY is missing from your .env file.');[m
[31m-      }[m
[31m-[m
[31m-      const ai = new GoogleGenAI({ apiKey });[m
       const response = await ai.models.generateContent({[m
         model: 'gemini-2.5-flash',[m
         contents: userPrompt,[m
[36m@@ -46,25 +37,24 @@[m [mexport default function App() {[m
         },[m
       });[m
 [m
[32m+[m[32m      const replyText = response.text || 'Tiada respon diterima.';[m
       setMessages([[m
         ...newHistory,[m
         {[m
           role: 'assistant',[m
[31m-          content: response.text || 'Tiada respon diterima.',[m
[32m+[m[32m          content: replyText,[m
           thought: deepThinkActive[m
             ? 'Bitara Diagnostic: Validating AST patterns & aligning curriculum logic...'[m
             : undefined,[m
         },[m
       ]);[m
[31m-    } catch (error: unknown) {[m
[31m-      const errorMessage =[m
[31m-        error instanceof Error[m
[31m-          ? error.message[m
[31m-          : 'Sila pastikan API Key adalah sah.';[m
[31m-[m
[32m+[m[32m    } catch (err: any) {[m
       setMessages([[m
         ...newHistory,[m
[31m-        { role: 'assistant', content: `Ralat enjin: ${errorMessage}` },[m
[32m+[m[32m        {[m
[32m+[m[32m          role: 'assistant',[m
[32m+[m[32m          content: `Ralat enjin: ${err.message || 'Sila pastikan API Key adalah sah.'}`,[m
[32m+[m[32m        },[m
       ]);[m
     } finally {[m
       setLoading(false);[m
[36m@@ -72,216 +62,158 @@[m [mexport default function App() {[m
   };[m
 [m
   return ([m
[31m-    <div className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-black font-sans text-white selection:bg-white selection:text-black">[m
[31m-      <header className="flex items-center justify-between border-b border-white/10 bg-black px-6 py-4 md:px-8">[m
[31m-        <img[m
[31m-          src="/logo.png"[m
[31m-          alt="Bitara"[m
[31m-          className="h-7 w-auto object-contain"[m
[31m-          onError={(event) => {[m
[31m-            event.currentTarget.style.display = 'none';[m
[31m-          }}[m
[31m-        />[m
[31m-[m
[31m-        <button[m
[31m-          type="button"[m
[31m-          aria-label="Open menu"[m
[31m-          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"[m
[31m-        >[m
[31m-          <svg[m
[31m-            className="h-6 w-6"[m
[31m-            fill="none"[m
[31m-            stroke="currentColor"[m
[31m-            viewBox="0 0 24 24"[m
[31m-            aria-hidden="true"[m
[31m-          >[m
[31m-            <path[m
[31m-              strokeLinecap="round"[m
[31m-              strokeLinejoin="round"[m
[31m-              strokeWidth={1.75}[m
[31m-              d="M4 6h16M4 12h16M4 18h16"[m
[31m-            />[m
[31m-          </svg>[m
[31m-        </button>[m
[32m+[m[32m    <div className="relative min-h-screen w-screen bg-black text-neutral-100 flex flex-col justify-between font-sans overflow-x-hidden selection:bg-neutral-700">[m
[32m+[m[32m      {/* Top Navbar */}[m
[32m+[m[32m      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-neutral-900 bg-black">[m
[32m+[m[32m        <div className="flex items-center cursor-pointer">[m
[32m+[m[32m          <img[m
[32m+[m[32m            src="/logo.png"[m
[32m+[m[32m            alt="Bitara"[m
[32m+[m[32m            className="h-7 w-auto object-contain brightness-110"[m
[32m+[m[32m            onError={(e) => {[m
[32m+[m[32m              e.currentTarget.style.display = 'none';[m
[32m+[m[32m            }}[m
[32m+[m[32m          />[m
[32m+[m[32m        </div>[m
[32m+[m[32m        <div>[m
[32m+[m[32m          <button className="text-neutral-400 hover:text-white transition">[m
[32m+[m[32m            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">[m
[32m+[m[32m              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16m-7 6h7" />[m
[32m+[m[32m            </svg>[m
[32m+[m[32m          </button>[m
[32m+[m[32m        </div>[m
       </header>[m
 [m
[31m-      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-12">[m
[32m+[m[32m      {/* Main Area */}[m
[32m+[m[32m      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-3xl w-full mx-auto pb-12">[m
         {messages.length === 0 ? ([m
           <>[m
[31m-            <div className="mb-8 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">[m
[31m-              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold text-white">[m
[31m-                B[m
[31m-              </span>[m
[31m-              <span>BITARA DIAGNOSTIC V1.0</span>[m
[32m+[m[32m            <div className="mb-8 px-4 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center space-x-2">[m
[32m+[m[32m              <span className="text-neutral-200">?</span>[m
[32m+[m[32m              <span>Bitara Diagnostic v1.0</span>[m
             </div>[m
 [m
[31m-            <img[m
[31m-              src="/logo.png"[m
[31m-              alt="Bitara Logo"[m
[31m-              className="mb-6 h-16 w-auto object-contain md:h-20"[m
[31m-              onError={(event) => {[m
[31m-                event.currentTarget.style.display = 'none';[m
[31m-              }}[m
[31m-            />[m
[32m+[m[32m            <div className="mb-6 flex justify-center">[m
[32m+[m[32m              <img[m
[32m+[m[32m                src="/logo.png"[m
[32m+[m[32m                alt="Bitara Logo"[m
[32m+[m[32m                className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"[m
[32m+[m[32m              />[m
[32m+[m[32m            </div>[m
 [m
[31m-            <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.25em] text-white/50">[m
[31m-              Don&apos;t just pass. Dominate.[m
[32m+[m[32m            <p className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-8">[m
[32m+[m[32m              Don't just pass. Dominate.[m
             </p>[m
           </>[m
         ) : ([m
[31m-          <div className="mb-8 max-h-[60vh] w-full space-y-5 overflow-y-auto pr-2">[m
[31m-            {messages.map((message, index) => ([m
[31m-              <div[m
[31m-                key={index}[m
[31m-                className={`flex flex-col ${[m
[31m-                  message.role === 'user' ? 'items-end' : 'items-start'[m
[31m-                }`}[m
[31m-              >[m
[31m-                {message.thought && ([m
[31m-                  <div className="mb-2 max-w-xl rounded-xl border border-white/15 bg-white/5 p-3 font-mono text-xs text-white/60">[m
[31m-                    <span className="font-semibold text-white">Diagnostic: </span>[m
[31m-                    {message.thought}[m
[32m+[m[32m          <div className="w-full space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">[m
[32m+[m[32m            {messages.map((msg, i) => ([m
[32m+[m[32m              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>[m
[32m+[m[32m                {msg.thought && ([m
[32m+[m[32m                  <div className="mb-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 rounded-xl p-3 max-w-xl">[m
[32m+[m[32m                    <span className="text-neutral-200 font-semibold">Diagnostic: </span>[m
[32m+[m[32m                    {msg.thought}[m
                   </div>[m
                 )}[m
[31m-[m
                 <div[m
[31m-                  className={`max-w-xl whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed ${[m
[31m-                    message.role === 'user'[m
[31m-                      ? 'bg-white font-medium text-black'[m
[31m-                      : 'border border-white/15 bg-white/5 text-white/90'[m
[32m+[m[32m                  className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${[m
[32m+[m[32m                    msg.role === 'user'[m
[32m+[m[32m                      ? 'bg-neutral-200 text-neutral-950 font-medium'[m
[32m+[m[32m                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 whitespace-pre-wrap'[m
                   }`}[m
                 >[m
[31m-                  {message.content}[m
[32m+[m[32m                  {msg.content}[m
                 </div>[m
               </div>[m
             ))}[m
[31m-[m
             {loading && ([m
[31m-              <div className="animate-pulse font-mono text-xs text-white/50">[m
[32m+[m[32m              <div className="text-xs text-neutral-500 font-mono animate-pulse">[m
                 Menganalisis data...[m
               </div>[m
             )}[m
           </div>[m
         )}[m
 [m
[31m-        <div className="w-full rounded-2xl border border-white/20 bg-black p-4 shadow-2xl transition focus-within:border-white/50">[m
[32m+[m[32m        {/* Input Box */}[m
[32m+[m[32m        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl focus-within:border-neutral-600 transition">[m
           <textarea[m
             rows={2}[m
             value={input}[m
[31m-            onChange={(event) => setInput(event.target.value)}[m
[31m-            onKeyDown={(event) => {[m
[31m-              if (event.key === 'Enter' && !event.shiftKey) {[m
[31m-                event.preventDefault();[m
[32m+[m[32m            onChange={(e) => setInput(e.target.value)}[m
[32m+[m[32m            onKeyDown={(e) => {[m
[32m+[m[32m              if (e.key === 'Enter' && !e.shiftKey) {[m
[32m+[m[32m                e.preventDefault();[m
                 handleSend();[m
               }[m
             }}[m
             placeholder="Tanya apa-apa berkaitan kod atau silibus..."[m
[31m-            className="w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/35"[m
[32m+[m[32m            className="w-full bg-transparent resize-none outline-none text-neutral-200 placeholder-neutral-500 text-sm leading-relaxed font-sans"[m
           />[m
 [m
[31m-          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">[m
[31m-            <div className="flex items-center gap-2">[m
[32m+[m[32m          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/80">[m
[32m+[m[32m            <div className="flex items-center space-x-2">[m
               <button[m
                 type="button"[m
[31m-                aria-pressed={deepThinkActive}[m
[31m-                onClick={() => setDeepThinkActive((active) => !active)}[m
[31m-                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition ${[m
[32m+[m[32m                onClick={() => setDeepThinkActive(!deepThinkActive)}[m
[32m+[m[32m                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${[m
                   deepThinkActive[m
[31m-                    ? 'border-white bg-white text-black'[m
[31m-                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'[m
[32m+[m[32m                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'[m
[32m+[m[32m                    : 'text-neutral-500 hover:text-neutral-300'[m
                 }`}[m
               >[m
[31m-                <svg[m
[31m-                  className="h-3.5 w-3.5"[m
[31m-                  fill="none"[m
[31m-                  stroke="currentColor"[m
[31m-                  viewBox="0 0 24 24"[m
[31m-                  aria-hidden="true"[m
[31m-                >[m
[31m-                  <path[m
[31m-                    strokeLinecap="round"[m
[31m-                    strokeLinejoin="round"[m
[31m-                    strokeWidth={1.8}[m
[31m-                    d="M9 18h6m-5 4h4m-2-20a7 7 0 0 0-4 12.75c.5.35 1 1.25 1 2.25h6c0-1 .5-1.9 1-2.25A7 7 0 0 0 12 2Z"[m
[31m-                  />[m
[31m-                </svg>[m
[31m-                DeepThink[m
[32m+[m[32m                <span>?</span>[m
[32m+[m[32m                <span>DeepThink</span>[m
               </button>[m
 [m
               <button[m
                 type="button"[m
[31m-                aria-pressed={searchActive}[m
[31m-                onClick={() => setSearchActive((active) => !active)}[m
[31m-                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition ${[m
[32m+[m[32m                onClick={() => setSearchActive(!searchActive)}[m
[32m+[m[32m                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition ${[m
                   searchActive[m
[31m-                    ? 'border-white bg-white text-black'[m
[31m-                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'[m
[32m+[m[32m                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'[m
[32m+[m[32m                    : 'text-neutral-500 hover:text-neutral-300'[m
                 }`}[m
               >[m
[31m-                <svg[m
[31m-                  className="h-3.5 w-3.5"[m
[31m-                  fill="none"[m
[31m-                  stroke="currentColor"[m
[31m-                  viewBox="0 0 24 24"[m
[31m-                  aria-hidden="true"[m
[31m-                >[m
[31m-                  <circle cx="11" cy="11" r="7" strokeWidth={1.8} />[m
[31m-                  <path[m
[31m-                    strokeLinecap="round"[m
[31m-                    strokeWidth={1.8}[m
[31m-                    d="m16 16 4 4"[m
[31m-                  />[m
[31m-                </svg>[m
[31m-                Search[m
[32m+[m[32m                <span>??</span>[m
[32m+[m[32m                <span>Search</span>[m
               </button>[m
             </div>[m
 [m
             <button[m
[31m-              type="button"[m
               onClick={handleSend}[m
               disabled={loading || !input.trim()}[m
[31m-              aria-label="Send message"[m
[31m-              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${[m
[32m+[m[32m              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${[m
                 input.trim() && !loading[m
[31m-                  ? 'bg-white text-black hover:bg-white/80'[m
[31m-                  : 'cursor-not-allowed bg-white/10 text-white/30'[m
[32m+[m[32m                  ? 'bg-white text-neutral-950 hover:bg-neutral-200'[m
[32m+[m[32m                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'[m
               }`}[m
             >[m
[31m-              <svg[m
[31m-                className="h-4 w-4"[m
[31m-                fill="none"[m
[31m-                stroke="currentColor"[m
[31m-                viewBox="0 0 24 24"[m
[31m-                aria-hidden="true"[m
[31m-              >[m
[31m-                <path[m
[31m-                  strokeLinecap="round"[m
[31m-                  strokeLinejoin="round"[m
[31m-                  strokeWidth={2}[m
[31m-                  d="M12 19V5m-7 7 7-7 7 7"[m
[31m-                />[m
[32m+[m[32m              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">[m
[32m+[m[32m                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m-7 7l7-7 7 7" />[m
               </svg>[m
             </button>[m
           </div>[m
         </div>[m
 [m
[32m+[m[32m        {/* Action Buttons */}[m
         {messages.length === 0 && ([m
[31m-          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">[m
[31m-            {['Workspace', 'Diagnostics', 'Curriculum'].map((label) => ([m
[31m-              <button[m
[31m-                key={label}[m
[31m-                type="button"[m
[31m-                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"[m
[31m-              >[m
[31m-                {label}[m
[31m-              </button>[m
[31m-            ))}[m
[32m+[m[32m          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">[m
[32m+[m[32m            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">[m
[32m+[m[32m              ?? Workspace[m
[32m+[m[32m            </button>[m
[32m+[m[32m            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">[m
[32m+[m[32m              ? Diagnostics[m
[32m+[m[32m            </button>[m
[32m+[m[32m            <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 transition">[m
[32m+[m[32m              ?? Curriculum[m
[32m+[m[32m            </button>[m
           </div>[m
         )}[m
       </main>[m
 [m
[31m-      <footer className="flex items-center justify-center border-t border-white/10 px-8 py-4 text-center font-mono text-xs text-white/40">[m
[31m-        BITARA — Autonomous Computing Diagnostics[m
[32m+[m[32m      {/* Footer */}[m
[32m+[m[32m      <footer className="relative z-10 py-4 px-8 text-center text-xs font-mono text-neutral-600 flex items-center justify-center space-x-2 border-t border-neutral-900">[m
[32m+[m[32m        <span>BITARA � Autonomous Computing Diagnostics</span>[m
       </footer>[m
     </div>[m
   );[m
