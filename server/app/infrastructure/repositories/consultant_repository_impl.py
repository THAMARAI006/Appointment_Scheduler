from sqlalchemy.orm import Session

from app.domain.entities import ConsultantEntity
from app.domain.repositories import ConsultantRepositoryInterface
from app.repositories.consultant_repository import ConsultantRepository


class ConsultantRepositoryImplementation(ConsultantRepositoryInterface):
    def __init__(self, db: Session):
        self.repository = ConsultantRepository(db)

    def _to_entity(self, model) -> ConsultantEntity:
        return ConsultantEntity(
            id=model.id,
            tenant_id=model.tenant_id,
            display_name=model.display_name,
            specialization=model.specialization,
            user_id=model.user_id,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def create(self, consultant: ConsultantEntity) -> ConsultantEntity:
        model = self.repository.create(
            tenant_id=consultant.tenant_id,
            display_name=consultant.display_name,
            specialization=consultant.specialization,
            user_id=consultant.user_id,
            status=consultant.status,
        )
        return self._to_entity(model)

    def list(self) -> list[ConsultantEntity]:
        return [self._to_entity(item) for item in self.repository.get_all()]

    def get_by_id(self, consultant_id: int) -> ConsultantEntity | None:
        model = self.repository.get_by_id(consultant_id)
        if not model:
            return None
        return self._to_entity(model)

    def update(self, consultant: ConsultantEntity) -> ConsultantEntity:
        model = self.repository.get_by_id(consultant.id)
        model.display_name = consultant.display_name
        model.specialization = consultant.specialization
        model.user_id = consultant.user_id
        model.status = consultant.status
        model = self.repository.save(model)
        return self._to_entity(model)

    def delete(self, consultant_id: int) -> bool:
        model = self.repository.get_by_id(consultant_id)
        if not model:
            return False
        self.repository.delete(model)
        return True
