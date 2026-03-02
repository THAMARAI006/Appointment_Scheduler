from sqlalchemy.orm import Session

from app.models.tenant import Tenant
from app.repositories.base_repository import BaseRepository


class TenantRepository(BaseRepository[Tenant]):
    def __init__(self, db: Session):
        super().__init__(db, Tenant)
