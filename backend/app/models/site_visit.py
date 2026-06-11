from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String
from app.core.database import Base


class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(500), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
