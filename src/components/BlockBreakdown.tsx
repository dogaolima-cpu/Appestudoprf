import React from 'react';
import { Shield, BookOpen, AlertCircle, CheckCircle, Scale } from 'lucide-react';
import { CebraspeStats, Subject } from '../types/prf';

interface BlockBreakdownProps {
  stats: CebraspeStats;
  subjects: Subject[];
  subjectStats: Array<Subject & { certo: number; errado: number; branco: number; total: number; liquid: number; errorRate: number }>;
}

export const BlockBreakdown: React.FC<BlockBreakdownProps> = ({
  stats,
  subjects,
  subjectStats,
}) => {
  const blocks = [
    {
      name: 'Bloco I - Conhecimentos Gerais',
      title: 'Bloco I: Conhecimentos Gerais',
      subtitle: '55 itens esperados · Peso intermediário',
      icon: BookOpen,
      metric: stats.blockMetrics['Bloco I - Conhecimentos Gerais'],
      isHighlight: false,
    },
    {
      name: 'Bloco II - Legislação de Trânsito',
      title: 'Bloco II: Legislação de Trânsito (CTB)',
      subtitle: '30 itens esperados · Peso 10 (Vital para Aprovação)',
      icon: Shield,
      metric: stats.blockMetrics['Bloco II - Legislação de Trânsito'],
      isHighlight: true,
    },
    {
      name: 'Bloco III - Conhecimentos Específicos',
      title: 'Bloco III: Conhecimentos Jurídicos',
      subtitle: '35 itens esperados · Direito Penal, Proc. Penal, Const, Adm',
      icon: Scale,
      metric: stats.blockMetrics['Bloco III - Conhecimentos Específicos'],
      isHighlight: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>Desempenho por Blocos Oficiais da PRF</span>
          <span className="text-xs text-slate-400 font-normal">
            (Exigência do Cebraspe: Mínimo de 10 pts líquidos em cada bloco)
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {blocks.map((blk) => {
          const Icon = blk.icon;
          const metric = blk.metric || {
            certo: 0,
            errado: 0,
            branco: 0,
            liquidScore: 0,
            passed: false,
            minRequired: 10,
            efficiency: 0,
          };
          const blkSubjects = subjectStats.filter((s) => s.block === blk.name);
          const progressPercent = Math.min(100, Math.max(0, (metric.liquidScore / 10) * 100));

          return (
            <div
              key={blk.name}
              className={`rounded-xl p-5 flex flex-col justify-between transition-all ${
                blk.isHighlight
                  ? 'bg-slate-900/90 border-2 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/70 border border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        blk.isHighlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {blk.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{blk.subtitle}</p>
                    </div>
                  </div>

                  {metric.passed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" /> Apto (≥10)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" /> Mínimo pendente
                    </span>
                  )}
                </div>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between py-2 border-y border-slate-800/80 mb-3">
                  <div>
                    <span className="text-2xl font-bold font-mono tabular-nums text-white">
                      {metric.liquidScore > 0 ? `+${metric.liquidScore}` : metric.liquidScore}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-medium">pts líquidos</span>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-semibold">{metric.certo}C</span>
                    <span className="mx-1">/</span>
                    <span className="font-mono text-rose-400 font-semibold">{metric.errado}E</span>
                    <span className="mx-1">/</span>
                    <span className="font-mono text-slate-400">{metric.branco}B</span>
                  </div>
                </div>

                {/* Progress toward 10 points minimum */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Meta de corte do edital</span>
                    <span className="font-mono tabular-nums">{metric.liquidScore} / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        metric.passed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Subjects in this block */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Disciplinas
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {blkSubjects.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-slate-300 truncate max-w-[170px]" title={s.name}>
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                          <span
                            className={`font-semibold tabular-nums ${
                              s.liquid > 0
                                ? 'text-emerald-400'
                                : s.liquid < 0
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {s.liquid > 0 ? `+${s.liquid}` : s.liquid}
                          </span>
                          <span className="text-slate-500 text-[10px]">({s.total} res.)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
