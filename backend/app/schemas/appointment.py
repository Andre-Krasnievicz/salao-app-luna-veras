from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class PublicAppointmentCreate(BaseModel):
    start_time: datetime

    @field_validator("start_time")
    @classmethod
    def start_time_future(cls, v: datetime) -> datetime:
        from datetime import timezone
        if v <= datetime.now(timezone.utc):
            raise ValueError("Horário deve ser no futuro.")
        return v


class AdminAppointmentCreate(BaseModel):
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    start_time: datetime
    notes: Optional[str] = None

    @field_validator("client_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nome do cliente é obrigatório.")
        return v

    @field_validator("client_phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 10:
            raise ValueError("WhatsApp inválido.")
        return digits

    @field_validator("start_time")
    @classmethod
    def start_time_future(cls, v: datetime) -> datetime:
        from datetime import timezone
        if v <= datetime.now(timezone.utc):
            raise ValueError("Horário deve ser no futuro.")
        return v


class AdminAppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    start_time: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: Optional[str]) -> Optional[str]:
        allowed = {"pending_payment", "confirmed", "cancelled", "payment_failed"}
        if v is not None and v not in allowed:
            raise ValueError(f"Status inválido. Permitidos: {allowed}")
        return v


class AppointmentResponse(BaseModel):
    id: int
    client_user_id: Optional[int]
    client_name: Optional[str]
    client_phone: Optional[str]
    client_email: Optional[str]
    start_time: datetime
    end_time: datetime
    status: str
    notes: Optional[str]
    source: str
    reservation_amount_cents: int
    payment_status: Optional[str]
    mercado_pago_preference_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckoutResponse(BaseModel):
    appointment_id: int
    checkout_url: str
    preference_id: str
