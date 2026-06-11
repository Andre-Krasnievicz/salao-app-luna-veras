from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.business_hours import BusinessHours


class BusinessHoursRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[BusinessHours]:
        return self.db.query(BusinessHours).order_by(BusinessHours.weekday).all()

    def get_by_weekday(self, weekday: int) -> Optional[BusinessHours]:
        return self.db.query(BusinessHours).filter(BusinessHours.weekday == weekday).first()

    def upsert(self, weekday: int, opens_at: str, closes_at: str, is_open: bool) -> BusinessHours:
        bh = self.get_by_weekday(weekday)
        if bh:
            bh.opens_at = opens_at
            bh.closes_at = closes_at
            bh.is_open = is_open
        else:
            bh = BusinessHours(weekday=weekday, opens_at=opens_at, closes_at=closes_at, is_open=is_open)
            self.db.add(bh)
        self.db.commit()
        self.db.refresh(bh)
        return bh

    def seed_defaults(self):
        defaults = [
            (0, "09:00", "18:00", True),
            (1, "09:00", "18:00", True),
            (2, "09:00", "18:00", True),
            (3, "09:00", "18:00", True),
            (4, "09:00", "18:00", True),
            (5, "09:00", "14:00", True),
            (6, "09:00", "18:00", False),
        ]
        for wd, op, cl, is_open in defaults:
            if not self.get_by_weekday(wd):
                self.db.add(BusinessHours(weekday=wd, opens_at=op, closes_at=cl, is_open=is_open))
        self.db.commit()
