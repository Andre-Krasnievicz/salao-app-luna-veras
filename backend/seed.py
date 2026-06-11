"""Seed initial data: admin user, default settings, business hours, services."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.settings import SalonSettings
from app.models.business_hours import BusinessHours
from app.models.service import Service
from app.core.constants import SALON_NAME

# (name, category, duration_minutes, sort_order)
SERVICES_SEED = [
    ("Mão",                                "Unhas simples",              40, 0),
    ("Pé",                                 "Unhas simples",              40, 1),
    ("Esmaltação em gel",                  "Alongamentos",               60, 0),
    ("Postiça realista simples",           "Alongamentos",               60, 1),
    ("Postiça 3D e mix de decorações",     "Alongamentos",               90, 2),
    ("Blindagem unha natural",             "Alongamentos",               90, 3),
    ("Unha de gel (estrutura lisa)",       "Alongamentos",              120, 4),
    ("Unhas de gel (estrutura decorações)", "Alongamentos",             150, 5),
    ("Acrílico (lisa)",                    "Alongamentos",              120, 6),
    ("Acrílico (mix de decorações)",       "Alongamentos",              150, 7),
    ("Molde F1 (liso)",                    "Alongamentos",              120, 8),
    ("Molde F1 (mix de decorações)",       "Alongamentos",              150, 9),
    ("Acrílico",                           "Manutenção de alongamento",  60, 0),
    ("Gel",                                "Manutenção de alongamento",  60, 1),
    ("Remoção",                            "Manutenção de alongamento",  60, 2),
    ("Molde F1",                           "Manutenção de alongamento",  60, 3),
]


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

        # Services
        if not db.query(Service).first():
            for name, category, duration, sort in SERVICES_SEED:
                db.add(Service(
                    name=name,
                    category=category,
                    duration_minutes=duration,
                    price_cents=0,
                    is_active=True,
                    sort_order=sort,
                ))
            db.commit()
            print(f"✓ {len(SERVICES_SEED)} services seeded.")
        else:
            print("✓ Services already exist.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
