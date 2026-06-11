from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import AppointmentResponse, CheckoutResponse


class AppointmentService:
    def __init__(self, db: Session):
        self.repo = AppointmentRepository(db)
        self.settings_repo = SettingsRepository(db)
        self.user_repo = UserRepository(db)

    def _get_settings(self):
        s = self.settings_repo.get()
        if not s:
            raise HTTPException(status_code=500, detail="Configurações não encontradas.")
        return s

    def _check_conflict(self, start_time: datetime, duration_minutes: int, exclude_id=None):
        end_time = start_time + timedelta(minutes=duration_minutes)
        conflicts = self.repo.get_conflicting(start_time, end_time, exclude_id)
        if conflicts:
            raise HTTPException(status_code=409, detail="Horário não disponível.")
        return end_time

    def create_public(self, start_time: datetime, client: User) -> dict:
        from app.integrations.mercadopago import MercadoPagoIntegration
        from app.core.config import settings as app_settings

        s = self._get_settings()
        end_time = self._check_conflict(start_time, s.appointment_duration_minutes)

        appt = self.repo.create(
            client_user_id=client.id,
            created_by_user_id=client.id,
            start_time=start_time,
            end_time=end_time,
            status="pending_payment",
            source="public",
            reservation_amount_cents=s.reservation_amount_cents,
            client_name=client.name,
            client_phone=client.phone,
            client_email=client.email,
        )

        mp = MercadoPagoIntegration()
        try:
            checkout = mp.create_preference(
                appointment_id=appt.id,
                amount_cents=s.reservation_amount_cents,
                client_name=client.name,
                client_email=client.email,
            )
            self.repo.update(
                appt,
                mercado_pago_preference_id=checkout["preference_id"],
            )
            return {
                "appointment_id": appt.id,
                "checkout_url": checkout["checkout_url"],
                "preference_id": checkout["preference_id"],
            }
        except Exception as e:
            # Don't expose MP errors to client
            self.repo.update(appt, status="cancelled", payment_status="error")
            raise HTTPException(status_code=502, detail="Erro ao gerar pagamento. Tente novamente.")

    def create_admin(
        self,
        admin: User,
        client_name: str,
        client_phone: str,
        start_time: datetime,
        client_email=None,
        notes=None,
    ) -> AppointmentResponse:
        s = self._get_settings()
        end_time = self._check_conflict(start_time, s.appointment_duration_minutes)

        # Try to find existing user by phone or email
        client_user_id = None
        if client_email:
            existing = self.user_repo.get_by_email(client_email)
            if existing:
                client_user_id = existing.id

        appt = self.repo.create(
            client_user_id=client_user_id,
            created_by_user_id=admin.id,
            start_time=start_time,
            end_time=end_time,
            status="confirmed",
            source="admin",
            reservation_amount_cents=0,
            notes=notes,
            client_name=client_name,
            client_phone=client_phone,
            client_email=client_email,
        )
        return appt

    def confirm_payment(self, appointment_id: int, payment_id: str, payment_status: str):
        appt = self.repo.get_by_id(appointment_id)
        if not appt:
            return

        if payment_status == "approved":
            self.repo.update(
                appt,
                status="confirmed",
                payment_status="approved",
                mercado_pago_payment_id=payment_id,
            )
        elif payment_status in ("rejected", "cancelled"):
            self.repo.update(
                appt,
                status="payment_failed",
                payment_status=payment_status,
                mercado_pago_payment_id=payment_id,
            )

    def admin_update(self, appointment_id: int, **kwargs) -> AppointmentResponse:
        appt = self.repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
        if "start_time" in kwargs and kwargs["start_time"]:
            s = self._get_settings()
            end_time = self._check_conflict(kwargs["start_time"], s.appointment_duration_minutes, exclude_id=appointment_id)
            kwargs["end_time"] = end_time
        return self.repo.update(appt, **{k: v for k, v in kwargs.items() if v is not None})

    def admin_delete(self, appointment_id: int):
        appt = self.repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
        self.repo.update(appt, status="cancelled")
