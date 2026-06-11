from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services.reminder_service import ReminderService

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def verify_cron_secret(x_cron_secret: str = Header(alias="X-CRON-SECRET")):
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized.")


@router.post("/send-reminders")
def send_reminders(
    db: Session = Depends(get_db),
    _: None = Depends(verify_cron_secret),
):
    result = ReminderService(db).send_pending_reminders()
    return {"status": "ok", "result": result}
