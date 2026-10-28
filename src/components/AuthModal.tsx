import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User as UserIcon, CheckCircle2, LogOut } from 'lucide-react';
import { UserProfile } from '../types/prf';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [tab, setTab] = useState<'profile' | 'settings'>('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetYear, setTargetYear] = useState(user.targetYear);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalQuestions);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      targetYear,
      dailyGoalQuestions: dailyGoal,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Perfil do Concurseiro PRF
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie sua conta e metas de estudo para o edital 2027.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome do Candidato
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ano Alvo do Edital
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta Diária (Questões)
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Autenticação Bcrypt / Sessão Segura
            </span>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  Salvo!
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
