from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Subject, QuestionLog, QuestionResult, QuestionDifficulty
from app.schemas import QuestionLogCreate, BatchQuestionLogCreate, QuestionLogResponse, SubjectSchema
from app.security import get_current_user
from app.services.prf_engine import calculate_cebraspe_metrics
from app.services.ai_adapter import PRF_AI_Coach

router = APIRouter(prefix="/study", tags=["Estudos PRF"])
ai_coach = PRF_AI_Coach()

@router.get("/subjects", response_model=List[SubjectSchema])
def list_subjects(db: Session = Depends(get_db)):
    """Lista todas as 14 disciplinas oficiais do edital da PRF com respectivos blocos e pesos."""
    return db.query(Subject).all()

@router.get("/metrics")
def get_metrics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Calcula e retorna as métricas Cebraspe em tempo real para o usuário autenticado."""
    logs = db.query(QuestionLog).filter(QuestionLog.user_id == user.id).all()
    subjects = db.query(Subject).all()
    return calculate_cebraspe_metrics(logs, subjects)

@router.post("/log", response_model=QuestionLogResponse)
def log_question(
    data: QuestionLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra uma questão individual resolvida com anotação de pegadinha."""
    new_log = QuestionLog(
        user_id=user.id,
        subject_id=data.subject_id,
        result=data.result,
        difficulty=data.difficulty,
        notes=data.notes,
        reviewed=(data.result == QuestionResult.CERTO),
        time_spent_seconds=data.time_spent_seconds or 60
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.post("/log-batch")
def log_batch_questions(
    data: BatchQuestionLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra uma bateria de questões em lote."""
    created_logs = []
    timestamp = datetime.utcnow()

    for _ in range(data.certo):
        created_logs.append(
            QuestionLog(
                user_id=user.id,
                subject_id=data.subject_id,
                result=QuestionResult.CERTO,
                difficulty=QuestionDifficulty.MEDIO,
                reviewed=True,
                created_at=timestamp
            )
        )

    for _ in range(data.errado):
        created_logs.append(
            QuestionLog(
                user_id=user.id,
                subject_id=data.subject_id,
                result=QuestionResult.ERRADO,
                difficulty=QuestionDifficulty.MEDIO,
                notes=f"[Bateria] {data.notes}" if data.notes else None,
                reviewed=False,
                created_at=timestamp
            )
        )

    for _ in range(data.branco):
        created_logs.append(
            QuestionLog(
                user_id=user.id,
                subject_id=data.subject_id,
                result=QuestionResult.BRANCO,
                difficulty=QuestionDifficulty.DIFICIL,
                reviewed=False,
                created_at=timestamp
            )
        )

    db.add_all(created_logs)
    db.commit()

    return {
        "message": f"Bateria registrada: {data.certo} certas, {data.errado} erradas, {data.branco} branco.",
        "liquid_points": data.certo - data.errado
    }

@router.get("/caderno-erros")
def get_caderno_erros(
    reviewed: Optional[bool] = None,
    subject_id: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna os itens errados do candidato para revisão ativa."""
    query = db.query(QuestionLog).filter(
        QuestionLog.user_id == user.id,
        QuestionLog.result == QuestionResult.ERRADO
    )

    if reviewed is not None:
        query = query.filter(QuestionLog.reviewed == reviewed)
    if subject_id:
        query = query.filter(QuestionLog.subject_id == subject_id)

    return query.order_by(QuestionLog.created_at.desc()).all()

@router.patch("/log/{log_id}/review")
def toggle_log_review(
    log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca ou desmarca um erro como superado/revisado."""
    log = db.query(QuestionLog).filter(
        QuestionLog.id == log_id,
        QuestionLog.user_id == user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")

    log.reviewed = not log.reviewed
    db.commit()
    return {"id": log.id, "reviewed": log.reviewed}

@router.post("/ai-diagnostic")
def get_ai_diagnostic(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Gera o diagnóstico de estudo via IA com as regras do edital da PRF."""
    logs = db.query(QuestionLog).filter(QuestionLog.user_id == user.id).all()
    subjects = db.query(Subject).all()
    metrics = calculate_cebraspe_metrics(logs, subjects)

    mistakes = [
        {"subject_id": l.subject_id, "notes": l.notes, "difficulty": l.difficulty.value}
        for l in logs if l.result == QuestionResult.ERRADO and l.notes
    ]

    return ai_coach.generate_diagnostic(metrics, metrics["blocks"], mistakes)
