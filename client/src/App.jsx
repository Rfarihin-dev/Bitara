import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import * as acorn from 'acorn';
import { Play, Bug, ShieldCheck, Cpu, Terminal, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function App() {
  const initialCode = `// Tulis kod JavaScript di sini
const pelajar = "Raja Farihin";
const markah = 85;

function semakGred(skor) {
  if (skor >= 80) {
    return "Cemerlang";
  }
  return "Lulus";
}

console.log("Nama: " + pelajar);
console.log("Status: " + semakGred(markah));`;

  const [code, setCode] = useState(initialCode);
  const [tier0Result, setTier0Result] = useState({
    status: 'idle', // 'idle' | 'valid' | 'syntax_error'
    message: 'Enjin bersedia untuk ujian.',
    details: null,
    tokensSaved: 0
  });
  const [srcDoc, setSrcDoc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  // TIER-0: Semakan Sintaksis Tempatan (AST Parser - 0 Token / Percuma)
  const handleRunTier0 = () => {
    setAiFeedback(null);
    try {
      // Parse kod guna Acorn (ECMAScript 2020)
      acorn.parse(code, { ecmaVersion: 2020, locations: true });

      setTier0Result({
        status: 'valid',
        message: 'Sintaksis Sah (Tiada Ralat Struktur)',
        details: 'Kod mematuhi spesifikasi AST ECMAScript 2020.',
        tokensSaved: 150 // Anggaran token jika dihantar ke LLM tanpa tapisan
      });

      // Jana output ke Sandbox Iframe secara selamat
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                padding: 16px;
                background-color: #ffffff;
                color: #0f172a;
                margin: 0;
              }
              .log-entry {
                padding: 6px 10px;
                margin-bottom: 4px;
                background: #f8fafc;
                border-left: 3px solid #10b981;
                border-radius: 4px;
                font-size: 13px;
                white-space: pre-wrap;
              }
              .err-entry {
                padding: 6px 10px;
                margin-bottom: 4px;
                background: #fff1f2;
                border-left: 3px solid #f43f5e;
                border-radius: 4px;
                color: #be123c;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div id="console-logs"></div>
            <script>
              const logContainer = document.getElementById('console-logs');
              console.log = function(...args) {
                const div = document.createElement('div');
                div.className = 'log-entry';
                div.innerText = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                logContainer.appendChild(div);
              };
              window.onerror = function(msg, url, line) {
                const div = document.createElement('div');
                div.className = 'err-entry';
                div.innerText = 'Runtime Error [Baris ' + line + ']: ' + msg;
                logContainer.appendChild(div);
                return true;
              };
              try {
                ${code}
              } catch (e) {
                const div = document.createElement('div');
                div.className = 'err-entry';
                div.innerText = 'Runtime Exception: ' + e.message;
                logContainer.appendChild(div);
              }
            </script>
          </body>
        </html>
      `);

    } catch (err) {
      setTier0Result({
        status: 'syntax_error',
        message: 'Ralat Sintaksis Dikesan!',
        details: `Baris ${err.loc?.line}, Lajur ${err.loc?.column}: ${err.message}`,
        tokensSaved: 220
      });
      // Jangan benarkan render ke sandbox jika sintaksis rosak
      setSrcDoc('');
    }
  };

  // TIER-1: Panggilan Diagnostik AI (Kena sekat jika Tier-0 gagal)
  const handleRequestAiDiagnostics = () => {
    if (tier0Result.status === 'syntax_error') {
      return; // Sekat pembaziran kos API
    }
    setAiLoading(true);
    // Simulasi panggilan endpoint backend Express
    setTimeout(() => {
      setAiLoading(false);
      setAiFeedback({
        type: 'pedagogical',
        advice: 'Logik kod anda berfungsi. Namun, amalan terbaik mengesyorkan pengesahan jenis data (type validation) pada parameter `skor` sebelum melakukan perbandingan nombor.'
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. Header & Status Bar */}
      <header className="h-12 border-b border-slate-800 px-5 flex items-center justify-between bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-black text-emerald-400 tracking-wider text-lg">BITARA</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700 font-mono">
            Platform Diagnostik Kod Web (Tier-0 / Tier-1)
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Token AI Dijimatkan:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              +{tier0Result.tokensSaved} Tokens (Acorn Engine)
            </span>
          </div>
          <div className="text-slate-500">
            Status: <span className="text-slate-300">Modul 01 (JavaScript)</span>
          </div>
        </div>
      </header>

      {/* 2. Workspace 3 Lajur */}
      <main className="flex-1 grid grid-cols-12 divide-x divide-slate-800 overflow-hidden">
        
        {/* LAJUR 1: Monaco Code Editor (5 Lajur) */}
        <section className="col-span-5 flex flex-col h-full bg-slate-900">
          <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal size={14} className="text-slate-400" />
              <span>main.js</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(initialCode)}
                title="Reset Kod"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleRunTier0}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 py-1 rounded text-xs font-medium transition shadow-sm"
              >
                <Play size={13} fill="currentColor" />
                Uji Kod (Tier-0)
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'Fira Code, monospace',
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3
              }}
            />
          </div>
        </section>

        {/* LAJUR 2: Sandbox Preview / Console Log (4 Lajur) */}
        <section className="col-span-4 flex flex-col h-full bg-slate-950">
          <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/80">
            <span className="text-xs font-mono text-slate-300">Konsol Output (Sandbox)</span>
            <span className="text-[10px] text-slate-500 font-mono">Isolated Iframe</span>
          </div>
          <div className="flex-1 bg-white relative">
            {srcDoc ? (
              <iframe
                srcDoc={srcDoc}
                title="Sandbox Output"
                sandbox="allow-scripts"
                className="w-full h-full border-none"
              />
            ) : (
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Terminal size={32} className="mb-2 opacity-30" />
                <p className="text-xs">Klik butang <strong className="text-emerald-400">"Uji Kod (Tier-0)"</strong> untuk menyemak dan menjalankan output kod di sini.</p>
              </div>
            )}
          </div>
        </section>

        {/* LAJUR 3: Enjin Diagnostik (Tier-0 & Tier-1) (3 Lajur) */}
        <section className="col-span-3 flex flex-col h-full bg-slate-900 p-4 gap-4 overflow-y-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-semibold text-slate-200">
            <Cpu size={16} className="text-emerald-400" />
            <span>Enjin Diagnostik BITARA</span>
          </div>

          {/* KAD TIER-0: AST Parser (Acorn) */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Tier-0: Semakan Tempatan</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                0 Kos
              </span>
            </div>

            {tier0Result.status === 'idle' && (
              <p className="text-xs text-slate-500">Tekan "Uji Kod" untuk memulakan analisis sintaksis tempatan.</p>
            )}

            {tier0Result.status === 'valid' && (
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 size={14} />
                  <span>{tier0Result.message}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{tier0Result.details}</p>
              </div>
            )}

            {tier0Result.status === 'syntax_error' && (
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                  <AlertTriangle size={14} />
                  <span>{tier0Result.message}</span>
                </div>
                <div className="p-2 rounded bg-rose-950/40 border border-rose-900 text-[11px] font-mono text-rose-300 break-all">
                  {tier0Result.details}
                </div>
                <p className="text-[10px] text-amber-400/90 leading-tight">
                  Penyekat Kos: Ralat sintaksis diselesaikan di peringkat tempatan untuk mengelak pembaziran kuota API.
                </p>
              </div>
            )}
          </div>

          {/* KAD TIER-1: LLM Reasoning Engine */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Bug size={14} className="text-amber-400" />
                <span>Tier-1: Bimbingan Logik AI</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                Token Berhemah
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan fungsi ini hanya apabila kod sah dari segi sintaksis tetapi logik atur cara tidak menghasilkan output yang dikehendaki.
            </p>

            <button
              onClick={handleRequestAiDiagnostics}
              disabled={tier0Result.status !== 'valid' || aiLoading}
              className="w-full py-2 px-3 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white transition flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>Menganalisis Logik...</>
              ) : (
                <>Analisis Logik BITARA</>
              )}
            </button>

            {tier0Result.status === 'syntax_error' && (
              <span className="text-[10px] text-slate-500 text-center font-mono">
                [Terkunci] Baiki ralat sintaksis dahulu
              </span>
            )}

            {aiFeedback && (
              <div className="mt-2 p-2.5 rounded bg-indigo-950/40 border border-indigo-900 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-indigo-400 text-[11px] mb-1">Nasihat Pedagogi:</div>
                {aiFeedback.advice}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}