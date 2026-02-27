from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.application.dto.tenant_dto import TenantCreateDTO, TenantResponseDTO
from app.application.services.tenant_application_service import (
    create_tenant_use_case,
    delete_tenant_use_case,
    get_tenant_use_case,
    list_tenants_use_case,
    update_tenant_use_case,
)
from app.core.database import get_db
from app.infrastructure.repositories import TenantRepositoryImplementation

router = APIRouter()


@router.post("/", response_model=TenantResponseDTO)
def create(tenant: TenantCreateDTO, db: Session = Depends(get_db)):
    repository = TenantRepositoryImplementation(db)
    return create_tenant_use_case(repository, tenant)


@router.get("/", response_model=List[TenantResponseDTO])
def list_tenants(db: Session = Depends(get_db)):
    repository = TenantRepositoryImplementation(db)
    return list_tenants_use_case(repository)


@router.get("/{tenant_id}", response_model=TenantResponseDTO)
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    repository = TenantRepositoryImplementation(db)
    tenant = get_tenant_use_case(repository, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponseDTO)
def update(tenant_id: int, tenant: TenantCreateDTO, db: Session = Depends(get_db)):
    repository = TenantRepositoryImplementation(db)
    updated_tenant = update_tenant_use_case(repository, tenant_id, tenant)
    if not updated_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return updated_tenant


@router.delete("/{tenant_id}")
def delete(tenant_id: int, db: Session = Depends(get_db)):
    repository = TenantRepositoryImplementation(db)
    deleted_tenant = delete_tenant_use_case(repository, tenant_id)
    if not deleted_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}
