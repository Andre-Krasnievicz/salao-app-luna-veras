from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, generate_reset_token, hash_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(
        self,
        name: str,
        email: str,
        phone: str,
        password: str,
        password_confirm: str,
        terms_accepted: bool,
        privacy_policy_accepted: bool,
    ) -> User:
        if password != password_confirm:
            raise HTTPException(status_code=400, detail="As senhas não conferem.")

        if self.repo.get_by_email(email):
            raise HTTPException(status_code=400, detail="Email já cadastrado.")

        now = datetime.now(timezone.utc)
        return self.repo.create(
            name=name,
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            role="client",
            terms_accepted_at=now if terms_accepted else None,
            privacy_policy_accepted_at=now if privacy_policy_accepted else None,
        )

    def authenticate(self, email: str, password: str) -> User:
        user = self.repo.get_by_email(email)
        # Always hash compare to prevent timing attacks
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos.",
            )
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Conta desativada.")
        return user

    def initiate_password_reset(self, email: str) -> Optional[str]:
        """Returns plain token (for logging in dev) or None. Never reveals user existence."""
        user = self.repo.get_by_email(email)
        if not user or not user.is_active:
            return None

        token = generate_reset_token()
        token_hash = hash_token(token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
        self.repo.create_reset_token(user.id, token_hash, expires_at)
        return token

    def reset_password(self, token: str, new_password: str, new_password_confirm: str):
        if new_password != new_password_confirm:
            raise HTTPException(status_code=400, detail="As senhas não conferem.")

        token_hash = hash_token(token)
        reset_token = self.repo.get_reset_token(token_hash)

        if not reset_token or reset_token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Link inválido ou expirado.")

        user = self.repo.get_by_id(reset_token.user_id)
        if not user:
            raise HTTPException(status_code=400, detail="Link inválido ou expirado.")

        self.repo.update(user, password_hash=hash_password(new_password), must_change_password=False)
        self.repo.mark_token_used(reset_token)

    def change_password(self, user: User, current_password: str, new_password: str, new_password_confirm: str):
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")
        if new_password != new_password_confirm:
            raise HTTPException(status_code=400, detail="As senhas não conferem.")
        self.repo.update(user, password_hash=hash_password(new_password), must_change_password=False)
