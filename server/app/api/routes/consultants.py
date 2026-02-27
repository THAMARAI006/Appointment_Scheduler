from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.application.dto.consultant_dto import ConsultantCreateDTO, ConsultantResponseDTO
from app.application.services.consultant_application_service import (
    create_consultant_use_case,
    delete_consultant_use_case,
    get_consultant_use_case,
    list_consultants_use_case,
    update_consultant_use_case,
)
from app.core.database import get_db
from app.infrastructure.repositories import ConsultantRepositoryImplementation

router = APIRouter()


@router.post("/", response_model=ConsultantResponseDTO)
def create(consultant: ConsultantCreateDTO, db: Session = Depends(get_db)):
    repository = ConsultantRepositoryImplementation(db)
    return create_consultant_use_case(repository, consultant)


@router.get("/", response_model=List[ConsultantResponseDTO])
def list_consultants(db: Session = Depends(get_db)):
    repository = ConsultantRepositoryImplementation(db)
    return list_consultants_use_case(repository)


@router.get("/{consultant_id}", response_model=ConsultantResponseDTO)
def get_consultant(consultant_id: int, db: Session = Depends(get_db)):
    repository = ConsultantRepositoryImplementation(db)
    consultant = get_consultant_use_case(repository, consultant_id)
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    return consultant


@router.put("/{consultant_id}", response_model=ConsultantResponseDTO)
def update(consultant_id: int, consultant: ConsultantCreateDTO, db: Session = Depends(get_db)):
    repository = ConsultantRepositoryImplementation(db)
    updated_consultant = update_consultant_use_case(repository, consultant_id, consultant)
    if not updated_consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    return updated_consultant


@router.delete("/{consultant_id}")
def delete(consultant_id: int, db: Session = Depends(get_db)):
    repository = ConsultantRepositoryImplementation(db)
    deleted_consultant = delete_consultant_use_case(repository, consultant_id)
    if not deleted_consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    return {"message": "Consultant deleted successfully"}
