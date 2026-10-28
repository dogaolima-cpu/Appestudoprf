import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, ExternalLink, FolderTree, FileCode, CheckCircle2 } from 'lucide-react';
import { PYTHON_CODEBASE, CodeFile } from '../data/pythonCodeRepository';

export const PythonCodeBrowser: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PYTHON_CODEBASE[4]); // default to app/security.py (Passo 2)
  const [copied, setCopied] = useState(false);
  const [activeStepFilter, setActiveStepFilter] = useState<string>('all');

  const steps = [
    { id: 'all', label: 'Todos os Arquivos' },
    { id: 'Passo 1 - Fundação', label: 'Passo 1 (Fundação & Banco)' },
    { id: 'Passo 2 - Segurança & Validações', label: 'Passo 2 (Segurança & Bcrypt)' },
    { id: 'Passo 2 - Regras Cebraspe', label: 'Passo 2 (Motor Cebraspe)' },
    { id: 'Deploy em Produção', label: 'Deploy Render' },
  ];

  const filteredFiles =
    activeStepFilter === 'all'
      ? PYTHON_CODEBASE
      : PYTHON_CODEBASE.filter((f) => f.step.includes(activeStepFilter) || f.step === activeStepFilter);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Repositório Python / FastAPI para o Render</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arquivos de engenharia prontos para versionar no Git, testar com SQLite e publicar no Render com PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar {selectedFile.filename}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Tabs Filter */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
        {steps.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveStepFilter(st.id)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeStepFilter === st.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 max-h-[580px] overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
            <span>Árvore do Projeto (FastAPI)</span>
          </div>

          <div className="space-y-1 pt-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-700/60 text-cyan-200'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="font-mono text-[11px] truncate">{file.path}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium shrink-0 ml-1">
                    {file.step.split(' - ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* File Meta Header */}
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 font-semibold">{selectedFile.path}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {selectedFile.language}
            </span>
          </div>

          {/* Code Text Area */}
          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed selection:bg-cyan-500 selection:text-slate-950 max-h-[500px]">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Deployment & Terminal Quickstart Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Comandos Rápidos no Terminal para Douglas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono space-y-1">
            <div className="text-[10px] text-slate-500 font-sans">1. Instalar dependências</div>
            <code className="text-cyan-300 text-[11px]">pip install -r requirements.txt</code>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono space-y-1">
            <div className="text-[10px] text-slate-500 font-sans">2. Popular matérias e pesos</div>
            <code className="text-cyan-300 text-[11px]">python seed_prf.py</code>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono space-y-1">
            <div className="text-[10px] text-slate-500 font-sans">3. Subir servidor FastAPI</div>
            <code className="text-cyan-300 text-[11px]">uvicorn app.main:app --reload</code>
          </div>
        </div>
      </div>
    </div>
  );
};
