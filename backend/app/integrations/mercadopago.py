import logging
import mercadopago

from app.core.config import settings

logger = logging.getLogger(__name__)


class MercadoPagoIntegration:
    def __init__(self):
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

    def create_preference(
        self,
        appointment_id: int,
        amount_cents: int,
        client_name: str,
        client_email: str,
    ) -> dict:
        amount_brl = amount_cents / 100.0

        preference_data = {
            "items": [
                {
                    "title": "Reserva de horário - Salão",
                    "quantity": 1,
                    "unit_price": amount_brl,
                    "currency_id": "BRL",
                }
            ],
            "payer": {
                "name": client_name,
                "email": client_email or "cliente@salao.com",
            },
            "back_urls": {
                "success": f"{settings.FRONTEND_URL}/pagamento/sucesso?appointment_id={appointment_id}",
                "failure": f"{settings.FRONTEND_URL}/pagamento/falha?appointment_id={appointment_id}",
                "pending": f"{settings.FRONTEND_URL}/pagamento/pendente?appointment_id={appointment_id}",
            },
            "auto_return": "approved",
            "notification_url": f"{settings.BACKEND_URL}/api/payments/mercadopago/webhook",
            "external_reference": str(appointment_id),
        }

        response = self.sdk.preference().create(preference_data)
        pref = response.get("response", {})

        if response.get("status") not in (200, 201):
            logger.error("MercadoPago preference creation failed: %s", pref)
            raise Exception("Falha ao criar preferência no Mercado Pago.")

        checkout_url = pref.get("sandbox_init_point") if not settings.is_production else pref.get("init_point")

        return {
            "preference_id": pref["id"],
            "checkout_url": checkout_url,
        }

    def get_payment(self, payment_id: str) -> dict:
        response = self.sdk.payment().get(payment_id)
        return response.get("response", {})

    def validate_webhook_signature(self, signature: str, request_id: str, payment_id: str) -> bool:
        """Validates MP webhook signature. Returns True if secret not configured (dev mode)."""
        if not settings.MERCADOPAGO_WEBHOOK_SECRET:
            return True
        import hashlib
        import hmac
        manifest = f"id:{payment_id};request-id:{request_id};"
        expected = hmac.new(
            settings.MERCADOPAGO_WEBHOOK_SECRET.encode(),
            manifest.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
