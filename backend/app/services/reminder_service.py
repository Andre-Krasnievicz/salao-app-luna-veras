import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.settings_repository import SettingsRepository
from app.integrations.whatsapp import WhatsAppIntegration

logger = logging.getLogger(__name__)


class ReminderService:
    def __init__(self, db: Session):
        self.appt_repo = AppointmentRepository(db)
        self.settings_repo = SettingsRepository(db)
        self.whatsapp = WhatsAppIntegration()

    def send_pending_reminders(self) -> dict:
        settings = self.settings_repo.get()
        if not settings or not settings.whatsapp_reminders_enabled:
            return {"sent_client": 0, "sent_admin": 0, "skipped": 0}

        appointments = self.appt_repo.get_pending_reminders()
        now = datetime.now(timezone.utc)
        sent_client = 0
        sent_admin = 0
        skipped = 0

        for appt in appointments:
            minutes_until = (appt.start_time - now).total_seconds() / 60

            # Client reminder: within ~1 hour
            if appt.client_reminder_sent_at is None and minutes_until <= 70:
                phone = appt.client_phone
                name = appt.client_name or "Cliente"
                if phone:
                    try:
                        self.whatsapp.send_client_reminder(
                            phone=phone,
                            name=name,
                            time_str=appt.start_time.strftime("%H:%M"),
                        )
                        self.appt_repo.update(appt, client_reminder_sent_at=now)
                        sent_client += 1
                        logger.info("Client reminder sent for appointment %s", appt.id)
                    except Exception as e:
                        logger.warning("Failed to send client reminder for appt %s: %s", appt.id, str(e))
                        skipped += 1
                else:
                    skipped += 1

            # Admin reminder: within ~30 min
            if appt.admin_reminder_sent_at is None and minutes_until <= 40:
                admin_phone = settings.admin_whatsapp
                if admin_phone:
                    try:
                        self.whatsapp.send_admin_reminder(
                            admin_phone=admin_phone,
                            client_name=appt.client_name or "Cliente",
                            time_str=appt.start_time.strftime("%H:%M"),
                            client_phone=appt.client_phone or "-",
                        )
                        self.appt_repo.update(appt, admin_reminder_sent_at=now)
                        sent_admin += 1
                        logger.info("Admin reminder sent for appointment %s", appt.id)
                    except Exception as e:
                        logger.warning("Failed to send admin reminder for appt %s: %s", appt.id, str(e))
                        skipped += 1
                else:
                    skipped += 1

        return {"sent_client": sent_client, "sent_admin": sent_admin, "skipped": skipped}
