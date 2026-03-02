from app.application.dto.appointment_dto import (
    AppointmentCreateDTO,
    AppointmentResponseDTO,
    AppointmentUpdateDTO,
)
from app.domain.entities import AppointmentEntity


def appointment_create_dto_to_entity(dto: AppointmentCreateDTO) -> AppointmentEntity:
    return AppointmentEntity(id=None, **dto.model_dump())


def appointment_update_dto_to_entity(appointment_id: int, dto: AppointmentUpdateDTO) -> AppointmentEntity:
    return AppointmentEntity(id=appointment_id, **dto.model_dump())


def appointment_entity_to_response_dto(entity: AppointmentEntity) -> AppointmentResponseDTO:
    return AppointmentResponseDTO.model_validate(entity)
