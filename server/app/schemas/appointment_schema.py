from app.application.dto.appointment_dto import (
    AppointmentCalendarItemDTO,
    AppointmentCreateDTO,
    AppointmentKPIDTO,
    AppointmentResponseDTO,
    AppointmentStatusUpdateDTO,
    AppointmentUpdateDTO,
)
from app.domain.enums import AppointmentFilterType

AppointmentCreate = AppointmentCreateDTO
AppointmentUpdate = AppointmentUpdateDTO
AppointmentResponse = AppointmentResponseDTO
AppointmentStatusUpdate = AppointmentStatusUpdateDTO

__all__ = [
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "AppointmentStatusUpdate",
    "AppointmentCalendarItemDTO",
    "AppointmentKPIDTO",
    "AppointmentFilterType",
]
