from app.application.dto.user_dto import (
    UserLoginDTO,
    UserProfileUpdateDTO,
    UserRegisterDTO,
    UserResponseDTO,
)
from app.application.mappers import (
    user_entity_to_response_dto,
    user_profile_update_dto_to_entity,
    user_register_dto_to_entity,
)
from app.domain.repositories import UserRepositoryInterface


def register_user_use_case(repository: UserRepositoryInterface, user: UserRegisterDTO) -> UserResponseDTO:
    entity = user_register_dto_to_entity(user)
    created = repository.register(entity)
    return user_entity_to_response_dto(created)


def login_user_use_case(repository: UserRepositoryInterface, login: UserLoginDTO) -> UserResponseDTO | None:
    entity = repository.login(email=login.email, phone=login.phone)
    if not entity:
        return None
    return user_entity_to_response_dto(entity)


def update_user_profile_use_case(
    repository: UserRepositoryInterface,
    user_id: int,
    profile: UserProfileUpdateDTO,
) -> UserResponseDTO | None:
    existing = repository.get_by_id(user_id)
    if not existing:
        return None

    updated_entity = user_profile_update_dto_to_entity(existing, profile)
    updated = repository.update_profile(updated_entity)
    return user_entity_to_response_dto(updated)


def list_users_use_case(repository: UserRepositoryInterface) -> list[UserResponseDTO]:
    return [user_entity_to_response_dto(item) for item in repository.list()]


def get_user_use_case(repository: UserRepositoryInterface, user_id: int) -> UserResponseDTO | None:
    entity = repository.get_by_id(user_id)
    if not entity:
        return None
    return user_entity_to_response_dto(entity)
