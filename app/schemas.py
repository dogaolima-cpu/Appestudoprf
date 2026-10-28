from pydantic import BaseModel, EmailStr, Field
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
    target_year: int
    daily_goal_questions: int
    created_at: datetime

    class Config:
        from_attributes = True

# Esquemas de Disciplinas
class SubjectSchema(BaseModel):
    id: int
    name: str
    block: CebraspeBlock
    weight: int
    expected_questions: int

    class Config:
        from_attributes = True

# Esquemas de Questões
class QuestionLogCreate(BaseModel):
    subject_id: int
    result: QuestionResult
    difficulty: QuestionDifficulty = QuestionDifficulty.MEDIO
    notes: Optional[str] = None
    time_spent_seconds: Optional[int] = 60

class BatchQuestionLogCreate(BaseModel):
    subject_id: int
    certo: int = Field(0, ge=0)
    errado: int = Field(0, ge=0)
    branco: int = Field(0, ge=0)
    notes: Optional[str] = None

class QuestionLogResponse(BaseModel):
    id: int
    subject_id: int
    result: QuestionResult
    difficulty: QuestionDifficulty
    notes: Optional[str]
    reviewed: bool
    time_spent_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True
