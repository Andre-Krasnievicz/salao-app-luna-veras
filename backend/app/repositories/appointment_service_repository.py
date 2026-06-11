from typing import List
from sqlalchemy.orm import Session

from app.models.appointment_service import AppointmentService


class AppointmentServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_bulk(self, appointment_id: int, snapshots: List[dict]) -> None:
        for snap in snapshots:
            row = AppointmentService(appointment_id=appointment_id, **snap)
            self.db.add(row)
        self.db.commit()

    def get_by_appointment(self, appointment_id: int) -> List[AppointmentService]:
        return (
            self.db.query(AppointmentService)
            .filter(AppointmentService.appointment_id == appointment_id)
            .all()
        )

    def get_by_appointments(self, appointment_ids: List[int]) -> List[AppointmentService]:
        return (
            self.db.query(AppointmentService)
            .filter(AppointmentService.appointment_id.in_(appointment_ids))
            .all()
        )
