from app.application.dto.service_dto import ServiceCreateDTO, ServiceResponseDTO
from app.application.mappers import service_create_dto_to_entity, service_entity_to_response_dto
from app.domain.repositories import ServiceRepositoryInterface


def create_service_use_case(repository: ServiceRepositoryInterface, service: ServiceCreateDTO) -> ServiceResponseDTO:
    entity = service_create_dto_to_entity(service)
    created = repository.create(entity)
    return service_entity_to_response_dto(created)


def list_services_use_case(repository: ServiceRepositoryInterface) -> list[ServiceResponseDTO]:
    return [service_entity_to_response_dto(item) for item in repository.list()]


def get_service_use_case(repository: ServiceRepositoryInterface, service_id: int) -> ServiceResponseDTO | None:
    entity = repository.get_by_id(service_id)
    if not entity:
        return None
    return service_entity_to_response_dto(entity)


def list_tenant_services_use_case(
    repository: ServiceRepositoryInterface,
    tenant_id: int,
) -> list[ServiceResponseDTO]:
    return [service_entity_to_response_dto(item) for item in repository.list_by_tenant(tenant_id)]


def update_service_use_case(
    repository: ServiceRepositoryInterface,
    service_id: int,
    service: ServiceCreateDTO,
) -> ServiceResponseDTO | None:
    existing = repository.get_by_id(service_id)
    if not existing:
        return None

    updated_entity = service_create_dto_to_entity(service)
    updated_entity.id = service_id
    updated = repository.update(updated_entity)
    return service_entity_to_response_dto(updated)


def delete_service_use_case(repository: ServiceRepositoryInterface, service_id: int) -> bool:
    return repository.delete(service_id)
