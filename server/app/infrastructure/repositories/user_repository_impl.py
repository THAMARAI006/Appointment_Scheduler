from sqlalchemy.orm import Session
import re

from app.domain.entities import UserEntity
from app.domain.repositories import UserRepositoryInterface
from app.models.user import User
from app.repositories.user_repository import UserRepository


class UserRepositoryImplementation(UserRepositoryInterface):
    def __init__(self, db: Session):
        self.db = db
        self.repository = UserRepository(db)

    def _to_entity(self, model) -> UserEntity:
        return UserEntity(
            id=model.id,
            tenant_id=model.tenant_id,
            full_name=model.full_name,
            email=model.email,
            phone=model.phone,
            role=model.role,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def register(self, user: UserEntity) -> UserEntity:
        model = self.repository.create(
            tenant_id=user.tenant_id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=user.role,
            status=user.status,
        )
        return self._to_entity(model)

    @staticmethod
    def _normalize_phone(phone: str | None) -> str:
        if not phone:
            return ""
        return re.sub(r"\D", "", phone)

    def login(self, email: str | None, phone: str | None) -> UserEntity | None:
        # Only match on fields that are actually provided; this avoids
        # accidental matches like "email IS NULL" when email is missing.
        normalized_phone = self._normalize_phone(phone)

        if email:
            model = self.db.query(User).filter(User.email == email).first()
            if model:
                return self._to_entity(model)

        if normalized_phone:
            # Compare in Python after normalizing both sides so formats like
            # "+1 (555) ..." and "1555..." map to the same customer.
            candidates = self.db.query(User).filter(User.phone.isnot(None)).all()
            for candidate in candidates:
                if self._normalize_phone(candidate.phone) == normalized_phone:
                    return self._to_entity(candidate)

        return None

    def update_profile(self, user: UserEntity) -> UserEntity:
        model = self.repository.get_by_id(user.id)
        model.full_name = user.full_name
        model.email = user.email
        model.phone = user.phone
        model = self.repository.save(model)
        return self._to_entity(model)

    def get_by_id(self, user_id: int) -> UserEntity | None:
        model = self.repository.get_by_id(user_id)
        if not model:
            return None
        return self._to_entity(model)

    def list(self) -> list[UserEntity]:
        return [self._to_entity(item) for item in self.repository.get_all()]
