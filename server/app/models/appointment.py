from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.domain.enums import AppointmentStatus
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        Index("ix_appointments_consultant_time", "consultant_id", "appointment_time"),
        Index("ix_appointments_service_time", "service_id", "appointment_time"),
    )

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    appointment_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    timezone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(
        Enum(AppointmentStatus, name="appointment_status"),
        default=AppointmentStatus.pending,
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="appointments")
    user = relationship("User", back_populates="appointments")
    consultant = relationship("Consultant", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
