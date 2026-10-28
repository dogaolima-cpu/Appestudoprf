import React, { useState } from 'react';
import { BookOpen, Search, Check, AlertTriangle, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { QuestionLog, Subject } from '../types/prf';

interface CadernoErrosProps {
  logs: QuestionLog[];
  subjects: Subject[];
  onToggleReviewed: (logId: string) => void;
  onOpenLogModal: () => void;
}

export const CadernoErros: React.FC<CadernoErrosProps> = ({
  logs,
  subjects,
  onToggleReviewed,
  onOpenLogModal,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [explainingLogId, setExplainingLogId] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ id: string; text: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const subjectMap = new Map<number, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Focus on mistakes (ERRADO) and blanks (BRANCO) that have notes or need review
  const mistakeLogs = logs.filter((l) => l.result === 'ERRADO' || (l.result === 'BRANCO' && l.notes));

  const filteredLogs = mistakeLogs.filter((log) => {
    const subj = subjectMap.get(log.subjectId);
    if (!subj) return false;

    if (selectedSubject !== 'all' && subj.name !== selectedSubject) {
      return false;
    }

    if (statusFilter === 'pending' && log.reviewed) return false;
    if (statusFilter === 'reviewed' && !log.reviewed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const notesMatch = (log.notes || '').toLowerCase().includes(q);
      const subjMatch = subj.name.toLowerCase().includes(q);
      return notesMatch || subjMatch;
    }

    return true;
  });

  const handleExplainWithAi = async (log: QuestionLog) => {
    const subj = subjectMap.get(log.subjectId);
    setExplainingLogId(log.id);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: { total: 1, certo: 0, errado: 1, branco: 0, liquidScore: -1 },
          recentMistakes: [
            {
              materia: subj?.name,
              anotacao: log.notes || 'Erro nesta questão Cebraspe',
              dificuldade: log.difficulty,
            },
          ],
        }),
      });

      const resJson = await response.json();
      const text =
        resJson?.data?.diagnostico_geral ||
        resJson?.data?.analise_bloco_2_transito ||
        'Atenção ao padrão Cebraspe: verifique a literalidade da lei e a jurisprudência sumulada do STJ/STF aplicável.';

      setAiExplanation({ id: log.id, text });
    } catch {
      setAiExplanation({
        id: log.id,
        text: 'Dica do Motor Cebraspe: Revise a literalidade do CTB / Código Penal e atente-se às pegadinhas de inversão de termos ("sempre", "nunca", "exclusivamente").',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Caderno de Erros & Pegadinhas Cebraspe</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            O segredo da aprovação na PRF: mapear os motivos de cada erro para nunca mais cair na mesma pegadinha.
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Registrar Novo Erro
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por pegadinha, artigo ou matéria..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
        >
          <option value="all">Todas as Matérias</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Segmented Control */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendentes ({mistakeLogs.filter((l) => !l.reviewed).length})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'reviewed'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Revisados ({mistakeLogs.filter((l) => l.reviewed).length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({mistakeLogs.length})
          </button>
        </div>
      </div>

      {/* List of Mistakes */}
      {filteredLogs.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
          <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Nenhum erro pendente neste filtro</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Excelente trabalho! Continue resolvendo baterias de questões e anote aqui toda pegadinha que encontrar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const subj = subjectMap.get(log.subjectId);
            return (
              <div
                key={log.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  log.reviewed
                    ? 'border-slate-800/80 opacity-70'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-white">{subj?.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 text-[11px]">{subj?.block.split(' - ')[0]}</span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`font-semibold font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
                          log.result === 'ERRADO'
                            ? 'text-rose-400 bg-rose-950/40 border border-rose-900'
                            : 'text-amber-400 bg-amber-950/40 border border-amber-900'
                        }`}
                      >
                        {log.result === 'ERRADO' ? 'Item Errado (-1)' : 'Deixada em Branco (0)'}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 text-[11px]">
                        Dificuldade: {log.difficulty.toLowerCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      {log.notes || 'Sem anotação cadastrada. Clique em editar para registrar o porquê do erro.'}
                    </p>

                    {/* AI Explanation Box if active */}
                    {aiExplanation?.id === log.id && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Orientação do Mentor Cebraspe</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-100">
                          {aiExplanation.text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => onToggleReviewed(log.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        log.reviewed
                          ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {log.reviewed ? 'Revisado' : 'Marcar Revisado'}
                    </button>

                    <button
                      onClick={() => handleExplainWithAi(log)}
                      disabled={isAiLoading && explainingLogId === log.id}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isAiLoading && explainingLogId === log.id ? 'Analisando...' : 'Pedir Ajuda da IA'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
