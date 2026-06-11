from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)
    ip_hash = Column(String(64), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
