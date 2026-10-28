import React from 'react';
import { Shield, Plus, Code2, Sparkles, BookOpen, Clock, FileSpreadsheet } from 'lucide-react';
import { UserProfile } from '../types/prf';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogModal: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogModal,
  user,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
            PRF Tracker
          </span>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'dashboard'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Painel Geral
          </button>
          <button
            onClick={() => onSelectTab('caderno-erros')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'caderno-erros'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Caderno de Erros
          </button>
          <button
            onClick={() => onSelectTab('simulador')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'simulador'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Simulador 120 Itens
          </button>
          <button
            onClick={() => onSelectTab('ai-coach')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'ai-coach'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Diagnóstico IA
          </button>
          <button
            onClick={() => onSelectTab('python-code')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              currentTab === 'python-code'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Código Python (Render)
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Lançar Questões
          </button>

          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-2 pl-2 text-xs text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            title="Conta do Aluno"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-[10px]">
              {user.name.charAt(0)}
            </div>
            <span className="font-medium text-slate-300 whitespace-nowrap truncate max-w-[110px]">
              {user.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav pills */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pt-3 pb-1 text-xs border-t border-slate-900 mt-2">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
        >
          Painel
        </button>
        <button
          onClick={() => onSelectTab('caderno-erros')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'caderno-erros' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
        >
          Erros
        </button>
        <button
          onClick={() => onSelectTab('simulador')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'simulador' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
        >
          Simulador
        </button>
        <button
          onClick={() => onSelectTab('ai-coach')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'ai-coach' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
        >
          IA Cebraspe
        </button>
        <button
          onClick={() => onSelectTab('python-code')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'python-code' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
        >
          Python/Render
        </button>
      </div>
    </header>
  );
};
