from sqlalchemy.orm import Session
from typing import List

from app.domain.entities import ServiceEntity
from app.domain.repositories import ServiceRepositoryInterface
from app.repositories.service_repository import ServiceRepository


class ServiceRepositoryImplementation(ServiceRepositoryInterface):
    def __init__(self, db: Session):
        self.repository = ServiceRepository(db)

    def _to_entity(self, model) -> ServiceEntity:
        return ServiceEntity(
            id=model.id,
            tenant_id=model.tenant_id,
            name=model.name,
            duration_minutes=model.duration_minutes,
            price=model.price,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def create(self, service: ServiceEntity) -> ServiceEntity:
        model = self.repository.create(
            tenant_id=service.tenant_id,
            name=service.name,
            duration_minutes=service.duration_minutes,
            price=service.price,
            status=service.status,
        )
        return self._to_entity(model)

    def list(self) -> list[ServiceEntity]:
        return [self._to_entity(item) for item in self.repository.get_all()]

    def get_by_id(self, service_id: int) -> ServiceEntity | None:
        model = self.repository.get_by_id(service_id)
        if not model:
            return None
        return self._to_entity(model)

    def list_by_tenant(self, tenant_id: int) -> List[ServiceEntity]:
        return [self._to_entity(item) for item in self.repository.get_by_tenant_id(tenant_id)]

    def update(self, service: ServiceEntity) -> ServiceEntity:
        model = self.repository.get_by_id(service.id)
        model.name = service.name
        model.duration_minutes = service.duration_minutes
        model.price = service.price
        model.status = service.status
        model = self.repository.save(model)
        return self._to_entity(model)

    def delete(self, service_id: int) -> bool:
        model = self.repository.get_by_id(service_id)
        if not model:
            return False
        self.repository.delete(model)
        return True
