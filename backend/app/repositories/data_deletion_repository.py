from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.data_deletion_request import DataDeletionRequest


class DataDeletionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, reason: Optional[str] = None) -> DataDeletionRequest:
        req = DataDeletionRequest(user_id=user_id, reason=reason)
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get_all(self) -> List[DataDeletionRequest]:
        return (
            self.db.query(DataDeletionRequest)
            .order_by(DataDeletionRequest.created_at.desc())
            .all()
        )

    def get_by_id(self, req_id: int) -> Optional[DataDeletionRequest]:
        return self.db.query(DataDeletionRequest).filter(DataDeletionRequest.id == req_id).first()

    def update_status(self, req: DataDeletionRequest, status: str) -> DataDeletionRequest:
        from datetime import datetime, timezone
        req.status = status
        if status in ("completed", "rejected"):
            req.resolved_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(req)
        return req
