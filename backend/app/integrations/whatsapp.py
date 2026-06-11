import logging
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class WhatsAppIntegration:
    BASE_URL = "https://graph.facebook.com/v18.0"

    def _send_template(self, phone: str, template_name: str, components: list):
        if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
            logger.info("[WhatsApp SKIP] No credentials configured. Would send template '%s' to %s", template_name, phone)
            return

        url = f"{self.BASE_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "pt_BR"},
                "components": components,
            },
        }

        with httpx.Client(timeout=10) as client:
            response = client.post(url, headers=headers, json=payload)
            if response.status_code >= 400:
                logger.error("WhatsApp API error: %s %s", response.status_code, response.text[:200])
                raise Exception(f"WhatsApp API error: {response.status_code}")

    def send_client_reminder(self, phone: str, name: str, time_str: str):
        """
        Template body: "Olá, {{1}}! Passando para lembrar do seu agendamento no salão às {{2}} de hoje. Até já!"
        """
        components = [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": name},
                    {"type": "text", "text": time_str},
                ],
            }
        ]
        self._send_template(phone, settings.WHATSAPP_TEMPLATE_CLIENT_REMINDER, components)

    def send_admin_reminder(self, admin_phone: str, client_name: str, time_str: str, client_phone: str):
        """
        Template body: "Lembrete: {{1}} tem agendamento às {{2}}. WhatsApp: {{3}}."
        """
        components = [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": client_name},
                    {"type": "text", "text": time_str},
                    {"type": "text", "text": client_phone},
                ],
            }
        ]
        self._send_template(admin_phone, settings.WHATSAPP_TEMPLATE_ADMIN_REMINDER, components)
