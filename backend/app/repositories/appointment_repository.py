from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.appointment import Appointment
from app.core.config import settings


class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Appointment:
        appt = Appointment(**kwargs)
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)
        return appt

    def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()

    def get_by_preference_id(self, preference_id: str) -> Optional[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(Appointment.mercado_pago_preference_id == preference_id)
            .first()
        )

    def get_by_payment_id(self, payment_id: str) -> Optional[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(Appointment.mercado_pago_payment_id == payment_id)
            .first()
        )

    def update(self, appt: Appointment, **kwargs) -> Appointment:
        for key, value in kwargs.items():
            setattr(appt, key, value)
        self.db.commit()
        self.db.refresh(appt)
        return appt

    def delete(self, appt: Appointment):
        self.db.delete(appt)
        self.db.commit()

    def get_by_client(self, client_user_id: int) -> List[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(Appointment.client_user_id == client_user_id)
            .order_by(Appointment.start_time.desc())
            .all()
        )

    def get_by_date_range(self, start: datetime, end: datetime) -> List[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(
                Appointment.start_time >= start,
                Appointment.start_time < end,
                Appointment.status.in_(["confirmed", "pending_payment"]),
            )
            .order_by(Appointment.start_time)
            .all()
        )

    def get_conflicting(self, start_time: datetime, end_time: datetime, exclude_id: Optional[int] = None) -> List[Appointment]:
        pending_expiry = datetime.now(timezone.utc) - timedelta(minutes=settings.PENDING_PAYMENT_EXPIRY_MINUTES)
        q = self.db.query(Appointment).filter(
            or_(
                Appointment.status == "confirmed",
                and_(
                    Appointment.status == "pending_payment",
                    Appointment.created_at >= pending_expiry,
                ),
            ),
            Appointment.start_time < end_time,
            Appointment.end_time > start_time,
        )
        if exclude_id:
            q = q.filter(Appointment.id != exclude_id)
        return q.all()

    def count_by_days(self, days: int) -> int:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        return (
            self.db.query(Appointment)
            .filter(Appointment.created_at >= since)
            .count()
        )

    def get_pending_reminders(self) -> List[Appointment]:
        """Returns confirmed appointments needing client or admin reminders."""
        now = datetime.now(timezone.utc)
        client_window_end = now + timedelta(minutes=70)
        admin_window_end = now + timedelta(minutes=40)

        return (
            self.db.query(Appointment)
            .filter(
                Appointment.status == "confirmed",
                Appointment.start_time > now,
                or_(
                    and_(
                        Appointment.client_reminder_sent_at == None,
                        Appointment.start_time <= client_window_end,
                    ),
                    and_(
                        Appointment.admin_reminder_sent_at == None,
                        Appointment.start_time <= admin_window_end,
                    ),
                ),
            )
            .all()
        )
