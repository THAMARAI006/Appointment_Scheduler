from app.application.dto.tenant_dto import TenantCreateDTO, TenantResponseDTO
from app.domain.entities import TenantEntity


def tenant_create_dto_to_entity(dto: TenantCreateDTO) -> TenantEntity:
    return TenantEntity(id=None, **dto.model_dump())


def tenant_entity_to_response_dto(entity: TenantEntity) -> TenantResponseDTO:
    return TenantResponseDTO.model_validate(entity)
