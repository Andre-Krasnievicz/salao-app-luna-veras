from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.appointment_service_repository import AppointmentServiceRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import AppointmentResponse, CheckoutResponse
from app.schemas.service import AppointmentServiceSnapshot


class AppointmentService:
    def __init__(self, db: Session):
        self.db = db
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

    def _enrich(self, appt, response: AppointmentResponse) -> AppointmentResponse:
        snaps = AppointmentServiceRepository(self.db).get_by_appointment(appt.id)
        response.services = [AppointmentServiceSnapshot.model_validate(s) for s in snaps]
        return response

    def create_public(self, start_time: datetime, service_ids: List[int], client: User) -> dict:
        from app.integrations.mercadopago import MercadoPagoIntegration
        from app.core.config import settings as app_settings

        s = self._get_settings()

        # Resolve and validate services
        services = ServiceRepository(self.db).get_by_ids(service_ids)
        if len(services) != len(service_ids):
            raise HTTPException(status_code=400, detail="Um ou mais serviços inválidos.")

        total_minutes = sum(svc.duration_minutes for svc in services)
        total_cents = sum(svc.price_cents for svc in services)

        end_time = self._check_conflict(start_time, total_minutes)

        appt = self.repo.create(
            client_user_id=client.id,
            created_by_user_id=client.id,
            start_time=start_time,
            end_time=end_time,
            status="pending_payment",
            source="public",
            reservation_amount_cents=s.reservation_amount_cents,
            total_duration_minutes=total_minutes,
            services_total_cents=total_cents,
            client_name=client.name,
            client_phone=client.phone,
            client_email=client.email,
        )

        # Persist service snapshots
        AppointmentServiceRepository(self.db).create_bulk(
            appt.id,
            [
                {
                    "service_id": svc.id,
                    "service_name_snapshot": svc.name,
                    "service_duration_snapshot": svc.duration_minutes,
                    "service_price_snapshot": svc.price_cents,
                }
                for svc in services
            ],
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
        except Exception:
            self.repo.update(appt, status="cancelled", payment_status="error")
            raise HTTPException(status_code=502, detail="Erro ao gerar pagamento. Tente novamente.")

    def create_admin(
        self,
        admin: User,
        client_name: str,
        client_phone: str,
        start_time: datetime,
        client_email: Optional[str] = None,
        notes: Optional[str] = None,
        service_ids: Optional[List[int]] = None,
    ) -> AppointmentResponse:
        s = self._get_settings()

        if service_ids:
            services = ServiceRepository(self.db).get_by_ids(service_ids)
            if len(services) != len(service_ids):
                raise HTTPException(status_code=400, detail="Um ou mais serviços inválidos.")
            total_minutes = sum(svc.duration_minutes for svc in services)
            total_cents = sum(svc.price_cents for svc in services)
        else:
            services = []
            total_minutes = s.appointment_duration_minutes
            total_cents = None

        end_time = self._check_conflict(start_time, total_minutes)

        # Try to find existing user by email
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
            total_duration_minutes=total_minutes if service_ids else None,
            services_total_cents=total_cents,
            client_name=client_name,
            client_phone=client_phone,
            client_email=client_email,
        )

        if services:
            AppointmentServiceRepository(self.db).create_bulk(
                appt.id,
                [
                    {
                        "service_id": svc.id,
                        "service_name_snapshot": svc.name,
                        "service_duration_snapshot": svc.duration_minutes,
                        "service_price_snapshot": svc.price_cents,
                    }
                    for svc in services
                ],
            )

        response = AppointmentResponse.model_validate(appt)
        return self._enrich(appt, response)

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
            duration = appt.total_duration_minutes or s.appointment_duration_minutes
            end_time = self._check_conflict(kwargs["start_time"], duration, exclude_id=appointment_id)
            kwargs["end_time"] = end_time
        updated = self.repo.update(appt, **{k: v for k, v in kwargs.items() if v is not None})
        response = AppointmentResponse.model_validate(updated)
        return self._enrich(updated, response)

    def admin_delete(self, appointment_id: int):
        appt = self.repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
        self.repo.update(appt, status="cancelled")
