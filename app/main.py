from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from app.config import settings
from app.database import engine, Base
from app.routes.auth_routes import router as auth_router
from app.routes.study_routes import router as study_router

# Inicialização das tabelas no banco de dados (SQLite ou PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend oficial da plataforma de estudos e métricas Cebraspe da PRF",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições locais e em nuvem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores de autenticação e estudos
app.include_router(auth_router)
app.include_router(study_router)

# Monta arquivos estáticos se a pasta existir
if os.path.exists("app/static"):
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def read_root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs_url": "/docs",
        "engine": "Cebraspe 120 Itens PRF",
        "database": "PostgreSQL / SQLite Híbrido"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
