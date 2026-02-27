from app.application.dto.service_dto import ServiceCreateDTO, ServiceResponseDTO
from app.domain.entities import ServiceEntity


def service_create_dto_to_entity(dto: ServiceCreateDTO) -> ServiceEntity:
    return ServiceEntity(id=None, **dto.model_dump())


def service_entity_to_response_dto(entity: ServiceEntity) -> ServiceResponseDTO:
    return ServiceResponseDTO.model_validate(entity)
