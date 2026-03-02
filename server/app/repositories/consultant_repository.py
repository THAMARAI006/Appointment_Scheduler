from sqlalchemy.orm import Session

from app.models.consultant import Consultant
from app.repositories.base_repository import BaseRepository


class ConsultantRepository(BaseRepository[Consultant]):
    def __init__(self, db: Session):
        super().__init__(db, Consultant)

    def get_by_tenant_id(self, tenant_id: int) -> list[Consultant]:
        return self.db.query(Consultant).filter(Consultant.tenant_id == tenant_id).all()
