from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "client", name="user_role"), nullable=False, default="client")
    terms_accepted_at = Column(DateTime(timezone=True), nullable=True)
    privacy_policy_accepted_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
