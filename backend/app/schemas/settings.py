from typing import List, Optional
from pydantic import BaseModel, field_validator


class BusinessHoursItem(BaseModel):
    weekday: int
    opens_at: str
    closes_at: str
    is_open: bool

    model_config = {"from_attributes": True}

    @field_validator("weekday")
    @classmethod
    def weekday_valid(cls, v: int) -> int:
        if v not in range(7):
            raise ValueError("weekday deve ser 0-6.")
        return v

    @field_validator("opens_at", "closes_at")
    @classmethod
    def time_format(cls, v: str) -> str:
        parts = v.split(":")
        if len(parts) != 2 or not all(p.isdigit() for p in parts):
            raise ValueError("Formato de horário inválido (HH:MM).")
        return v


class SettingsUpdate(BaseModel):
    salon_name: Optional[str] = None
    admin_whatsapp: Optional[str] = None
    reservation_amount_cents: Optional[int] = None
    appointment_duration_minutes: Optional[int] = None
    timezone: Optional[str] = None
    whatsapp_reminders_enabled: Optional[bool] = None
    business_hours: Optional[List[BusinessHoursItem]] = None

    @field_validator("reservation_amount_cents")
    @classmethod
    def amount_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("Valor deve ser positivo.")
        return v

    @field_validator("appointment_duration_minutes")
    @classmethod
    def duration_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("Duração deve ser positiva.")
        return v


class SettingsResponse(BaseModel):
    id: int
    salon_name: str
    admin_whatsapp: Optional[str]
    reservation_amount_cents: int
    appointment_duration_minutes: int
    timezone: str
    whatsapp_reminders_enabled: bool
    business_hours: List[BusinessHoursItem] = []

    model_config = {"from_attributes": True}


class PublicSettingsResponse(BaseModel):
    salon_name: str
    reservation_amount_cents: int
    appointment_duration_minutes: int
    timezone: str
    business_hours: List[BusinessHoursItem] = []
