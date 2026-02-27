from abc import ABC, abstractmethod

from app.domain.entities import ConsultantEntity


class ConsultantRepositoryInterface(ABC):
    @abstractmethod
    def create(self, consultant: ConsultantEntity) -> ConsultantEntity:
        pass

    @abstractmethod
    def list(self) -> list[ConsultantEntity]:
        pass

    @abstractmethod
    def get_by_id(self, consultant_id: int) -> ConsultantEntity | None:
        pass

    @abstractmethod
    def update(self, consultant: ConsultantEntity) -> ConsultantEntity:
        pass

    @abstractmethod
    def delete(self, consultant_id: int) -> bool:
        pass
