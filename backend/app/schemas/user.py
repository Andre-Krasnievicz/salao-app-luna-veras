from typing import Optional
from pydantic import BaseModel, field_validator
from app.core.security import validate_password_strength


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Nome não pode ser vazio.")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            digits = "".join(c for c in v if c.isdigit())
            if len(digits) < 10:
                raise ValueError("WhatsApp inválido.")
            return digits
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    new_password_confirm: str

    @field_validator("new_password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError("Senha deve ter ao menos 8 caracteres, uma letra e um número.")
        return v


class DataDeletionRequestCreate(BaseModel):
    reason: Optional[str] = None
