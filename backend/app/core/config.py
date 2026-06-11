from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # App
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Secrets
    JWT_SECRET: str
    SESSION_SECRET: str = ""
    CRON_SECRET: str

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""
    MERCADOPAGO_WEBHOOK_SECRET: str = ""

    # WhatsApp
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ADMIN_PHONE: str = ""
    WHATSAPP_TEMPLATE_CLIENT_REMINDER: str = "lembrete_cliente"
    WHATSAPP_TEMPLATE_ADMIN_REMINDER: str = "lembrete_admin"

    # Email
    EMAIL_PROVIDER: str = "noop"
    EMAIL_FROM: str = "noreply@example.com"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    RESEND_API_KEY: str = ""

    # Pending payment expiry minutes (slot locked for this long)
    PENDING_PAYMENT_EXPIRY_MINUTES: int = 15

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
