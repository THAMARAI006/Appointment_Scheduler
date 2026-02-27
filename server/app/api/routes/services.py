from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.application.dto.service_dto import ServiceCreateDTO, ServiceResponseDTO
from app.application.services.service_application_service import (
    create_service_use_case,
    delete_service_use_case,
    get_service_use_case,
    list_services_use_case,
    list_tenant_services_use_case,
    update_service_use_case,
)
from app.core.database import get_db
from app.infrastructure.repositories import ServiceRepositoryImplementation

router = APIRouter()


@router.post("/", response_model=ServiceResponseDTO)
def create(service: ServiceCreateDTO, db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    return create_service_use_case(repository, service)


@router.get("/", response_model=List[ServiceResponseDTO])
def list_services(db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    return list_services_use_case(repository)


@router.get("/{service_id}", response_model=ServiceResponseDTO)
def get_service(service_id: int, db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    service = get_service_use_case(repository, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.get("/tenant/{tenant_id}", response_model=List[ServiceResponseDTO])
def get_tenant_services(tenant_id: int, db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    return list_tenant_services_use_case(repository, tenant_id)


@router.put("/{service_id}", response_model=ServiceResponseDTO)
def update(service_id: int, service: ServiceCreateDTO, db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    updated_service = update_service_use_case(repository, service_id, service)
    if not updated_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return updated_service


@router.delete("/{service_id}")
def delete(service_id: int, db: Session = Depends(get_db)):
    repository = ServiceRepositoryImplementation(db)
    deleted_service = delete_service_use_case(repository, service_id)
    if not deleted_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}
