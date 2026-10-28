import enum
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
    target_year = Column(Integer, default=2027, nullable=False)
    daily_goal_questions = Column(Integer, default=50, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamento de isolamento multi-tenant
    logs = relationship("QuestionLog", back_populates="user", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    block = Column(Enum(CebraspeBlock), nullable=False)
    weight = Column(Integer, default=1, nullable=False)  # Peso proporcional no edital
    expected_questions = Column(Integer, default=5, nullable=False)

    logs = relationship("QuestionLog", back_populates="subject")

class QuestionLog(Base):
    __tablename__ = "question_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    
    result = Column(Enum(QuestionResult), nullable=False)
    difficulty = Column(Enum(QuestionDifficulty), nullable=False)
    notes = Column(Text, nullable=True)  # Observações ou pegadinha da questão
    reviewed = Column(Boolean, default=False, nullable=False)
    time_spent_seconds = Column(Integer, default=60, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="logs")
    subject = relationship("Subject", back_populates="logs")
