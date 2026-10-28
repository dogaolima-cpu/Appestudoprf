export interface CodeFile {
  path: string;
  filename: string;
  language: string;
  step: string;
  description: string;
  code: string;
}

export const PYTHON_CODEBASE: CodeFile[] = [
  {
    path: 'requirements.txt',
    filename: 'requirements.txt',
    language: 'plaintext',
    step: 'Passo 1 - Fundação',
    description: 'Dependências modernas para FastAPI, SQLAlchemy 2.0, Bcrypt e PostgreSQL/SQLite',
    code: `fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.30
pydantic>=2.8.0
pydantic-settings>=2.4.0
bcrypt>=4.2.0
python-multipart>=0.0.9
jinja2>=3.1.4
psycopg2-binary>=2.9.9
google-genai>=2.4.0
`,
  },
  {
    path: 'app/config.py',
    filename: 'config.py',
    language: 'python',
    step: 'Passo 1 - Fundação',
    description: 'Configuração híbrida de banco de dados (SQLite local vs PostgreSQL no Render)',
    code: `import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "PRF Tracker - Underline Tech"
    # Se DATABASE_URL estiver configurada no Render (Supabase/Neon), usa Postgres.
    # Caso contrário, instancia SQLite local para desenvolvimento rápido.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./estudos_prf.db"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chave_secreta_padrao_trocar_em_producao_prf_2027")
    COOKIE_NAME: str = "prf_session_token"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()

# Correção automática para URLs antigas do PostgreSQL (postgres:// vs postgresql://)
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
`,
  },
  {
    path: 'app/database.py',
    filename: 'database.py',
    language: 'python',
    step: 'Passo 1 - Fundação',
    description: 'Conexão SQLAlchemy 2.0 e gerador de sessão get_db()',
    code: `from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`,
  },
  {
    path: 'app/models.py',
    filename: 'models.py',
    language: 'python',
    step: 'Passo 1 - Fundação',
    description: 'Modelos ORM com isolamento estrito por usuário, blocos e pesos da PRF',
    code: `import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class CebraspeBlock(str, enum.Enum):
    BLOCO_1 = "Bloco I - Conhecimentos Gerais"
    BLOCO_2 = "Bloco II - Legislação de Trânsito"
    BLOCO_3 = "Bloco III - Conhecimentos Específicos"

class QuestionResult(str, enum.Enum):
    CERTO = "CERTO"
    ERRADO = "ERRADO"
    BRANCO = "BRANCO"

class QuestionDifficulty(str, enum.Enum):
    FACIL = "FACIL"
    MEDIO = "MEDIO"
    DIFICIL = "DIFICIL"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    logs = relationship("QuestionLog", back_populates="user", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    block = Column(Enum(CebraspeBlock), nullable=False)
    weight = Column(Integer, default=1, nullable=False)

    logs = relationship("QuestionLog", back_populates="subject")

class QuestionLog(Base):
    __tablename__ = "question_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    
    result = Column(Enum(QuestionResult), nullable=False)
    difficulty = Column(Enum(QuestionDifficulty), nullable=False)
    notes = Column(Text, nullable=True)
    reviewed = Column(Boolean, default=False, nullable=False)
    time_spent_seconds = Column(Integer, default=60, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="logs")
    subject = relationship("Subject", back_populates="logs")
`,
  },
  {
    path: 'app/schemas.py',
    filename: 'schemas.py',
    language: 'python',
    step: 'Passo 2 - Segurança & Validações',
    description: 'Esquemas Pydantic v2 com validações rigorosas de email, senhas e payload de questões',
    code: `from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import QuestionResult, QuestionDifficulty, CebraspeBlock

# Esquemas de Autenticação
class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Esquemas de Questões
class QuestionLogCreate(BaseModel):
    subject_id: int
    result: QuestionResult
    difficulty: QuestionDifficulty = QuestionDifficulty.MEDIO
    notes: Optional[str] = None
    time_spent_seconds: Optional[int] = 60

class QuestionLogResponse(BaseModel):
    id: int
    subject_id: int
    result: QuestionResult
    difficulty: QuestionDifficulty
    notes: Optional[str]
    reviewed: bool
    created_at: datetime

    class Config:
        from_attributes = True
`,
  },
  {
    path: 'app/security.py',
    filename: 'security.py',
    language: 'python',
    step: 'Passo 2 - Segurança & Validações',
    description: 'Hashing de senhas com Bcrypt direto, geração de tokens seguros e dependência get_current_user',
    code: `import bcrypt
import secrets
from fastapi import Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.config import settings

def hash_password(password: str) -> str:
    """Gera o hash da senha em bcrypt com salt seguro."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara senha em texto puro com o hash bcrypt armazenado."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

# Gerenciamento de Sessão Segura baseada em Cookie HttpOnly
# (Mapeamento de token de sessão para user_id em memória ou banco)
ACTIVE_SESSIONS: dict[str, int] = {}

def create_session_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[token] = user_id
    return token

def revoke_session_token(token: str) -> None:
    ACTIVE_SESSIONS.pop(token, None)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token or token not in ACTIVE_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado. Faça login para acessar este recurso."
        )
    user_id = ACTIVE_SESSIONS[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado.")
    return user
`,
  },
  {
    path: 'app/services/prf_engine.py',
    filename: 'prf_engine.py',
    language: 'python',
    step: 'Passo 2 - Regras Cebraspe',
    description: 'Motor matemático Cebraspe: cálculo líquido (Certo - Errado), índices por bloco e verificação de mínimos',
    code: `from typing import List, Dict, Any
from app.models import QuestionLog, QuestionResult, CebraspeBlock, Subject

def calculate_cebraspe_metrics(logs: List[QuestionLog], subjects: List[Subject]) -> Dict[str, Any]:
    """
    Regra Oficial CEBRASPE para a PRF:
    - 1 Questão Errada ANULA 1 Questão Certa (Líquido = Certo - Errado)
    - Questão em Branco não soma nem subtrai
    - Mínimos eliminatórios:
        * Bloco I >= 10 pontos líquidos
        * Bloco II >= 10 pontos líquidos (Trânsito - Peso Máximo)
        * Bloco III >= 10 pontos líquidos
        * Total Geral da Prova Objetiva >= 48 pontos líquidos
    """
    subject_map = {s.id: s for s in subjects}

    total_certo = 0
    total_errado = 0
    total_branco = 0

    block_data: Dict[str, Dict[str, int]] = {
        CebraspeBlock.BLOCO_1.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
        CebraspeBlock.BLOCO_2.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
        CebraspeBlock.BLOCO_3.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
    }

    for log in logs:
        s = subject_map.get(log.subject_id)
        if not s:
            continue
        blk = s.block.value

        if log.result == QuestionResult.CERTO:
            total_certo += 1
            block_data[blk]["certo"] += 1
        elif log.result == QuestionResult.ERRADO:
            total_errado += 1
            block_data[blk]["errado"] += 1
        elif log.result == QuestionResult.BRANCO:
            total_branco += 1
            block_data[blk]["branco"] += 1

    total_questions = total_certo + total_errado + total_branco
    liquid_total = total_certo - total_errado
    marked = total_certo + total_errado
    efficiency = round((liquid_total / marked * 100), 1) if marked > 0 else 0.0

    # Diagnóstico por Bloco
    blocks_report = {}
    any_block_failed = False
    for blk_name, counts in block_data.items():
        blk_liquid = counts["certo"] - counts["errado"]
        passed = blk_liquid >= counts["min"]
        if not passed:
            any_block_failed = True
        
        blk_marked = counts["certo"] + counts["errado"]
        blk_eff = round((blk_liquid / blk_marked * 100), 1) if blk_marked > 0 else 0.0
        blocks_report[blk_name] = {
            "certo": counts["certo"],
            "errado": counts["errado"],
            "branco": counts["branco"],
            "liquid": blk_liquid,
            "min_required": counts["min"],
            "passed": passed,
            "efficiency": blk_eff
        }

    general_passed = liquid_total >= 48 and not any_block_failed

    return {
        "total_questions": total_questions,
        "certo": total_certo,
        "errado": total_errado,
        "branco": total_branco,
        "liquid_total": liquid_total,
        "efficiency": efficiency,
        "general_passed": general_passed,
        "blocks": blocks_report
    }
`,
  },
  {
    path: 'app/routes/auth_routes.py',
    filename: 'auth_routes.py',
    language: 'python',
    step: 'Passo 2 - Autenticação & Rotas',
    description: 'Rotas completas de Registro, Login e Logout com Cookie HttpOnly',
    code: `from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegisterSchema, UserLoginSchema
from app.security import hash_password, verify_password, create_session_token, revoke_session_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register")
def register(user_in: UserRegisterSchema, response: Response, db: Session = Depends(get_db)):
    # 1. Verifica se o email já existe
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este endereço de email já está cadastrado no sistema."
        )

    # 2. Cria usuário com senha criptografada em Bcrypt
    hashed = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 3. Cria sessão automática após registro
    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False  # Alterar para True em produção HTTPS
    )

    return {"message": "Conta criada com sucesso", "user_id": user.id, "name": user.name}

@router.post("/login")
def login(credentials: UserLoginSchema, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. Verifique seu email e senha."
        )

    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return {"message": "Login realizado com sucesso", "user_id": user.id, "name": user.name}

@router.post("/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get(settings.COOKIE_NAME)
    if token:
        revoke_session_token(token)
    response.delete_cookie(key=settings.COOKIE_NAME)
    return {"message": "Sessão encerrada com sucesso"}
`,
  },
  {
    path: 'seed_prf.py',
    filename: 'seed_prf.py',
    language: 'python',
    step: 'Passo 1 - Fundação',
    description: 'Script para popular matérias e pesos do edital oficial da PRF',
    code: `from app.database import engine, Base, SessionLocal
from app.models import Subject, CebraspeBlock

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Subject).count() > 0:
            print("Disciplinas da PRF já cadastradas.")
            return

        materias = [
            {"name": "Língua Portuguesa", "block": CebraspeBlock.BLOCO_1, "weight": 5},
            {"name": "Raciocínio Lógico-Matemático", "block": CebraspeBlock.BLOCO_1, "weight": 3},
            {"name": "Informática", "block": CebraspeBlock.BLOCO_1, "weight": 3},
            {"name": "Noções de Física", "block": CebraspeBlock.BLOCO_1, "weight": 2},
            {"name": "Ética e Cidadania", "block": CebraspeBlock.BLOCO_1, "weight": 1},
            {"name": "Geopolítica Brasileira", "block": CebraspeBlock.BLOCO_1, "weight": 1},
            {"name": "Língua Estrangeira (Inglês/Espanhol)", "block": CebraspeBlock.BLOCO_1, "weight": 2},
            {"name": "Legislação de Trânsito (CTB e Resoluções)", "block": CebraspeBlock.BLOCO_2, "weight": 10},
            {"name": "Direito Administrativo", "block": CebraspeBlock.BLOCO_3, "weight": 4},
            {"name": "Direito Constitucional", "block": CebraspeBlock.BLOCO_3, "weight": 4},
            {"name": "Direito Penal", "block": CebraspeBlock.BLOCO_3, "weight": 3},
            {"name": "Direito Processual Penal", "block": CebraspeBlock.BLOCO_3, "weight": 3},
            {"name": "Legislação Especial", "block": CebraspeBlock.BLOCO_3, "weight": 3},
            {"name": "Direitos Humanos", "block": CebraspeBlock.BLOCO_3, "weight": 2},
        ]

        for m in materias:
            subject = Subject(name=m["name"], block=m["block"], weight=m["weight"])
            db.add(subject)
        
        db.commit()
        print(f"Sucesso: {len(materias)} disciplinas da PRF inseridas.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
`,
  },
  {
    path: 'render.yaml',
    filename: 'render.yaml',
    language: 'yaml',
    step: 'Deploy em Produção',
    description: 'Blueprint de deploy automático no Render com build e start command',
    code: `services:
  - type: web
    name: prf-tracker
    runtime: python
    buildCommand: pip install -r requirements.txt && python seed_prf.py
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
`,
  },
];
