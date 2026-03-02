from app.application.dto.consultant_dto import ConsultantCreateDTO, ConsultantResponseDTO
from app.domain.entities import ConsultantEntity


def consultant_create_dto_to_entity(dto: ConsultantCreateDTO) -> ConsultantEntity:
    return ConsultantEntity(id=None, **dto.model_dump())


def consultant_entity_to_response_dto(entity: ConsultantEntity) -> ConsultantResponseDTO:
    return ConsultantResponseDTO.model_validate(entity)
