import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Diagnostic Engine for PRF Studies
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { stats, blockStats, worstSubjects, recentMistakes } = req.body;

    const prompt = `Você é o Coordenador Pedagógico e Estrategista Chefe para o concurso da Polícia Rodoviária Federal (PRF), especialista no método e perfil da banca CEBRASPE (Cespe).

Analise o desempenho atual do aluno Douglas para o cargo de Policial Rodoviário Federal:

DADOS GERAIS:
- Total de Questões Resolvidas: ${stats?.total || 0}
- Acertos (Certo): ${stats?.certo || 0}
- Erros (Errado): ${stats?.errado || 0}
- Deixadas em Branco: ${stats?.branco || 0}
- PONTOS LÍQUIDOS CEBRASPE (Certo - Errado): ${stats?.liquidScore || 0}
- Taxa de Precisão Bruta: ${stats?.accuracy || 0}%
- Eficiência Líquida: ${stats?.liquidEfficiency || 0}%

DESEMPENHO POR BLOCO (Mínimos do Edital Cebraspe PRF: Bloco I >= 10, Bloco II >= 10, Bloco III >= 10, Total >= 48):
${JSON.stringify(blockStats || {}, null, 2)}

DISCIPLINAS COM MAIOR ÍNDICE DE ERRO:
${JSON.stringify(worstSubjects || [], null, 2)}

ANOTAÇÕES RECENTES DO CADERNO DE ERROS (PEGADINHAS):
${JSON.stringify(recentMistakes || [], null, 2)}

Retorne uma análise cirúrgica e motivadora em formato JSON estruturado com os seguintes campos:
1. "diagnostico_geral": texto de 2 a 3 parágrafos objetivos avaliando se o aluno seria aprovado na prova objetiva considerando os pontos de corte e mínimos eliminatórios da PRF.
2. "status_corte": "APROVADO", "ALERTA_ELIMINACAO_BLOCOS" ou "ABAIXO_DO_CORTE".
3. "analise_bloco_2_transito": avaliação detalhada do Bloco II (CTB e Resoluções CONTRAN), que representa o maior peso do concurso (30 itens / peso 10).
4. "estrategia_chute_e_branco": recomendação matemática Cebraspe sobre a postura do candidato em deixar em branco vs marcar na dúvida com base no seu percentual de erro atual.
5. "plano_tatica_7_dias": lista de 4 a 6 passos práticos prioritários para os próximos 7 dias.
6. "alerta_pegadinhas": 2 a 3 dicas cruciais sobre pegadinhas clássicas do Cebraspe para a PRF (ex: inversão de competências da PRF e PM, requisitos de crimes de trânsito, literalidade de resoluções).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const jsonResult = JSON.parse(text);
    return res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error('Erro na análise com Gemini:', error);
    return res.status(500).json({
      success: false,
      message: 'Falha ao processar diagnóstico de IA',
      error: error?.message || String(error),
    });
  }
});

// Endpoint: Generate Cebraspe PRF Drill Questions
app.post('/api/gemini/generate-drill', async (req: Request, res: Response) => {
  try {
    const { subject, count = 3 } = req.body;

    const prompt = `Crie exatamente ${count} questões inéditas no estilo CEBRASPE (item de CERTO ou ERRADO) focadas no concurso da Polícia Rodoviária Federal (PRF) para a disciplina: "${subject || 'Legislação de Trânsito - CTB'}".

Requisitos:
- Linguagem formal, assertiva, típica da banca Cebraspe/Cespe.
- Itens realistas baseados na legislação vigente (CTB atualizado, CF/88, CP, CPP ou resoluções CONTRAN).
- Responda estritamente em formato JSON com o array de objetos contendo:
  - "id": string numérica
  - "subject": nome da disciplina
  - "statement": enunciado completo do item
  - "correct": "CERTO" ou "ERRADO"
  - "explanation": fundamentação jurídica e legal (artigo da lei/jurisprudência)
  - "trap_alert": qual pegadinha da banca estava oculta no item
  - "difficulty": "FACIL", "MEDIO" ou "DIFICIL"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const items = JSON.parse(text);
    return res.json({ success: true, items });
  } catch (error: any) {
    console.error('Erro ao gerar questões com Gemini:', error);
    return res.status(500).json({
      success: false,
      message: 'Falha ao gerar itens de treino',
      error: error?.message || String(error),
    });
  }
});

// Serve frontend in dev via Vite middlewares, or static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PRF Tracker server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
