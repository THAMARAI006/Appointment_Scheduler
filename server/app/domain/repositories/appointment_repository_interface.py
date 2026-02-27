from abc import ABC, abstractmethod
from datetime import date
from typing import List

from app.domain.entities import AppointmentEntity
from app.domain.enums import AppointmentFilterType, AppointmentStatus


class AppointmentRepositoryInterface(ABC):
    @abstractmethod
    def create(self, appointment: AppointmentEntity) -> AppointmentEntity:
        pass

    @abstractmethod
    def list(self) -> list[AppointmentEntity]:
        pass

    @abstractmethod
    def get_by_id(self, appointment_id: int) -> AppointmentEntity | None:
        pass

    @abstractmethod
    def update(self, appointment: AppointmentEntity) -> AppointmentEntity:
        pass

    @abstractmethod
    def delete(self, appointment_id: int) -> bool:
        pass

    @abstractmethod
    def update_status(self, appointment_id: int, status: AppointmentStatus) -> AppointmentEntity | None:
        pass

    @abstractmethod
    def get_kpis(self, filter_type: AppointmentFilterType, reference_date: date | None = None) -> dict:
        pass

    @abstractmethod
    def get_calendar_items(
        self,
        filter_type: AppointmentFilterType,
        reference_date: date | None = None,
    ) -> List[dict]:
        pass
