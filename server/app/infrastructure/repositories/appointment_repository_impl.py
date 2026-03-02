from datetime import date
from typing import List
from sqlalchemy.orm import Session

from app.domain.entities import AppointmentEntity
from app.domain.enums import AppointmentFilterType, AppointmentStatus
from app.domain.repositories import AppointmentRepositoryInterface
from app.repositories.appointment_repository import AppointmentRepository


class AppointmentRepositoryImplementation(AppointmentRepositoryInterface):
    def __init__(self, db: Session):
        self.repository = AppointmentRepository(db)

    def _to_entity(self, model) -> AppointmentEntity:
        return AppointmentEntity(
            id=model.id,
            tenant_id=model.tenant_id,
            consultant_id=model.consultant_id,
            service_id=model.service_id,
            user_id=model.user_id,
            customer_name=model.customer_name,
            phone_number=model.phone_number,
            appointment_time=model.appointment_time,
            end_time=model.end_time,
            timezone=model.timezone,
            notes=model.notes,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def create(self, appointment: AppointmentEntity) -> AppointmentEntity:
        model = self.repository.create(
            tenant_id=appointment.tenant_id,
            consultant_id=appointment.consultant_id,
            service_id=appointment.service_id,
            user_id=appointment.user_id,
            customer_name=appointment.customer_name,
            phone_number=appointment.phone_number,
            appointment_time=appointment.appointment_time,
            end_time=appointment.end_time,
            timezone=appointment.timezone,
            notes=appointment.notes,
            status=appointment.status,
        )
        return self._to_entity(model)

    def list(self) -> list[AppointmentEntity]:
        return [self._to_entity(item) for item in self.repository.get_all_ordered()]

    def get_by_id(self, appointment_id: int) -> AppointmentEntity | None:
        model = self.repository.get_by_id(appointment_id)
        if not model:
            return None
        return self._to_entity(model)

    def update(self, appointment: AppointmentEntity) -> AppointmentEntity:
        model = self.repository.get_by_id(appointment.id)
        model.tenant_id = appointment.tenant_id
        model.consultant_id = appointment.consultant_id
        model.service_id = appointment.service_id
        model.user_id = appointment.user_id
        model.customer_name = appointment.customer_name
        model.phone_number = appointment.phone_number
        model.appointment_time = appointment.appointment_time
        model.end_time = appointment.end_time
        model.timezone = appointment.timezone
        model.notes = appointment.notes
        model.status = appointment.status
        model = self.repository.save(model)
        return self._to_entity(model)

    def delete(self, appointment_id: int) -> bool:
        model = self.repository.get_by_id(appointment_id)
        if not model:
            return False
        self.repository.delete(model)
        return True

    def update_status(self, appointment_id: int, status: AppointmentStatus) -> AppointmentEntity | None:
        model = self.repository.update_status(appointment_id, status)
        if not model:
            return None
        return self._to_entity(model)

    def get_kpis(self, filter_type: AppointmentFilterType, reference_date: date | None = None) -> dict:
        return self.repository.get_kpis(filter_type=filter_type, reference_date=reference_date)

    def get_calendar_items(
        self,
        filter_type: AppointmentFilterType,
        reference_date: date | None = None,
    ) -> List[dict]:
        return self.repository.get_calendar_items(filter_type=filter_type, reference_date=reference_date)
