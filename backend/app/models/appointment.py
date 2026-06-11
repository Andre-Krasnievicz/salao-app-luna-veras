from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from app.core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)

    status = Column(
        Enum("pending_payment", "confirmed", "cancelled", "payment_failed", name="appointment_status"),
        nullable=False,
        default="pending_payment",
        index=True,
    )
    notes = Column(Text, nullable=True)
    source = Column(Enum("public", "admin", name="appointment_source"), nullable=False, default="public")

    reservation_amount_cents = Column(Integer, nullable=False, default=2000)
    payment_status = Column(String(50), nullable=True)
    mercado_pago_preference_id = Column(String(255), nullable=True)
    mercado_pago_payment_id = Column(String(255), nullable=True)

    total_duration_minutes = Column(Integer, nullable=True)
    services_total_cents = Column(Integer, nullable=True)

    client_reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
    admin_reminder_sent_at = Column(DateTime(timezone=True), nullable=True)

    # For admin manual bookings (client may not have an account)
    client_name = Column(String(255), nullable=True)
    client_phone = Column(String(30), nullable=True)
    client_email = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
