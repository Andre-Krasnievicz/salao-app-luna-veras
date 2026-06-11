from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.service_repository import ServiceRepository
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate


class ServiceService:
    def __init__(self, db: Session):
        self.repo = ServiceRepository(db)

    def get_public(self) -> List[ServiceResponse]:
        return [ServiceResponse.model_validate(s) for s in self.repo.get_all_active()]

    def get_all_admin(self) -> List[ServiceResponse]:
        return [ServiceResponse.model_validate(s) for s in self.repo.get_all()]

    def create(self, data: ServiceCreate) -> ServiceResponse:
        svc = self.repo.create(**data.model_dump())
        return ServiceResponse.model_validate(svc)

    def update(self, service_id: int, data: ServiceUpdate) -> ServiceResponse:
        svc = self.repo.get_by_id(service_id)
        if not svc:
            raise HTTPException(status_code=404, detail="Serviço não encontrado.")
        updates = data.model_dump(exclude_none=True)
        if updates:
            svc = self.repo.update(svc, **updates)
        return ServiceResponse.model_validate(svc)
