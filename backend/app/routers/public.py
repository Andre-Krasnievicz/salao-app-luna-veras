from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.security import hash_ip
from app.repositories.site_visit_repository import SiteVisitRepository
from app.schemas.availability import AvailabilityResponse
from app.schemas.service import ServiceResponse
from app.schemas.settings import PublicSettingsResponse
from app.services.availability_service import AvailabilityService
from app.services.service_service import ServiceService
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/api", tags=["public"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/settings/public", response_model=PublicSettingsResponse)
def public_settings(db: Session = Depends(get_db)):
    return SettingsService(db).get_public()


@router.get("/services", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return ServiceService(db).get_public()


@router.get("/availability", response_model=AvailabilityResponse)
def availability(
    date: str = Query(..., description="YYYY-MM-DD"),
    duration_minutes: Optional[int] = Query(None, ge=5),
    db: Session = Depends(get_db),
):
    return AvailabilityService(db).get_availability(date, duration_minutes)


@router.post("/site-visits", status_code=201)
@limiter.limit("60/minute")
def record_visit(request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    path = str(request.url.path)[:500]
    ua = request.headers.get("user-agent", "")
    body = {}
    try:
        import asyncio
        # path comes from body if provided
    except Exception:
        pass
    SiteVisitRepository(db).create(path=path, user_agent=ua, ip_hash=hash_ip(ip))
    return {"ok": True}
