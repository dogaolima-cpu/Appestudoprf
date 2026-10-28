# PRF Study Tracker - Sistema Tático de Gestão de Estudos

[![Python Version](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/framework-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy%202.0-red.svg)](https://www.sqlalchemy.org/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20SQLite-blue.svg)](https://neon.tech)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Aplicação web desenvolvida para planejamento e controle de estudos focado no concurso da Polícia Rodoviária Federal (PRF - Edital previsto para 2027). 

O sistema implementa a regra real da banca **Cebraspe** (onde uma questão errada anula uma certa), cálculo de pontuação líquida ponderada por disciplina e diagnóstico por grau de dificuldade percebida.

---

## Diferenciais de Engenharia e Negócio

* **Mecânica Cebraspe Real:** Diferente de controles convencionais de acertos percentuais, o sistema calcula a **pontuação líquida** (`Pontos = Certas - Erradas`), penalizando o erro de acordo com as regras de corte por blocos da PRF.
* **Ponderação por Disciplina:** Matriz de pesos que reflete a importância estratégica do edital, com destaque absoluto para o Bloco II (Legislação de Trânsito - 25% da prova objetiva).
* **Diagnóstico de Calibração (Fácil / Médio / Difícil):** Cruzamento da percepção do candidato com a taxa de erro real para identificar zonas de falsa confiança (efeito Dunning-Kruger).
* **Multi-tenancy com Isolamento Estrito:** Arquitetura relacional isolada por usuário via chaves estrangeiras e sessões seguras em Cookies HTTP-Only, garantindo total privacidade entre diferentes concurseiros.
* **Arquitetura Desacoplada e Híbrida:** Suporte transparente para execução local (SQLite de baixa latência) e produção em nuvem distribuída (PostgreSQL gerenciado via Neon Serverless) sem alteração de código.

---

## Arquitetura e Padrões de Projeto

O projeto utiliza uma variação simplificada de **Clean Architecture** com FastAPI:

```text
prf-estudos/
├── app/
│   ├── config.py             # Deteccao de ambiente e settings (Pydantic v2)
│   ├── database.py           # Engine e Session Factory (SQLAlchemy 2.0)
│   ├── models.py             # Modelos ORM relacionais tipados
│   ├── schemas.py            # Contratos de entrada e saida (DTOs)
│   ├── security.py           # Criptografia de senhas (bcrypt) e controle de sessao
│   ├── services/
│   │   ├── prf_engine.py     # Motor deterministico de calculo Cebraspe
│   │   └── ai_adapter.py     # Adapter Pattern para expansao de Agente de IA
│   ├── routes/               # Controladores modulares (Auth e Dashboard)
│   └── templates/            # Views renderizadas no servidor (Jinja2/Tailwind)
├── seed_prf.py               # Seed com a grade oficial do ultimo edital PRF
└── requirements.txt          # Dependencias pinadas e compativeis
```

### Preparação para Inteligência Artificial (Adapter Pattern)
O sistema foi concebido com pontos de extensão para atuarem como Mentor Tático Automatizado. A camada `app/services/ai_adapter.py` expõe interfaces desacopladas prontas para conectar provedores LLM (OpenAI, Anthropic ou DeepSeek) para diagnósticos preditivos de estudo, sem acoplar a infraestrutura web às APIs externas.

### Stack Tecnológica
* **Linguagem:** Python 3.11+
* **Framework Web:** FastAPI (alta performance assíncrona e geração de OpenAPI/Swagger)
* **Persistência de Dados:** SQLAlchemy 2.0 + Psycopg v3
* **Banco de Dados:** PostgreSQL (Produção no Neon) / SQLite (Desenvolvimento)
* **Segurança:** Bcrypt para hashing de credenciais e proteção contra ataques de injeção
* **Frontend:** Jinja2 Templates estilizados com Tailwind CSS
