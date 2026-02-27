from app.application.dto.consultant_dto import ConsultantCreateDTO, ConsultantResponseDTO
from app.application.mappers import consultant_create_dto_to_entity, consultant_entity_to_response_dto
from app.domain.repositories import ConsultantRepositoryInterface


def create_consultant_use_case(
    repository: ConsultantRepositoryInterface,
    consultant: ConsultantCreateDTO,
) -> ConsultantResponseDTO:
    entity = consultant_create_dto_to_entity(consultant)
    created = repository.create(entity)
    return consultant_entity_to_response_dto(created)


def list_consultants_use_case(repository: ConsultantRepositoryInterface) -> list[ConsultantResponseDTO]:
    return [consultant_entity_to_response_dto(item) for item in repository.list()]


def get_consultant_use_case(
    repository: ConsultantRepositoryInterface,
    consultant_id: int,
) -> ConsultantResponseDTO | None:
    entity = repository.get_by_id(consultant_id)
    if not entity:
        return None
    return consultant_entity_to_response_dto(entity)


def update_consultant_use_case(
    repository: ConsultantRepositoryInterface,
    consultant_id: int,
    consultant: ConsultantCreateDTO,
) -> ConsultantResponseDTO | None:
    existing = repository.get_by_id(consultant_id)
    if not existing:
        return None

    updated_entity = consultant_create_dto_to_entity(consultant)
    updated_entity.id = consultant_id
    updated = repository.update(updated_entity)
    return consultant_entity_to_response_dto(updated)


def delete_consultant_use_case(repository: ConsultantRepositoryInterface, consultant_id: int) -> bool:
    return repository.delete(consultant_id)
