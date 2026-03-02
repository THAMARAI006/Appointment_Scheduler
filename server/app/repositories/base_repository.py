from typing import Generic, TypeVar, Type
from sqlalchemy.orm import Session


ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def create(self, **kwargs) -> ModelType:
        instance = self.model(**kwargs)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def get_by_id(self, record_id: int) -> ModelType | None:
        return self.db.query(self.model).filter(self.model.id == record_id).first()

    def get_all(self) -> list[ModelType]:
        return self.db.query(self.model).all()

    def delete(self, instance: ModelType) -> None:
        self.db.delete(instance)
        self.db.commit()

    def save(self, instance: ModelType) -> ModelType:
        self.db.commit()
        self.db.refresh(instance)
        return instance
