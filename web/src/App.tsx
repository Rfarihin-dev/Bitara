import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as acorn from 'acorn';

interface Tier0Result {
  status: 'valid' | 'invalid' | 'idle';
  error?: string;
  line?: number;
  column?: number;
}

interface HistoryItem {
  id: string;
  time: string;
  status: 'valid' | 'invalid';
  note: string;
}

export default function App() {
  const [code, setCode] = useState<string>(
    `// Platform Bimbingan Pedagogi BITARA\nfunction hitungJumlah(a, b) {\n  let total = a + b;\n  return total;\n}\n\nconsole.log(hitungJumlah(10, 20));`
  );
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'console' | 'history'>('diagnostics');
  const [tier0, setTier0] = useState<Tier0Result>({ status: 'idle' });
  const [aiStreamingText, setAiStreamingText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Tier-0: Semakan AST Semerta (Acorn Parser)
  useEffect(() => {
    if (!code.trim()) {
      setTier0({ status: 'idle' });
      return;
    }
    try {
      acorn.parse(code, { ecmaVersion: 'latest', locations: true });
      setTier0({ status: 'valid' });
    } catch (err: any) {
      setTier0({
        status: 'invalid',
        error: err.message,
        line: err.loc?.line,
        column: err.loc?.column,
      });
    }
  }, [code]);

  // Uji Lari Kod Tempatan
  const runCode = () => {
    setConsoleOutput([]);
    setActiveTab('console');
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => String(a)).join(' ')),
      error: (...args: any[]) => logs.push(`[ERROR] ${args.map(a => String(a)).join(' ')}`),
      warn: (...args: any[]) => logs.push(`[WARN] ${args.map(a => String(a)).join(' ')}`),
    };

    try {
      const execute = new Function('console', code);
      execute(customConsole);
      setConsoleOutput(logs.length > 0 ? logs : ['Kod berjaya dijalankan tanpa output console.']);
    } catch (err: any) {
      setConsoleOutput([`Runtime Error: ${err.message}`]);
    }
  };

  // Tier-1: Enjin AI Pantas Berstrim (SSE) - Tanpa Search Tool
  const requestAiDiagnostics = async () => {
    if (tier0.status === 'invalid') {
      alert('Selesaikan ralat sintaksis Tier-0 dahulu!');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert('Kunci VITE_GEMINI_API_KEY tiada dalam web/.env!');
      return;
    }

    setIsAiLoading(true);
    setAiStreamingText('');
    setActiveTab('diagnostics');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Anda adalah enjin bimbingan pedagogi BITARA. Nilai kod JavaScript pelajar berikut. JANGAN beri jawapan bulat-bulat. Berikan diagnosis padat: 1. Analisis Logik 2. Potensi Pepijat / Edge Cases 3. Satu Soalan Bimbingan.\n\nKod Pelajar:\n${code}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let liveText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const part = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              liveText += part;
              setAiStreamingText(liveText);
            } catch {
              // chunk sebahagian diabaikan sehingga lengkap
            }
          }
        }
      }

      setHistory(prev => [
        {
          id: `diag_${Date.now().toString().slice(-4)}`,
          time: new Date().toLocaleTimeString(),
          status: 'valid',
          note: 'Analisis Logik AI Selesai',
        },
        ...prev,
      ]);
    } catch (err: any) {
      setAiStreamingText(`Ralat Diagnostik: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'monospace' }}>
      {/* Editor Utama */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #30363d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>BITARA // PEDAGOGICAL WORKSPACE</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={runCode}
              style={{ backgroundColor: '#238636', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Lari Kod
            </button>
            <button
              onClick={requestAiDiagnostics}
              disabled={isAiLoading || tier0.status === 'invalid'}
              style={{
                backgroundColor: tier0.status === 'invalid' ? '#30363d' : '#1f6feb',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: tier0.status === 'invalid' ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isAiLoading ? 'Menjana Analisis...' : 'Minta Bimbingan AI'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        {/* Status Bar Tier-0 */}
        <div style={{ padding: '8px 16px', backgroundColor: tier0.status === 'invalid' ? '#3d1214' : '#161b22', borderTop: '1px solid #30363d', fontSize: '12px' }}>
          {tier0.status === 'valid' && <span style={{ color: '#3fb950' }}>● Sintaks Sah (Acorn AST Lulus)</span>}
          {tier0.status === 'invalid' && (
            <span style={{ color: '#f85149' }}>
              ● Ralat Sintaks: {tier0.error} (Baris: {tier0.line}, Kolum: {tier0.column})
            </span>
          )}
          {tier0.status === 'idle' && <span>● Tiada kod dikesan</span>}
        </div>
      </div>

      {/* Panel Sisi / Output */}
      <div style={{ width: '450px', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #30363d', backgroundColor: '#161b22' }}>
          {(['diagnostics', 'console', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === tab ? '#0d1117' : 'transparent',
                color: activeTab === tab ? '#58a6ff' : '#8b949e',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #58a6ff' : 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {activeTab === 'diagnostics' && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>ENJIN DIAGNOSTIK PEDAGOGI (STREAMING)</div>
              {aiStreamingText ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '13px', color: '#e6edf3' }}>
                  {aiStreamingText}
                </div>
              ) : (
                <div style={{ color: '#484f58', fontSize: '13px' }}>
                  {isAiLoading ? 'Menghubungkan ke Gemini Flash...' : 'Tekan "Minta Bimbingan AI" untuk analisis logik.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'console' && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>KONSOL OUTPUT</div>
              {consoleOutput.map((out, idx) => (
                <div key={idx} style={{ fontSize: '13px', marginBottom: '4px', color: out.startsWith('Runtime Error') ? '#f85149' : '#7ee787' }}>
                  {out}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>LOG SERAHAN TAHAP 1</div>
              {history.map((item) => (
                <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #21262d', fontSize: '12px' }}>
                  <div style={{ color: '#58a6ff' }}>{item.time}</div>
                  <div>{item.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
