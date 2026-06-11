import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from abc import ABC, abstractmethod

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseEmailService(ABC):
    @abstractmethod
    def send(self, to: str, subject: str, body_html: str):
        pass


class NoopEmailService(BaseEmailService):
    def send(self, to: str, subject: str, body_html: str):
        logger.info("[EMAIL NOOP] To: %s | Subject: %s", to, subject)


class SMTPEmailService(BaseEmailService):
    def send(self, to: str, subject: str, body_html: str):
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to, msg.as_string())


class ResendEmailService(BaseEmailService):
    def send(self, to: str, subject: str, body_html: str):
        with httpx.Client(timeout=10) as client:
            response = client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.EMAIL_FROM,
                    "to": [to],
                    "subject": subject,
                    "html": body_html,
                },
            )
            if response.status_code >= 400:
                logger.error("Resend error: %s %s", response.status_code, response.text[:200])
                raise Exception(f"Resend error: {response.status_code}")


def get_email_service() -> BaseEmailService:
    provider = settings.EMAIL_PROVIDER.lower()
    if provider == "smtp":
        return SMTPEmailService()
    elif provider == "resend":
        return ResendEmailService()
    return NoopEmailService()


def send_password_reset_email(to: str, reset_link: str):
    service = get_email_service()
    subject = "Redefinir sua senha"
    body = f"""
    <p>Você solicitou a redefinição de senha.</p>
    <p><a href="{reset_link}">Clique aqui para redefinir sua senha</a></p>
    <p>Este link expira em 2 horas.</p>
    <p>Se não foi você, ignore este email.</p>
    """
    try:
        service.send(to, subject, body)
    except Exception as e:
        logger.error("Failed to send password reset email to %s: %s", to, str(e))
