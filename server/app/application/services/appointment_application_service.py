from datetime import date

from app.application.dto.appointment_dto import (
    AppointmentCalendarItemDTO,
    AppointmentCreateDTO,
    AppointmentKPIDTO,
    AppointmentResponseDTO,
    AppointmentUpdateDTO,
)
from app.application.mappers import (
    appointment_create_dto_to_entity,
    appointment_entity_to_response_dto,
    appointment_update_dto_to_entity,
)
from app.domain.enums import AppointmentFilterType, AppointmentStatus
from app.domain.repositories import AppointmentRepositoryInterface


def create_appointment_use_case(repository: AppointmentRepositoryInterface, appointment: AppointmentCreateDTO):
    entity = appointment_create_dto_to_entity(appointment)
    created = repository.create(entity)
    return appointment_entity_to_response_dto(created)


def list_appointments_use_case(repository: AppointmentRepositoryInterface):
    return [appointment_entity_to_response_dto(item) for item in repository.list()]


def get_appointment_use_case(repository: AppointmentRepositoryInterface, appointment_id: int):
    entity = repository.get_by_id(appointment_id)
    if not entity:
        return None
    return appointment_entity_to_response_dto(entity)


def update_appointment_use_case(
    repository: AppointmentRepositoryInterface,
    appointment_id: int,
    appointment: AppointmentUpdateDTO,
):
    existing = repository.get_by_id(appointment_id)
    if not existing:
        return None

    entity = appointment_update_dto_to_entity(appointment_id, appointment)
    updated = repository.update(entity)
    return appointment_entity_to_response_dto(updated)


def delete_appointment_use_case(repository: AppointmentRepositoryInterface, appointment_id: int):
    return repository.delete(appointment_id)


def update_appointment_status_use_case(repository: AppointmentRepositoryInterface, appointment_id: int, status: str):
    entity = repository.update_status(appointment_id, AppointmentStatus(status))
    if not entity:
        return None
    return appointment_entity_to_response_dto(entity)


def get_appointment_kpis_use_case(
    repository: AppointmentRepositoryInterface,
    filter_type: str = "daily",
    reference_date: date | None = None,
):
    kpis = repository.get_kpis(
        filter_type=AppointmentFilterType(filter_type),
        reference_date=reference_date,
    )
    return AppointmentKPIDTO.model_validate(kpis)


def get_calendar_appointments_use_case(
    repository: AppointmentRepositoryInterface,
    filter_type: str = "daily",
    reference_date: date | None = None,
):
    items = repository.get_calendar_items(
        filter_type=AppointmentFilterType(filter_type),
        reference_date=reference_date,
    )
    return [AppointmentCalendarItemDTO.model_validate(item) for item in items]
