import React, { useState } from 'react';
import { X, Plus, Check, Minus, AlertCircle } from 'lucide-react';
import { Subject, QuestionResult, QuestionDifficulty, QuestionLog } from '../types/prf';

interface LogQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSaveLogs: (newLogs: QuestionLog[]) => void;
}

export const LogQuestionModal: React.FC<LogQuestionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSaveLogs,
}) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(8); // Default to Trânsito
  const [result, setResult] = useState<QuestionResult>('CERTO');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('MEDIO');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState<number>(60);

  // Batch mode fields
  const [batchCerto, setBatchCerto] = useState<number>(7);
  const [batchErrado, setBatchErrado] = useState<number>(2);
  const [batchBranco, setBatchBranco] = useState<number>(1);
  const [batchNotes, setBatchNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'single') {
      const newLog: QuestionLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: 'usr_douglas_01',
        subjectId: selectedSubjectId,
        result,
        difficulty,
        notes: notes.trim() || undefined,
        reviewed: result === 'CERTO',
        timeSpentSeconds: timeSpent,
        createdAt: new Date().toISOString(),
      };
      onSaveLogs([newLog]);
    } else {
      const logs: QuestionLog[] = [];
      const timestamp = new Date().toISOString();

      for (let i = 0; i < batchCerto; i++) {
        logs.push({
          id: `log_${Date.now()}_c_${i}`,
          userId: 'usr_douglas_01',
          subjectId: selectedSubjectId,
          result: 'CERTO',
          difficulty: 'MEDIO',
          reviewed: true,
          timeSpentSeconds: 60,
          createdAt: timestamp,
        });
      }
      for (let i = 0; i < batchErrado; i++) {
        logs.push({
          id: `log_${Date.now()}_e_${i}`,
          userId: 'usr_douglas_01',
          subjectId: selectedSubjectId,
          result: 'ERRADO',
          difficulty: 'MEDIO',
          notes: batchNotes.trim() ? `[Lote] ${batchNotes.trim()}` : undefined,
          reviewed: false,
          timeSpentSeconds: 60,
          createdAt: timestamp,
        });
      }
      for (let i = 0; i < batchBranco; i++) {
        logs.push({
          id: `log_${Date.now()}_b_${i}`,
          userId: 'usr_douglas_01',
          subjectId: selectedSubjectId,
          result: 'BRANCO',
          difficulty: 'DIFICIL',
          reviewed: false,
          timeSpentSeconds: 60,
          createdAt: timestamp,
        });
      }
      onSaveLogs(logs);
    }

    // Reset and close
    setNotes('');
    setBatchNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Registrar Resolução de Questões
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas estritas Cebraspe: 1 errada anula 1 certa.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'single'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Questão Individual (com Anotação)
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'batch'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lançamento em Lote (Bateria)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Disciplina */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Disciplina da PRF
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <optgroup label="Bloco II - Legislação de Trânsito (Prioridade Máxima)">
                {subjects
                  .filter((s) => s.block === 'Bloco II - Legislação de Trânsito')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Peso {s.weight})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Bloco I - Conhecimentos Gerais">
                {subjects
                  .filter((s) => s.block === 'Bloco I - Conhecimentos Gerais')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Peso {s.weight})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Bloco III - Conhecimentos Específicos">
                {subjects
                  .filter((s) => s.block === 'Bloco III - Conhecimentos Específicos')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Peso {s.weight})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {mode === 'single' ? (
            <>
              {/* Resultado Cebraspe */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resultado Cebraspe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResult('CERTO')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      result === 'CERTO'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> CERTO (+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult('ERRADO')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      result === 'ERRADO'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" /> ERRADO (-1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult('BRANCO')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      result === 'BRANCO'
                        ? 'bg-slate-800 border-slate-500 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> BRANCO (0)
                  </button>
                </div>
              </div>

              {/* Dificuldade */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dificuldade Percebida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['FACIL', 'MEDIO', 'DIFICIL'] as QuestionDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        difficulty === d
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {d === 'FACIL' ? 'Fácil' : d === 'MEDIO' ? 'Média' : 'Difícil'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anotação / Pegadinha da Banca */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Caderno de Erros / Pegadinha da Banca</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Recomendado para itens errados
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Art. 306 CTB: embriaguez é crime de perigo abstrato. Atenção à pegadinha do Cebraspe..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Batch Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1">
                    Certas (+1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={batchCerto}
                    onChange={(e) => setBatchCerto(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-rose-400 mb-1">
                    Erradas (-1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={batchErrado}
                    onChange={(e) => setBatchErrado(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-center text-sm font-bold text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Branco (0)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={batchBranco}
                    onChange={(e) => setBatchBranco(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-center text-sm font-bold text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Batch Net Preview */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Pontos Líquidos nesta Bateria:</span>
                <span className="font-mono text-base font-bold text-white">
                  {batchCerto - batchErrado > 0 ? `+${batchCerto - batchErrado}` : batchCerto - batchErrado} pts
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Anotação Geral da Bateria (opcional)
                </label>
                <textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Ex: Simulado de Trânsito 10 questões banca Cebraspe 2024"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
