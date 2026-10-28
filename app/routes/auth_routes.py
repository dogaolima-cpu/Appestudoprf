from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegisterSchema, UserLoginSchema, UserResponseSchema
from app.security import hash_password, verify_password, create_session_token, revoke_session_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register", response_model=UserResponseSchema)
def register(user_in: UserRegisterSchema, response: Response, db: Session = Depends(get_db)):
    # 1. Verifica duplicidade de email
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

    # 3. Cria sessão com cookie HttpOnly
    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False  # Alterar para True em produção HTTPS
    )

    return user

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
