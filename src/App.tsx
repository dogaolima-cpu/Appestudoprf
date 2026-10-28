import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { BlockBreakdown } from './components/BlockBreakdown';
import { SubjectTable } from './components/SubjectTable';
import { LogQuestionModal } from './components/LogQuestionModal';
import { CadernoErros } from './components/CadernoErros';
import { SimuladorCebraspe } from './components/SimuladorCebraspe';
import { AIDiagnosticPanel } from './components/AIDiagnosticPanel';
import { PythonCodeBrowser } from './components/PythonCodeBrowser';
import { StudyTimer } from './components/StudyTimer';
import { AuthModal } from './components/AuthModal';
import { EvolutionChart } from './components/EvolutionChart';

import { PRF_SUBJECTS, INITIAL_QUESTION_LOGS, INITIAL_USER } from './data/prfSubjects';
import { calculateCebraspeStats, getSubjectStats } from './utils/cebraspeEngine';
import { QuestionLog, UserProfile } from './types/prf';
import { Shield, Sparkles, BookOpen, FileSpreadsheet, Code2, Plus, Target } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('prf_user_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [logs, setLogs] = useState<QuestionLog[]>(() => {
    const saved = localStorage.getItem('prf_question_logs');
    return saved ? JSON.parse(saved) : INITIAL_QUESTION_LOGS;
  });

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem('prf_question_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('prf_user_profile', JSON.stringify(user));
  }, [user]);

  // Derived Cebraspe Metrics
  const stats = calculateCebraspeStats(logs, PRF_SUBJECTS);
  const subjectStats = getSubjectStats(logs, PRF_SUBJECTS);

  const handleSaveLogs = (newLogs: QuestionLog[]) => {
    setLogs((prev) => [...newLogs, ...prev]);
  };

  const handleToggleReviewed = (logId: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, reviewed: !l.reviewed } : l))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Hero Candidate Sub-Bar (Clean single surface, no pill badges) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{user.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium">Alvo: {user.targetExam} {user.targetYear}</span>
            <span className="text-slate-600">·</span>
            <span>Meta Diária: {user.dailyGoalQuestions} questões</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Regra de Cálculo:</span>
            <span className="font-mono text-slate-300 font-semibold">Cebraspe Líquido (1E anula 1C)</span>
          </div>
        </div>

        {/* Tab 1: Dashboard Geral */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Study Timer Strip */}
            <StudyTimer
              subjects={PRF_SUBJECTS}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />

            {/* Cebraspe Primary Metric Cards */}
            <MetricCards stats={stats} />

            {/* Recharts Weekly Net Evolution Chart */}
            <EvolutionChart logs={logs} />

            {/* 3 PRF Official Blocks Breakdown */}
            <BlockBreakdown
              stats={stats}
              subjects={PRF_SUBJECTS}
              subjectStats={subjectStats}
            />

            {/* High-Density Official PRF Subjects Table */}
            <SubjectTable
              subjectStats={subjectStats}
              onLogSubject={(subjectId) => {
                setIsLogModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 2: Caderno de Erros */}
        {currentTab === 'caderno-erros' && (
          <CadernoErros
            logs={logs}
            subjects={PRF_SUBJECTS}
            onToggleReviewed={handleToggleReviewed}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}

        {/* Tab 3: Simulador Cebraspe 120 Itens */}
        {currentTab === 'simulador' && <SimuladorCebraspe />}

        {/* Tab 4: IA Cebraspe & Diagnóstico */}
        {currentTab === 'ai-coach' && (
          <AIDiagnosticPanel
            stats={stats}
            subjects={PRF_SUBJECTS}
            logs={logs}
            subjectStats={subjectStats}
          />
        )}

        {/* Tab 5: Código Python / FastAPI para o Render */}
        {currentTab === 'python-code' && <PythonCodeBrowser />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 lg:px-8 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500/70" />
            <span className="text-slate-400 font-medium">PRF Tracker · Underline Tech</span>
            <span>—</span>
            <span>Edital Cebraspe Polícia Rodoviária Federal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setCurrentTab('python-code')}
              className="hover:text-cyan-400 transition-colors"
            >
              Arquivos Python/Render
            </button>
            <button
              onClick={() => setCurrentTab('simulador')}
              className="hover:text-amber-400 transition-colors"
            >
              Simulador
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Perfil
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LogQuestionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        subjects={PRF_SUBJECTS}
        onSaveLogs={handleSaveLogs}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />
    </div>
  );
}
