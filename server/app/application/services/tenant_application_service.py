from app.application.dto.tenant_dto import TenantCreateDTO, TenantResponseDTO
from app.application.mappers import tenant_create_dto_to_entity, tenant_entity_to_response_dto
from app.domain.repositories import TenantRepositoryInterface


def create_tenant_use_case(repository: TenantRepositoryInterface, tenant: TenantCreateDTO) -> TenantResponseDTO:
    entity = tenant_create_dto_to_entity(tenant)
    created = repository.create(entity)
    return tenant_entity_to_response_dto(created)


def list_tenants_use_case(repository: TenantRepositoryInterface) -> list[TenantResponseDTO]:
    return [tenant_entity_to_response_dto(item) for item in repository.list()]


def get_tenant_use_case(repository: TenantRepositoryInterface, tenant_id: int) -> TenantResponseDTO | None:
    entity = repository.get_by_id(tenant_id)
    if not entity:
        return None
    return tenant_entity_to_response_dto(entity)


def update_tenant_use_case(
    repository: TenantRepositoryInterface,
    tenant_id: int,
    tenant: TenantCreateDTO,
) -> TenantResponseDTO | None:
    existing = repository.get_by_id(tenant_id)
    if not existing:
        return None

    updated_entity = tenant_create_dto_to_entity(tenant)
    updated_entity.id = tenant_id
    updated = repository.update(updated_entity)
    return tenant_entity_to_response_dto(updated)


def delete_tenant_use_case(repository: TenantRepositoryInterface, tenant_id: int) -> bool:
    return repository.delete(tenant_id)
