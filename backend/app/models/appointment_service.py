from sqlalchemy import Column, ForeignKey, Integer, String
from app.core.database import Base


class AppointmentService(Base):
    __tablename__ = "appointment_services"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    service_name_snapshot = Column(String(255), nullable=False)
    service_duration_snapshot = Column(Integer, nullable=False)
    service_price_snapshot = Column(Integer, nullable=False)
