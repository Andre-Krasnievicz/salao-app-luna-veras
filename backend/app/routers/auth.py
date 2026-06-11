import logging
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.integrations.email import send_password_reset_email
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

COOKIE_MAX_AGE = settings.JWT_EXPIRE_HOURS * 3600


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="none" if settings.is_production else "lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


@router.post("/register", response_model=AuthResponse)
@limiter.limit("10/minute")
def register(request: Request, body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    svc = AuthService(db)
    user = svc.register(
        name=body.name,
        email=body.email,
        phone=body.phone,
        password=body.password,
        password_confirm=body.password_confirm,
        terms_accepted=body.terms_accepted,
        privacy_policy_accepted=body.privacy_policy_accepted,
    )
    token = create_access_token(user.id, user.role)
    _set_auth_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user), message="Conta criada com sucesso!")


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    svc = AuthService(db)
    user = svc.authenticate(body.email, body.password)
    token = create_access_token(user.id, user.role)
    _set_auth_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user), message="Login realizado com sucesso!")


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logout realizado."}


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    svc = AuthService(db)
    token = svc.initiate_password_reset(body.email)

    if token:
        reset_link = f"{settings.FRONTEND_URL}/redefinir-senha?token={token}"
        if not settings.is_production:
            logger.info("[DEV] Password reset link for %s: %s", body.email, reset_link)
        else:
            send_password_reset_email(body.email, reset_link)

    # Always return generic response
    return {"message": "Se este email estiver cadastrado, enviaremos instruções para redefinir sua senha."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    svc = AuthService(db)
    svc.reset_password(body.token, body.password, body.password_confirm)
    return {"message": "Senha redefinida com sucesso."}
