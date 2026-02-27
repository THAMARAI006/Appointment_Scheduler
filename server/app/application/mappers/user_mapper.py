from app.application.dto.user_dto import (
    UserProfileUpdateDTO,
    UserRegisterDTO,
    UserResponseDTO,
)
from app.domain.entities import UserEntity


def user_register_dto_to_entity(dto: UserRegisterDTO) -> UserEntity:
    return UserEntity(id=None, **dto.model_dump())


def user_profile_update_dto_to_entity(existing: UserEntity, dto: UserProfileUpdateDTO) -> UserEntity:
    updates = dto.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(existing, field, value)
    return existing


def user_entity_to_response_dto(entity: UserEntity) -> UserResponseDTO:
    return UserResponseDTO.model_validate(entity)
