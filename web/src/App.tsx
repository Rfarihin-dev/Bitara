import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function App() {
  const [code, setCode] = useState<string>(
    `// Bitara Diagnostic Workspace\n// Tier 1: Local AST Syntax & Diagnostic Engine\n\nfunction evaluateStudentCode() {\n  const status = "Diagnostic Ready";\n  console.log(status);\n}\n\nevaluateStudentCode();`
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#161b22]">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-mono text-sm tracking-wider font-semibold text-slate-200">
            BITARA <span className="text-xs text-slate-500 font-normal">| CORE DIAGNOSTICS</span>
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Status: <span className="text-emerald-400">Workspace Active</span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Code Editor Panel */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          <div className="px-4 py-2 bg-[#161b22] text-xs font-mono text-slate-400 border-b border-slate-800 flex justify-between">
            <span>main.js</span>
            <span>JavaScript (ESNext)</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>

        {/* Diagnostic Panel Sidebar */}
        <div className="w-80 bg-[#161b22] flex flex-col justify-between p-4 border-l border-slate-800">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Diagnostic Stream
            </h2>
            <div className="p-3 bg-[#0d1117] rounded border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-emerald-400">✓ Tier 1 (AST):</span> No syntax violations.
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-500">
            Bitara Architecture • v0.1.0-alpha
          </div>
        </div>
      </div>
    </div>
  );
}