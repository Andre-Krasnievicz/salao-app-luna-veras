from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from app.core.database import Base
from app.core.constants import SALON_NAME


class SalonSettings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    salon_name = Column(String(255), nullable=False, default=SALON_NAME)
    admin_whatsapp = Column(String(30), nullable=True)
    reservation_amount_cents = Column(Integer, nullable=False, default=2000)
    appointment_duration_minutes = Column(Integer, nullable=False, default=60)
    timezone = Column(String(100), nullable=False, default="America/Sao_Paulo")
    whatsapp_reminders_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
