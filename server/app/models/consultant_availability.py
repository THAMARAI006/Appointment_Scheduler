from sqlalchemy import Column, Integer, String, Time, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import time

from app.core.database import Base


class ConsultantAvailability(Base):
    """
    Stores working hours and availability slots for consultants.
    Example: John works Mon-Fri, 9 AM - 5 PM with 30-min slots.
    """
    __tablename__ = "consultant_availability"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Day of week: 0=Monday, 1=Tuesday, ... 6=Sunday
    day_of_week = Column(Integer, nullable=False)  # 0-6
    
    # Working hours
    start_time = Column(Time, nullable=False)  # e.g., 09:00
    end_time = Column(Time, nullable=False)    # e.g., 17:00
    
    # Appointment duration in minutes
    slot_duration_minutes = Column(Integer, default=30)  # 30 min slots
    
    # Is this day available? (can be False for days off)
    is_available = Column(Boolean, default=True)
    
    consultant = relationship("Consultant", back_populates="availability_slots")
