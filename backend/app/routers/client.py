from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.dependencies import require_client
from app.models.user import User
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.data_deletion_repository import DataDeletionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import AppointmentResponse, CheckoutResponse, PublicAppointmentCreate
from app.schemas.auth import UserResponse
from app.schemas.user import ChangePasswordRequest, DataDeletionRequestCreate, UpdateProfileRequest
from app.services.appointment_service import AppointmentService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api", tags=["client"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/client/profile", response_model=UserResponse)
def get_profile(user: User = Depends(require_client)):
    return UserResponse.model_validate(user)


@router.put("/client/profile", response_model=UserResponse)
def update_profile(
    body: UpdateProfileRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_client),
):
    repo = UserRepository(db)
    updates = body.model_dump(exclude_none=True)
    if updates:
        user = repo.update(user, **updates)
    return UserResponse.model_validate(user)


@router.put("/client/change-password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_client),
):
    AuthService(db).change_password(user, body.current_password, body.new_password, body.new_password_confirm)
    return {"message": "Senha alterada com sucesso."}


@router.get("/client/appointments")
def list_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(require_client),
):
    repo = AppointmentRepository(db)
    appts = repo.get_by_client(user.id)
    return [AppointmentResponse.model_validate(a) for a in appts]


@router.post("/client/data-deletion-request", status_code=201)
def request_data_deletion(
    body: DataDeletionRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_client),
):
    DataDeletionRepository(db).create(user_id=user.id, reason=body.reason)
    return {"message": "Solicitação de exclusão registrada. Entraremos em contato em breve."}


@router.post("/appointments/public")
@limiter.limit("10/minute")
def create_appointment(
    request: Request,
    body: PublicAppointmentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_client),
):
    result = AppointmentService(db).create_public(body.start_time, body.service_ids, user)
    return result
