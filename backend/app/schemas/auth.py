from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.core.security import validate_password_strength


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    password_confirm: str
    terms_accepted: bool
    privacy_policy_accepted: bool

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nome é obrigatório.")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 10:
            raise ValueError("WhatsApp inválido.")
        return digits

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError("Senha deve ter ao menos 8 caracteres, uma letra e um número.")
        return v

    @field_validator("terms_accepted")
    @classmethod
    def terms_must_accept(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Aceite dos Termos de Uso é obrigatório.")
        return v

    @field_validator("privacy_policy_accepted")
    @classmethod
    def privacy_must_accept(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Aceite da Política de Privacidade é obrigatório.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    password_confirm: str

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError("Senha deve ter ao menos 8 caracteres, uma letra e um número.")
        return v


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    must_change_password: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    message: str = "ok"
