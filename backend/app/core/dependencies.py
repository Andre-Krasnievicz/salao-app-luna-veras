from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


def _get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    access_token: str = Cookie(default=None),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão inválida ou expirada.",
    )
    if not access_token:
        raise credentials_exception

    payload = decode_access_token(access_token)
    if not payload:
        raise credentials_exception

    user_id = int(payload.get("sub", 0))
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise credentials_exception

    return user


def get_current_user(user: User = Depends(_get_current_user)) -> User:
    return user


def require_admin(user: User = Depends(_get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado.")
    return user


def require_client(user: User = Depends(_get_current_user)) -> User:
    if user.role not in ("admin", "client"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado.")
    return user
