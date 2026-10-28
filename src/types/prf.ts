export type CebraspeBlock =
  | 'Bloco I - Conhecimentos Gerais'
  | 'Bloco II - Legislação de Trânsito'
  | 'Bloco III - Conhecimentos Específicos';

export type QuestionResult = 'CERTO' | 'ERRADO' | 'BRANCO';
export type QuestionDifficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export interface Subject {
  id: number;
  name: string;
  block: CebraspeBlock;
  weight: number;
  expectedQuestions: number;
}

export interface QuestionLog {
  id: string;
  userId: string;
  subjectId: number;
  result: QuestionResult;
  difficulty: QuestionDifficulty;
  notes?: string;
  reviewed?: boolean;
  timeSpentSeconds?: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetExam: string;
  targetYear: number;
  dailyGoalQuestions: number;
}

export interface BlockMetric {
  block: CebraspeBlock;
  certo: number;
  errado: number;
  branco: number;
  total: number;
  liquidScore: number;
  minRequired: number;
  passed: boolean;
  efficiency: number;
}

export interface CebraspeStats {
  totalQuestions: number;
  certo: number;
  errado: number;
  branco: number;
  liquidScore: number;
  accuracy: number;
  liquidEfficiency: number;
  eliminatedByMinima: boolean;
  blockMetrics: Record<CebraspeBlock, BlockMetric>;
  generalCutoffPassed: boolean;
}

export interface AIDiagnostic {
  diagnostico_geral: string;
  status_corte: 'APROVADO' | 'ALERTA_ELIMINACAO_BLOCOS' | 'ABAIXO_DO_CORTE';
  analise_bloco_2_transito: string;
  estrategia_chute_e_branco: string;
  plano_tatica_7_dias: string[];
  alerta_pegadinhas: string[];
}

export interface DrillItem {
  id: string;
  subject: string;
  statement: string;
  correct: QuestionResult;
  explanation: string;
  trap_alert: string;
  difficulty: QuestionDifficulty;
  userAnswer?: QuestionResult;
}
