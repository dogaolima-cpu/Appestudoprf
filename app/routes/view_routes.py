from fastapi import APIRouter, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from app.config import settings
from app.security import ACTIVE_SESSIONS

templates = Jinja2Templates(directory="app/templates")

router = APIRouter(include_in_schema=False)

@router.get("/", response_class=HTMLResponse)
def index(request: Request):
    """
    Rota Raiz:
    Se o concurseiro possuir sessão ativa via Cookie HttpOnly, redireciona para /dashboard.
    Caso contrário, redireciona para a tela de autenticação /login.
    """
    token = request.cookies.get(settings.COOKIE_NAME)
    if token and token in ACTIVE_SESSIONS:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    """
    Tela de Acesso / Cadastro (Jinja2).
    Se já estiver logado, redireciona diretamente para o Dashboard.
    """
    token = request.cookies.get(settings.COOKIE_NAME)
    if token and token in ACTIVE_SESSIONS:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("login.html", {"request": request, "app_name": settings.APP_NAME})

@router.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(request: Request):
    """
    Painel Estratégico Cebraspe da PRF (Jinja2).
    Renderiza a interface completa e o JavaScript nativo consome as APIs com credenciais.
    """
    token = request.cookies.get(settings.COOKIE_NAME)
    # Se não houver sessão ativa nem cookie, a rota visual pode ser exibida
    # e o JavaScript cliente valida via fetch em /study/metrics (redirecionando se 401).
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "app_name": settings.APP_NAME,
            "has_cookie_session": bool(token and token in ACTIVE_SESSIONS)
        }
    )
