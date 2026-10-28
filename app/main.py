from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
import os

from app.config import settings
from app.database import engine, Base
from app.routes.auth_routes import router as auth_router
from app.routes.study_routes import router as study_router
from app.routes.view_routes import router as view_router

# Inicialização das tabelas no banco de dados (SQLite ou PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend oficial da plataforma de estudos e métricas Cebraspe da PRF",
    version="1.0.0"
)

# Configuração do Jinja2 para a pasta app/templates
templates = Jinja2Templates(directory="app/templates")

# Configuração de CORS para permitir requisições locais e em nuvem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores de visualização (HTML), autenticação e estudos
app.include_router(view_router)
app.include_router(auth_router)
app.include_router(study_router)

# Monta arquivos estáticos se a pasta existir
if os.path.exists("app/static"):
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
