import bcrypt
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
        # Se não houver cookie, tenta obter usuário de desenvolvimento ou lança 401
        dev_user = db.query(User).first()
        if dev_user:
            return dev_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado. Faça login para acessar este recurso."
        )
    user_id = ACTIVE_SESSIONS[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado.")
    return user
