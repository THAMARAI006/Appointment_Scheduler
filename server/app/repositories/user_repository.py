from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_tenant_id(self, tenant_id: int) -> list[User]:
        return self.db.query(User).filter(User.tenant_id == tenant_id).all()
