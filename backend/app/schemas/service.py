from typing import Optional
from pydantic import BaseModel, field_validator


class ServiceResponse(BaseModel):
    id: int
    name: str
    category: str
    duration_minutes: int
    price_cents: int
    is_active: bool
    sort_order: int
    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    name: str
    category: str
    duration_minutes: int
    price_cents: int = 0
    sort_order: int = 0

    @field_validator("name", "category")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Campo obrigatório.")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def min_duration(cls, v: int) -> int:
        if v < 5:
            raise ValueError("Duração mínima é 5 minutos.")
        return v

    @field_validator("price_cents")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Preço não pode ser negativo.")
        return v


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: Optional[int] = None
    price_cents: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class AppointmentServiceSnapshot(BaseModel):
    service_id: Optional[int] = None
    service_name_snapshot: str
    service_duration_snapshot: int
    service_price_snapshot: int
    model_config = {"from_attributes": True}
