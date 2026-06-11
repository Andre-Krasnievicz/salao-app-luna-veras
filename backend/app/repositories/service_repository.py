from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.service import Service


class ServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_active(self) -> List[Service]:
        return (
            self.db.query(Service)
            .filter(Service.is_active == True)
            .order_by(Service.category, Service.sort_order, Service.name)
            .all()
        )

    def get_all(self) -> List[Service]:
        return (
            self.db.query(Service)
            .order_by(Service.category, Service.sort_order, Service.name)
            .all()
        )

    def get_by_ids(self, ids: List[int]) -> List[Service]:
        return self.db.query(Service).filter(Service.id.in_(ids)).all()

    def get_by_id(self, service_id: int) -> Optional[Service]:
        return self.db.query(Service).filter(Service.id == service_id).first()

    def create(self, **kwargs) -> Service:
        svc = Service(**kwargs)
        self.db.add(svc)
        self.db.commit()
        self.db.refresh(svc)
        return svc

    def update(self, svc: Service, **kwargs) -> Service:
        for key, value in kwargs.items():
            setattr(svc, key, value)
        self.db.commit()
        self.db.refresh(svc)
        return svc
