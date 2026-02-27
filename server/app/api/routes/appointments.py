from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from typing import List

from app.application.dto.appointment_dto import (
    AppointmentCalendarItemDTO,
    AppointmentCreateDTO,
    AppointmentKPIDTO,
    AppointmentResponseDTO,
    AppointmentStatusUpdateDTO,
    AppointmentUpdateDTO,
)
from app.application.services.appointment_application_service import (
    create_appointment_use_case,
    delete_appointment_use_case,
    get_appointment_kpis_use_case,
    get_appointment_use_case,
    get_calendar_appointments_use_case,
    list_appointments_use_case,
    update_appointment_status_use_case,
    update_appointment_use_case,
)
from app.core.database import get_db
from app.domain.enums import AppointmentFilterType
from app.infrastructure.repositories import AppointmentRepositoryImplementation

router = APIRouter()


# ✅ POST – Booking
@router.post("/", response_model=AppointmentResponseDTO)
def create(
    appointment: AppointmentCreateDTO,
    db: Session = Depends(get_db)
):
    repository = AppointmentRepositoryImplementation(db)
    return create_appointment_use_case(repository, appointment)


# ✅ GET – Tracking
@router.get("/", response_model=List[AppointmentResponseDTO])
def list_appointments(
    db: Session = Depends(get_db)
):
    repository = AppointmentRepositoryImplementation(db)
    return list_appointments_use_case(repository)


@router.get("/kpis", response_model=AppointmentKPIDTO)
def appointment_kpis(
    filter_type: AppointmentFilterType = Query(default="daily", alias="filter"),
    target_date: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    repository = AppointmentRepositoryImplementation(db)
    return get_appointment_kpis_use_case(repository, filter_type=filter_type, reference_date=target_date)


@router.get("/calendar", response_model=List[AppointmentCalendarItemDTO])
def appointment_calendar(
    filter_type: AppointmentFilterType = Query(default="daily", alias="filter"),
    target_date: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    repository = AppointmentRepositoryImplementation(db)
    return get_calendar_appointments_use_case(repository, filter_type=filter_type, reference_date=target_date)


@router.get("/{appointment_id}", response_model=AppointmentResponseDTO)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    repository = AppointmentRepositoryImplementation(db)
    appointment = get_appointment_use_case(repository, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponseDTO)
def update(
    appointment_id: int,
    appointment: AppointmentUpdateDTO,
    db: Session = Depends(get_db)
):
    repository = AppointmentRepositoryImplementation(db)
    updated_appointment = update_appointment_use_case(repository, appointment_id, appointment)
    if not updated_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated_appointment


@router.delete("/{appointment_id}")
def delete(appointment_id: int, db: Session = Depends(get_db)):
    repository = AppointmentRepositoryImplementation(db)
    deleted_appointment = delete_appointment_use_case(repository, appointment_id)
    if not deleted_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}


# ✅ PATCH – Scheduling
@router.patch("/{appointment_id}/status", response_model=AppointmentResponseDTO)
def change_status(
    appointment_id: int,
    status_data: AppointmentStatusUpdateDTO = Body(...),
    db: Session = Depends(get_db)
):
    repository = AppointmentRepositoryImplementation(db)
    appointment = update_appointment_status_use_case(
        repository,
        appointment_id,
        status_data.status
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return appointment