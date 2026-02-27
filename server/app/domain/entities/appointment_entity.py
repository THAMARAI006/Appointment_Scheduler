from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.domain.enums import AppointmentStatus


@dataclass
class AppointmentEntity:
    id: Optional[int]
    tenant_id: int
    consultant_id: int
    service_id: int
    user_id: Optional[int]
    customer_name: str
    phone_number: str
    appointment_time: datetime
    end_time: Optional[datetime]
    timezone: Optional[str]
    notes: Optional[str]
    status: AppointmentStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
