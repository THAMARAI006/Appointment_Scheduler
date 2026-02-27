from sqlalchemy.orm import Session

from app.domain.entities import TenantEntity
from app.domain.repositories import TenantRepositoryInterface
from app.repositories.tenant_repository import TenantRepository


class TenantRepositoryImplementation(TenantRepositoryInterface):
    def __init__(self, db: Session):
        self.repository = TenantRepository(db)

    def _to_entity(self, model) -> TenantEntity:
        return TenantEntity(
            id=model.id,
            name=model.name,
            code=model.code,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def create(self, tenant: TenantEntity) -> TenantEntity:
        model = self.repository.create(
            name=tenant.name,
            code=tenant.code,
            status=tenant.status,
        )
        return self._to_entity(model)

    def list(self) -> list[TenantEntity]:
        return [self._to_entity(item) for item in self.repository.get_all()]

    def get_by_id(self, tenant_id: int) -> TenantEntity | None:
        model = self.repository.get_by_id(tenant_id)
        if not model:
            return None
        return self._to_entity(model)

    def update(self, tenant: TenantEntity) -> TenantEntity:
        model = self.repository.get_by_id(tenant.id)
        model.name = tenant.name
        model.code = tenant.code
        model.status = tenant.status
        model = self.repository.save(model)
        return self._to_entity(model)

    def delete(self, tenant_id: int) -> bool:
        model = self.repository.get_by_id(tenant_id)
        if not model:
            return False
        self.repository.delete(model)
        return True
