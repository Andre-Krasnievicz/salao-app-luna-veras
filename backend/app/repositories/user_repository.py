from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id, User.is_active == True).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def create(self, **kwargs) -> User:
        if "email" in kwargs:
            kwargs["email"] = kwargs["email"].lower()
        user = User(**kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def count_new_clients(self, days: int = 30) -> int:
        from datetime import datetime, timedelta, timezone
        since = datetime.now(timezone.utc) - timedelta(days=days)
        return (
            self.db.query(User)
            .filter(User.role == "client", User.created_at >= since)
            .count()
        )

    # Password reset tokens
    def create_reset_token(self, user_id: int, token_hash: str, expires_at) -> PasswordResetToken:
        token = PasswordResetToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_reset_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        return (
            self.db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.used_at == None,
            )
            .first()
        )

    def mark_token_used(self, token: PasswordResetToken):
        from datetime import datetime, timezone
        token.used_at = datetime.now(timezone.utc)
        self.db.commit()
