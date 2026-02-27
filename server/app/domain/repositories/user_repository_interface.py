from abc import ABC, abstractmethod

from app.domain.entities import UserEntity


class UserRepositoryInterface(ABC):
    @abstractmethod
    def register(self, user: UserEntity) -> UserEntity:
        pass

    @abstractmethod
    def login(self, email: str | None, phone: str | None) -> UserEntity | None:
        pass

    @abstractmethod
    def update_profile(self, user: UserEntity) -> UserEntity:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> UserEntity | None:
        pass

    @abstractmethod
    def list(self) -> list[UserEntity]:
        pass
