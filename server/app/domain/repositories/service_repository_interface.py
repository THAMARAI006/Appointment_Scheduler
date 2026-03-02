from abc import ABC, abstractmethod
from typing import List

from app.domain.entities import ServiceEntity


class ServiceRepositoryInterface(ABC):
    @abstractmethod
    def create(self, service: ServiceEntity) -> ServiceEntity:
        pass

    @abstractmethod
    def list(self) -> list[ServiceEntity]:
        pass

    @abstractmethod
    def get_by_id(self, service_id: int) -> ServiceEntity | None:
        pass

    @abstractmethod
    def list_by_tenant(self, tenant_id: int) -> List[ServiceEntity]:
        pass

    @abstractmethod
    def update(self, service: ServiceEntity) -> ServiceEntity:
        pass

    @abstractmethod
    def delete(self, service_id: int) -> bool:
        pass
