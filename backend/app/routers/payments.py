import logging
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.integrations.mercadopago import MercadoPagoIntegration
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/api/payments", tags=["payments"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.post("/mercadopago/webhook")
@limiter.limit("60/minute")
async def mercadopago_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_signature: str = Header(default=None, alias="x-signature"),
    x_request_id: str = Header(default=None, alias="x-request-id"),
):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload.")

    logger.info("MP webhook received: type=%s", payload.get("type"))

    if payload.get("type") != "payment":
        return {"status": "ignored"}

    payment_id = str(payload.get("data", {}).get("id", ""))
    if not payment_id:
        return {"status": "ignored"}

    mp = MercadoPagoIntegration()

    # Validate signature if secret is configured
    if x_signature and x_request_id:
        if not mp.validate_webhook_signature(x_signature, x_request_id or "", payment_id):
            logger.warning("Invalid MP webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature.")

    try:
        payment = mp.get_payment(payment_id)
        external_ref = payment.get("external_reference")
        payment_status = payment.get("status")

        if not external_ref:
            return {"status": "no_reference"}

        appointment_id = int(external_ref)
        AppointmentService(db).confirm_payment(appointment_id, payment_id, payment_status)
        logger.info("Appointment %s updated to payment_status=%s", appointment_id, payment_status)

    except Exception as e:
        logger.error("Webhook processing error: %s", str(e))
        raise HTTPException(status_code=500, detail="Processing error.")

    return {"status": "ok"}
