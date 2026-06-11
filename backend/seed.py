"""Seed initial data: admin user, default settings, business hours."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.settings import SalonSettings
from app.models.business_hours import BusinessHours
from app.core.constants import SALON_NAME


def seed():
    db = SessionLocal()
    try:
        # Admin user
        admin = db.query(User).filter(User.email == "admin@salao.com").first()
        if not admin:
            admin = User(
                name="Admin",
                email="admin@salao.com",
                password_hash=hash_password("trocar123"),
                role="admin",
                is_active=True,
                must_change_password=True,
            )
            db.add(admin)
            db.commit()
            print("✓ Admin user created: admin@salao.com / trocar123")
        else:
            print("✓ Admin user already exists.")

        # Settings
        settings_row = db.query(SalonSettings).first()
        if not settings_row:
            settings_row = SalonSettings(
                salon_name=SALON_NAME,
                reservation_amount_cents=2000,
                appointment_duration_minutes=60,
                timezone="America/Sao_Paulo",
                whatsapp_reminders_enabled=True,
            )
            db.add(settings_row)
            db.commit()
            print("✓ Default settings created.")
        else:
            print("✓ Settings already exist.")

        # Business hours
        defaults = [
            (0, "09:00", "18:00", True),   # Monday
            (1, "09:00", "18:00", True),   # Tuesday
            (2, "09:00", "18:00", True),   # Wednesday
            (3, "09:00", "18:00", True),   # Thursday
            (4, "09:00", "18:00", True),   # Friday
            (5, "09:00", "14:00", True),   # Saturday
            (6, "09:00", "18:00", False),  # Sunday (closed)
        ]
        for wd, op, cl, is_open in defaults:
            existing = db.query(BusinessHours).filter(BusinessHours.weekday == wd).first()
            if not existing:
                db.add(BusinessHours(weekday=wd, opens_at=op, closes_at=cl, is_open=is_open))
        db.commit()
        print("✓ Business hours seeded.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
