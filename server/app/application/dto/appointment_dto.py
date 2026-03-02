from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.domain.enums import AppointmentFilterType, AppointmentStatus


class AppointmentCreateDTO(BaseModel):
    tenant_id: int
    consultant_id: int
    service_id: int
    user_id: Optional[int] = None
    customer_name: str
    phone_number: str
    appointment_time: datetime
    end_time: Optional[datetime] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.pending


class AppointmentUpdateDTO(BaseModel):
    tenant_id: int
    consultant_id: int
    service_id: int
    user_id: Optional[int] = None
    customer_name: str
    phone_number: str
    appointment_time: datetime
    end_time: Optional[datetime] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.pending


class AppointmentResponseDTO(AppointmentCreateDTO):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentStatusUpdateDTO(BaseModel):
    status: AppointmentStatus


class AppointmentCalendarItemDTO(BaseModel):
    id: int
    applicant_name: str
    consultant_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: AppointmentStatus
    date: date


class AppointmentKPIDTO(BaseModel):
    total: int
    pending: int
    confirmed: int
    completed: int
    daily_upcoming_appointments: int
