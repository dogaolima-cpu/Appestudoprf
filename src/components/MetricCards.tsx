import React from 'react';
import { Award, AlertTriangle, CheckCircle2, TrendingUp, Check, X, Minus } from 'lucide-react';
import { CebraspeStats } from '../types/prf';

interface MetricCardsProps {
  stats: CebraspeStats;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const isGeneralCutoffPassed = stats.liquidScore >= 48 && !stats.eliminatedByMinima;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pontos Líquidos Cebraspe */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Pontuação Líquida</span>
          <span className="font-mono text-slate-500 text-[11px]">Certo - Errado</span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
            {stats.liquidScore > 0 ? `+${stats.liquidScore}` : stats.liquidScore}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            / {stats.totalQuestions} itens
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          {stats.liquidScore >= 48 ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acima do corte geral (≥ 48 pts)
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Meta de aprovação: 48 pts ({48 - stats.liquidScore} pts restantes)
            </span>
          )}
        </div>
      </div>

      {/* 2. Distribuição Real dos Itens */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="text-xs text-slate-400">
          <span>Distribuição de Itens</span>
        </div>
        <div className="my-2.5 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
            <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-1">
              <Check className="w-3 h-3" /> Certas
            </div>
            <div className="text-lg font-bold text-emerald-300 font-mono tabular-nums mt-0.5">
              {stats.certo}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-rose-950/40 border border-rose-900/50">
            <div className="text-[10px] text-rose-400 font-medium flex items-center justify-center gap-1">
              <X className="w-3 h-3" /> Erradas
            </div>
            <div className="text-lg font-bold text-rose-300 font-mono tabular-nums mt-0.5">
              {stats.errado}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Minus className="w-3 h-3" /> Branco
            </div>
            <div className="text-lg font-bold text-slate-300 font-mono tabular-nums mt-0.5">
              {stats.branco}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Total respondidas</span>
          <span className="font-mono tabular-nums text-slate-300 font-semibold">{stats.totalQuestions}</span>
        </div>
      </div>

      {/* 3. Eficiência Líquida Cebraspe */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Eficiência Líquida</span>
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
            {stats.liquidEfficiency}%
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            (bruto: {stats.accuracy}%)
          </span>
        </div>
        <div className="text-xs text-slate-400">
          <span>{stats.errado} erros anularam {stats.errado} acertos</span>
        </div>
      </div>

      {/* 4. Diagnóstico de Eliminação por Bloco */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Status do Edital PRF</span>
          <Award className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="my-3">
          <div className="text-lg font-bold text-white flex items-center gap-1.5">
            {isGeneralCutoffPassed ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Habilitado
              </span>
            ) : stats.eliminatedByMinima ? (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> Risco de Bloco
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> Em Construção
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Min. 10 por bloco</span>
          <span aria-hidden="true">·</span>
          <span>Min. 48 geral</span>
        </div>
      </div>
    </div>
  );
};
