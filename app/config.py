import os
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
        extra = "allow"

settings = Settings()

# Correção automática para URLs antigas do PostgreSQL (postgres:// vs postgresql://)
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
