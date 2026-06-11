from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from app.core.database import Base


class DataDeletionRequest(Base):
    __tablename__ = "data_deletion_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(
        Enum("pending", "completed", "rejected", name="deletion_status"),
        nullable=False,
        default="pending",
    )
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
