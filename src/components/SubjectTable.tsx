import React, { useState } from 'react';
import { Subject } from '../types/prf';
import { Plus, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface SubjectTableProps {
  subjectStats: Array<
    Subject & {
      certo: number;
      errado: number;
      branco: number;
      total: number;
      liquid: number;
      accuracy: number;
      errorRate: number;
    }
  >;
  onLogSubject: (subjectId: number) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({ subjectStats, onLogSubject }) => {
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'weight' | 'total' | 'liquid' | 'accuracy'>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = subjectStats.filter((s) => {
    if (filterBlock === 'all') return true;
    return s.block === filterBlock;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortOrder === 'asc'
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });

  const handleSort = (field: 'name' | 'weight' | 'total' | 'liquid' | 'accuracy') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Matriz de Disciplinas & Pesos Oficiais da PRF
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            14 matérias mapeadas com saldo líquido e taxa de penalização por erro Cebraspe.
          </p>
        </div>

        {/* Filter by Block */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterBlock('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterBlock === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterBlock('Bloco II - Legislação de Trânsito')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterBlock === 'Bloco II - Legislação de Trânsito'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            Bloco II (Trânsito)
          </button>
          <button
            onClick={() => setFilterBlock('Bloco I - Conhecimentos Gerais')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterBlock === 'Bloco I - Conhecimentos Gerais'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            Bloco I
          </button>
          <button
            onClick={() => setFilterBlock('Bloco III - Conhecimentos Específicos')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterBlock === 'Bloco III - Conhecimentos Específicos'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            Bloco III
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40 text-[11px] font-semibold tracking-wider uppercase">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-white select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Disciplina</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Bloco</th>
              <th
                onClick={() => handleSort('weight')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Peso Edital</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('total')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white select-none"
              >
                <span>Resolvidas</span>
              </th>
              <th className="py-3 px-3 text-center">C / E / B</th>
              <th
                onClick={() => handleSort('liquid')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Pontos Líquidos</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('accuracy')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white select-none"
              >
                <span>Precisão</span>
              </th>
              <th className="py-3 px-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-800/40 transition-colors group h-11"
              >
                {/* Disciplina */}
                <td className="py-2.5 px-4 font-semibold text-white">
                  <div className="flex items-center gap-2">
                    {item.block.includes('Bloco II') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Matéria mais pesada da PRF" />
                    )}
                    <span className="truncate max-w-[220px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </td>

                {/* Bloco */}
                <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                  {item.block.split(' - ')[0]}
                </td>

                {/* Peso */}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300 font-bold">
                  {item.weight}x
                </td>

                {/* Total */}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {item.total}
                </td>

                {/* C / E / B */}
                <td className="py-2.5 px-3 text-center font-mono text-[11px] whitespace-nowrap">
                  <span className="text-emerald-400 font-semibold">{item.certo}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-rose-400 font-semibold">{item.errado}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-500">{item.branco}</span>
                </td>

                {/* Líquido */}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                  <span
                    className={
                      item.liquid > 0
                        ? 'text-emerald-400'
                        : item.liquid < 0
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    }
                  >
                    {item.liquid > 0 ? `+${item.liquid}` : item.liquid}
                  </span>
                </td>

                {/* Precisão */}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                  {item.accuracy}%
                </td>

                {/* Ação */}
                <td className="py-2.5 px-4 text-center">
                  <button
                    onClick={() => onLogSubject(item.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-400 transition-colors cursor-pointer"
                    title={`Lançar questões em ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
