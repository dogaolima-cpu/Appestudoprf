import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Shield, Check, Plus } from 'lucide-react';
import { Subject } from '../types/prf';

interface StudyTimerProps {
  subjects: Subject[];
  onOpenLogModal: () => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onOpenLogModal }) => {
  const [mode, setMode] = useState<'pomodoro' | 'deep' | 'stopwatch'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(8); // Default Trânsito
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsedSeconds((prev) => prev + 1);
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleModeChange = (newMode: 'pomodoro' | 'deep' | 'stopwatch') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'pomodoro') setSecondsLeft(25 * 60);
    else if (newMode === 'deep') setSecondsLeft(50 * 60);
    else setElapsedSeconds(0);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setSecondsLeft(25 * 60);
    else if (mode === 'deep') setSecondsLeft(50 * 60);
    else setElapsedSeconds(0);
  };

  const displaySeconds = mode === 'stopwatch' ? elapsedSeconds : secondsLeft;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ciclo de Estudo Ativo
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-amber-400 font-medium truncate max-w-[150px]">
              {selectedSubject?.name || 'Trânsito'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mode Switches & Timer Display */}
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'pomodoro' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            25m
          </button>
          <button
            onClick={() => handleModeChange('deep')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'deep' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            50m
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'stopwatch' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Livre
          </button>
        </div>

        <div className="font-mono text-2xl font-extrabold text-white tracking-wider tabular-nums">
          {formattedTime}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              isActive
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
            title={isActive ? 'Pausar' : 'Iniciar'}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Launch Questions */}
      <button
        onClick={onOpenLogModal}
        className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-400 text-xs text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
      >
        <Plus className="w-3.5 h-3.5" />
        Lançar Bloco Resolvido
      </button>
    </div>
  );
};
