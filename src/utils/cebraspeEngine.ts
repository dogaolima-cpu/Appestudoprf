import { QuestionLog, Subject, CebraspeBlock, CebraspeStats, BlockMetric } from '../types/prf';

export function calculateCebraspeStats(logs: QuestionLog[], subjects: Subject[]): CebraspeStats {
  const subjectMap = new Map<number, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  let totalCerto = 0;
  let totalErrado = 0;
  let totalBranco = 0;

  const blockData: Record<CebraspeBlock, { certo: number; errado: number; branco: number; min: number }> = {
    'Bloco I - Conhecimentos Gerais': { certo: 0, errado: 0, branco: 0, min: 10 },
    'Bloco II - Legislação de Trânsito': { certo: 0, errado: 0, branco: 0, min: 10 },
    'Bloco III - Conhecimentos Específicos': { certo: 0, errado: 0, branco: 0, min: 10 },
  };

  logs.forEach((log) => {
    const subject = subjectMap.get(log.subjectId);
    if (!subject) return;

    const block = subject.block;
    if (log.result === 'CERTO') {
      totalCerto++;
      blockData[block].certo++;
    } else if (log.result === 'ERRADO') {
      totalErrado++;
      blockData[block].errado++;
    } else if (log.result === 'BRANCO') {
      totalBranco++;
      blockData[block].branco++;
    }
  });

  const totalQuestions = totalCerto + totalErrado + totalBranco;
  const liquidScore = totalCerto - totalErrado;
  const marked = totalCerto + totalErrado;
  const accuracy = marked > 0 ? (totalCerto / marked) * 100 : 0;
  const liquidEfficiency = marked > 0 ? (liquidScore / marked) * 100 : 0;

  let anyBlockFailed = false;
  const blockMetrics = {} as Record<CebraspeBlock, BlockMetric>;

  (Object.keys(blockData) as CebraspeBlock[]).forEach((block) => {
    const data = blockData[block];
    const bLiquid = data.certo - data.errado;
    const bMarked = data.certo + data.errado;
    const passed = bLiquid >= data.min;
    if (!passed) anyBlockFailed = true;

    blockMetrics[block] = {
      block,
      certo: data.certo,
      errado: data.errado,
      branco: data.branco,
      total: data.certo + data.errado + data.branco,
      liquidScore: bLiquid,
      minRequired: data.min,
      passed,
      efficiency: bMarked > 0 ? (bLiquid / bMarked) * 100 : 0,
    };
  });

  const generalCutoffPassed = liquidScore >= 48 && !anyBlockFailed;

  return {
    totalQuestions,
    certo: totalCerto,
    errado: totalErrado,
    branco: totalBranco,
    liquidScore,
    accuracy: Math.round(accuracy * 10) / 10,
    liquidEfficiency: Math.round(liquidEfficiency * 10) / 10,
    eliminatedByMinima: anyBlockFailed,
    blockMetrics,
    generalCutoffPassed,
  };
}

export function getSubjectStats(logs: QuestionLog[], subjects: Subject[]) {
  return subjects.map((subj) => {
    const subjLogs = logs.filter((l) => l.subjectId === subj.id);
    const certo = subjLogs.filter((l) => l.result === 'CERTO').length;
    const errado = subjLogs.filter((l) => l.result === 'ERRADO').length;
    const branco = subjLogs.filter((l) => l.result === 'BRANCO').length;
    const total = subjLogs.length;
    const marked = certo + errado;
    const liquid = certo - errado;
    const accuracy = marked > 0 ? (certo / marked) * 100 : 0;
    const errorRate = marked > 0 ? (errado / marked) * 100 : 0;

    return {
      ...subj,
      certo,
      errado,
      branco,
      total,
      liquid,
      accuracy: Math.round(accuracy * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10,
    };
  });
}
