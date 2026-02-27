from sqlalchemy.orm import Session

from app.models.service import Service
from app.repositories.base_repository import BaseRepository


class ServiceRepository(BaseRepository[Service]):
    def __init__(self, db: Session):
        super().__init__(db, Service)

    def get_by_tenant_id(self, tenant_id: int) -> list[Service]:
        return self.db.query(Service).filter(Service.tenant_id == tenant_id).all()
