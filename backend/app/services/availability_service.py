from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.business_hours_repository import BusinessHoursRepository
from app.repositories.settings_repository import SettingsRepository
from app.schemas.availability import TimeSlot, AvailabilityResponse


class AvailabilityService:
    def __init__(self, db: Session):
        self.appt_repo = AppointmentRepository(db)
        self.bh_repo = BusinessHoursRepository(db)
        self.settings_repo = SettingsRepository(db)

    def get_availability(self, date_str: str, duration_minutes: Optional[int] = None) -> AvailabilityResponse:
        salon_settings = self.settings_repo.get()
        if not salon_settings:
            return AvailabilityResponse(date=date_str, slots=[])

        tz = ZoneInfo(salon_settings.timezone)
        # step: fixed grid interval (unchanged behavior)
        step = timedelta(minutes=salon_settings.appointment_duration_minutes)
        # slot_duration: actual block to check for availability
        slot_duration = timedelta(minutes=duration_minutes) if duration_minutes else step

        # Parse date in salon timezone
        try:
            local_date = date.fromisoformat(date_str)
        except ValueError:
            return AvailabilityResponse(date=date_str, slots=[])

        # Get weekday (0=Monday, 6=Sunday)
        weekday = local_date.weekday()
        bh = self.bh_repo.get_by_weekday(weekday)

        if not bh or not bh.is_open:
            return AvailabilityResponse(date=date_str, slots=[])

        # Build time slots
        opens_h, opens_m = map(int, bh.opens_at.split(":"))
        closes_h, closes_m = map(int, bh.closes_at.split(":"))

        day_start = datetime(local_date.year, local_date.month, local_date.day, opens_h, opens_m, tzinfo=tz)
        day_end = datetime(local_date.year, local_date.month, local_date.day, closes_h, closes_m, tzinfo=tz)

        # Get all appointments for this day (use a wider window to catch long overlapping appointments)
        day_start_utc = day_start.astimezone(timezone.utc)
        day_end_utc = day_end.astimezone(timezone.utc)
        appointments = self.appt_repo.get_by_date_range(day_start_utc, day_end_utc)

        now_utc = datetime.now(timezone.utc)

        slots: List[TimeSlot] = []
        current = day_start
        # Guard: the full slot_duration block must fit before closing time
        while current + slot_duration <= day_end:
            slot_end = current + slot_duration
            slot_start_utc = current.astimezone(timezone.utc)
            slot_end_utc = slot_end.astimezone(timezone.utc)

            # Skip past slots — advance by step (not slot_duration)
            if slot_start_utc <= now_utc:
                current += step
                continue

            # Check for conflicts over the full [slot_start, slot_end] window
            conflict = any(
                appt.start_time < slot_end_utc and appt.end_time > slot_start_utc
                for appt in appointments
            )

            slots.append(TimeSlot(
                start_time=slot_start_utc,
                end_time=slot_end_utc,
                available=not conflict,
            ))
            current += step

        return AvailabilityResponse(date=date_str, slots=slots)
