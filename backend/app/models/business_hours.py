from sqlalchemy import Boolean, Column, Integer, String
from app.core.database import Base


class BusinessHours(Base):
    __tablename__ = "business_hours"

    id = Column(Integer, primary_key=True, index=True)
    weekday = Column(Integer, nullable=False, unique=True)  # 0=Monday, 6=Sunday
    opens_at = Column(String(5), nullable=False, default="09:00")  # HH:MM
    closes_at = Column(String(5), nullable=False, default="18:00")
    is_open = Column(Boolean, default=True, nullable=False)
