from abc import ABC, abstractmethod

from app.domain.entities import TenantEntity


class TenantRepositoryInterface(ABC):
    @abstractmethod
    def create(self, tenant: TenantEntity) -> TenantEntity:
        pass

    @abstractmethod
    def list(self) -> list[TenantEntity]:
        pass

    @abstractmethod
    def get_by_id(self, tenant_id: int) -> TenantEntity | None:
        pass

    @abstractmethod
    def update(self, tenant: TenantEntity) -> TenantEntity:
        pass

    @abstractmethod
    def delete(self, tenant_id: int) -> bool:
        pass
