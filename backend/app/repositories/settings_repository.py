from typing import Optional
from sqlalchemy.orm import Session
from app.models.settings import SalonSettings


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> Optional[SalonSettings]:
        return self.db.query(SalonSettings).first()

    def create_defaults(self) -> SalonSettings:
        s = SalonSettings()
        self.db.add(s)
        self.db.commit()
        self.db.refresh(s)
        return s

    def update(self, s: SalonSettings, **kwargs) -> SalonSettings:
        for key, value in kwargs.items():
            setattr(s, key, value)
        self.db.commit()
        self.db.refresh(s)
        return s
