from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.data_deletion_repository import DataDeletionRepository
from app.repositories.site_visit_repository import SiteVisitRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import AdminAppointmentCreate, AdminAppointmentUpdate, AppointmentResponse
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.appointment_service import AppointmentService
from app.services.service_service import ServiceService
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    appt_repo = AppointmentRepository(db)
    user_repo = UserRepository(db)
    visit_repo = SiteVisitRepository(db)

    return {
        "site_visits": visit_repo.count_total(),
        "new_clients_30d": user_repo.count_new_clients(30),
        "appointments_7d": appt_repo.count_by_days(7),
        "appointments_30d": appt_repo.count_by_days(30),
    }


@router.get("/services", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return ServiceService(db).get_all_admin()


@router.post("/services", response_model=ServiceResponse, status_code=201)
def create_service(
    body: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return ServiceService(db).create(body)


@router.patch("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    body: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return ServiceService(db).update(service_id, body)


@router.get("/settings", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return SettingsService(db).get_with_hours()


@router.put("/settings", response_model=SettingsResponse)
def update_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return SettingsService(db).update(body)


@router.get("/appointments")
def list_appointments(
    date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    repo = AppointmentRepository(db)
    if date:
        try:
            from datetime import date as date_type
            d = date_type.fromisoformat(date)
            start = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
            end = start + timedelta(days=1)
        except ValueError:
            return []
        appts = repo.get_by_date_range(start, end)
    else:
        # Return all upcoming
        now = datetime.now(timezone.utc)
        appts = repo.get_by_date_range(now, now + timedelta(days=30))
    return [AppointmentResponse.model_validate(a) for a in appts]


@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(
    body: AdminAppointmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return AppointmentService(db).create_admin(
        admin=admin,
        client_name=body.client_name,
        client_phone=body.client_phone,
        start_time=body.start_time,
        client_email=body.client_email,
        notes=body.notes,
        service_ids=body.service_ids,
    )


@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    body: AdminAppointmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return AppointmentService(db).admin_update(
        appointment_id,
        status=body.status,
        notes=body.notes,
        start_time=body.start_time,
    )


@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    AppointmentService(db).admin_delete(appointment_id)
    return {"message": "Agendamento cancelado."}


@router.get("/data-deletion-requests")
def list_deletion_requests(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from app.models.user import User as UserModel
    repo = DataDeletionRepository(db)
    requests = repo.get_all()
    result = []
    for req in requests:
        user = db.query(UserModel).filter(UserModel.id == req.user_id).first()
        result.append({
            "id": req.id,
            "user_id": req.user_id,
            "user_name": user.name if user else "Usuário removido",
            "user_email": user.email if user else "-",
            "status": req.status,
            "reason": req.reason,
            "created_at": req.created_at,
            "resolved_at": req.resolved_at,
        })
    return result


@router.patch("/data-deletion-requests/{req_id}")
def update_deletion_request(
    req_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    from fastapi import HTTPException
    allowed = {"pending", "completed", "rejected"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status inválido. Permitidos: {allowed}")
    repo = DataDeletionRepository(db)
    req = repo.get_by_id(req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    repo.update_status(req, status)
    return {"message": "Status atualizado."}
