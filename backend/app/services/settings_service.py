from sqlalchemy.orm import Session
from app.repositories.settings_repository import SettingsRepository
from app.repositories.business_hours_repository import BusinessHoursRepository
from app.schemas.settings import SettingsUpdate, SettingsResponse, PublicSettingsResponse


class SettingsService:
    def __init__(self, db: Session):
        self.repo = SettingsRepository(db)
        self.bh_repo = BusinessHoursRepository(db)

    def get_or_create(self):
        s = self.repo.get()
        if not s:
            s = self.repo.create_defaults()
        return s

    def get_with_hours(self) -> SettingsResponse:
        s = self.get_or_create()
        bh = self.bh_repo.get_all()
        result = SettingsResponse.model_validate(s)
        result.business_hours = [
            {"weekday": h.weekday, "opens_at": h.opens_at, "closes_at": h.closes_at, "is_open": h.is_open}
            for h in bh
        ]
        return result

    def get_public(self) -> PublicSettingsResponse:
        s = self.get_or_create()
        bh = self.bh_repo.get_all()
        return PublicSettingsResponse(
            salon_name=s.salon_name,
            reservation_amount_cents=s.reservation_amount_cents,
            appointment_duration_minutes=s.appointment_duration_minutes,
            timezone=s.timezone,
            business_hours=[
                {"weekday": h.weekday, "opens_at": h.opens_at, "closes_at": h.closes_at, "is_open": h.is_open}
                for h in bh
            ],
        )

    def update(self, data: SettingsUpdate) -> SettingsResponse:
        s = self.get_or_create()
        update_fields = data.model_dump(exclude_none=True, exclude={"business_hours"})
        if update_fields:
            self.repo.update(s, **update_fields)

        if data.business_hours is not None:
            for bh in data.business_hours:
                self.bh_repo.upsert(bh.weekday, bh.opens_at, bh.closes_at, bh.is_open)

        return self.get_with_hours()
