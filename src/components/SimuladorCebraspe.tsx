import React, { useState } from 'react';
import { FileSpreadsheet, Check, X, Minus, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const SimuladorCebraspe: React.FC = () => {
  // Bloco I (55 itens):
  const [b1Certo, setB1Certo] = useState<number>(32);
  const [b1Errado, setB1Errado] = useState<number>(14);
  const [b1Branco, setB1Branco] = useState<number>(9);

  // Bloco II (30 itens - Trânsito):
  const [b2Certo, setB2Certo] = useState<number>(22);
  const [b2Errado, setB2Errado] = useState<number>(5);
  const [b2Branco, setB2Branco] = useState<number>(3);

  // Bloco III (35 itens - Direito):
  const [b3Certo, setB3Certo] = useState<number>(23);
  const [b3Errado, setB3Errado] = useState<number>(8);
  const [b3Branco, setB3Branco] = useState<number>(4);

  // What-if simulator slider: "Quantos dos seus erros você teria deixado em branco?"
  const [convertedBlanks, setConvertedBlanks] = useState<number>(0);

  // Calculations
  const b1Liquid = b1Certo - b1Errado;
  const b2Liquid = b2Certo - b2Errado;
  const b3Liquid = b3Certo - b3Errado;

  const totalCerto = b1Certo + b2Certo + b3Certo;
  const totalErrado = b1Errado + b2Errado + b3Errado;
  const totalBranco = b1Branco + b2Branco + b3Branco;
  const totalItens = totalCerto + totalErrado + totalBranco;

  const baseLiquid = totalCerto - totalErrado;

  // What-if calculation: if N errors were left blank, each saved error gains +1 point (stops subtracting 1)
  const maxConvertible = totalErrado;
  const clampedConverted = Math.min(convertedBlanks, maxConvertible);
  const simulatedLiquid = baseLiquid + clampedConverted;

  const b1Passed = b1Liquid >= 10;
  const b2Passed = b2Liquid >= 10;
  const b3Passed = b3Liquid >= 10;
  const generalPassed = simulatedLiquid >= 48 && b1Passed && b2Passed && b3Passed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Simulador de Prova 120 Itens Cebraspe PRF</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ajuste as estimativas por bloco e veja o impacto matemático de deixar itens em branco versus arriscar o chute.
        </p>
      </div>

      {/* Main Score Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Pontuação Líquida Projetada
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                  {simulatedLiquid > 0 ? `+${simulatedLiquid}` : simulatedLiquid}
                </span>
                <span className="text-xs text-slate-400">/ 120 pontos possíveis</span>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-slate-800" />

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-emerald-400 font-bold text-sm tabular-nums">{totalCerto}</span>
                <div className="text-slate-400 text-[10px]">Certas</div>
              </div>
              <div>
                <span className="text-rose-400 font-bold text-sm tabular-nums">
                  {totalErrado - clampedConverted}
                </span>
                <div className="text-slate-400 text-[10px]">Erradas</div>
              </div>
              <div>
                <span className="text-slate-300 font-bold text-sm tabular-nums">
                  {totalBranco + clampedConverted}
                </span>
                <div className="text-slate-400 text-[10px]">Branco</div>
              </div>
            </div>
          </div>

          {/* Cutoff Status */}
          <div className="w-full lg:w-auto">
            {generalPassed ? (
              <div className="px-4 py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">Aprovado na Prova Objetiva</span>
                  <div className="text-[11px] text-emerald-400">
                    Acima dos 48 pts gerais e atinge os 10 pts em todos os 3 blocos.
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">Eliminado pelo Edital</span>
                  <div className="text-[11px] text-rose-400">
                    {!b1Passed
                      ? 'Eliminado no Bloco I (< 10 pts)'
                      : !b2Passed
                      ? 'Eliminado no Bloco II - Trânsito (< 10 pts)'
                      : !b3Passed
                      ? 'Eliminado no Bloco III (< 10 pts)'
                      : `Abaixo da nota de corte geral (${simulatedLiquid}/48 pts)`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning if total not 120 */}
        {totalItens !== 120 && (
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Atenção: A soma dos itens atuais é {totalItens} (a prova oficial da PRF possui exatamente 120 itens).
            </span>
          </div>
        )}
      </div>

      {/* Block Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bloco I */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Bloco I: Conhecimentos Gerais</h3>
            <span className="text-[11px] font-mono text-slate-400">
              Líquido: {b1Liquid > 0 ? `+${b1Liquid}` : b1Liquid} pts
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Total: {b1Certo + b1Errado + b1Branco} / 55 itens</div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-emerald-400 text-[10px]">Certo</label>
              <input
                type="number"
                min="0"
                max="55"
                value={b1Certo}
                onChange={(e) => setB1Certo(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-rose-400 text-[10px]">Errado</label>
              <input
                type="number"
                min="0"
                max="55"
                value={b1Errado}
                onChange={(e) => setB1Errado(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[10px]">Branco</label>
              <input
                type="number"
                min="0"
                max="55"
                value={b1Branco}
                onChange={(e) => setB1Branco(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Exigência: ≥ 10 pts ({b1Passed ? 'Apto' : 'Eliminado'})</div>
        </div>

        {/* Bloco II - Trânsito */}
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300">Bloco II: Trânsito (CTB)</h3>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              Líquido: {b2Liquid > 0 ? `+${b2Liquid}` : b2Liquid} pts
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Total: {b2Certo + b2Errado + b2Branco} / 30 itens</div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-emerald-400 text-[10px]">Certo</label>
              <input
                type="number"
                min="0"
                max="30"
                value={b2Certo}
                onChange={(e) => setB2Certo(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-rose-400 text-[10px]">Errado</label>
              <input
                type="number"
                min="0"
                max="30"
                value={b2Errado}
                onChange={(e) => setB2Errado(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[10px]">Branco</label>
              <input
                type="number"
                min="0"
                max="30"
                value={b2Branco}
                onChange={(e) => setB2Branco(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
          </div>
          <div className="text-[10px] text-amber-400/80">Exigência: ≥ 10 pts ({b2Passed ? 'Apto' : 'Eliminado'})</div>
        </div>

        {/* Bloco III */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Bloco III: Direito</h3>
            <span className="text-[11px] font-mono text-slate-400">
              Líquido: {b3Liquid > 0 ? `+${b3Liquid}` : b3Liquid} pts
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Total: {b3Certo + b3Errado + b3Branco} / 35 itens</div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-emerald-400 text-[10px]">Certo</label>
              <input
                type="number"
                min="0"
                max="35"
                value={b3Certo}
                onChange={(e) => setB3Certo(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-rose-400 text-[10px]">Errado</label>
              <input
                type="number"
                min="0"
                max="35"
                value={b3Errado}
                onChange={(e) => setB3Errado(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[10px]">Branco</label>
              <input
                type="number"
                min="0"
                max="35"
                value={b3Branco}
                onChange={(e) => setB3Branco(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Exigência: ≥ 10 pts ({b3Passed ? 'Apto' : 'Eliminado'})</div>
        </div>
      </div>

      {/* What-if Risk Analysis: The Power of Blank Items in Cebraspe */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-white">Laboratório Estratégico: O Poder de Deixar em Branco</span>
        </div>
        <p className="text-xs text-slate-400 mb-4 max-w-2xl">
          No Cebraspe, cada questão duvidosa que você chuta e erra custa <span className="text-rose-400 font-semibold">2 pontos líquidos</span> em relação a acertar, e <span className="text-amber-400 font-semibold">1 ponto líquido</span> em relação a não marcar nada!
        </p>

        <div className="space-y-2 max-w-lg">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">
              Simular deixar em branco <strong>{clampedConverted}</strong> itens que você teria errado:
            </span>
            <span className="font-mono text-amber-400 font-bold">+{clampedConverted} pts líquidos</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.min(25, totalErrado)}
            value={clampedConverted}
            onChange={(e) => setConvertedBlanks(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0 itens poupados</span>
            <span>{Math.min(25, totalErrado)} itens poupados</span>
          </div>
        </div>

        {clampedConverted > 0 && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Ao segurar a ansiedade e não chutar essas {clampedConverted} questões, sua nota líquida salta de{' '}
              <strong>{baseLiquid}</strong> para <strong>{simulatedLiquid} pontos líquidos</strong>!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
