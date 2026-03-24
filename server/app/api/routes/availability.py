"""
API endpoints for managing consultant availability.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.consultant_availability import ConsultantAvailability
from app.application.dto.consultant_availability_dto import (
    ConsultantAvailabilityDTO,
    ConsultantAvailabilityResponseDTO,
)

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/consultant/{consultant_id}", response_model=list[ConsultantAvailabilityResponseDTO])
async def get_consultant_availability(
    consultant_id: int,
    db: Session = Depends(get_db),
):
    """Get all availability slots for a consultant."""
    slots = (
        db.query(ConsultantAvailability)
        .filter(ConsultantAvailability.consultant_id == consultant_id)
        .order_by(ConsultantAvailability.day_of_week)
        .all()
    )
    
    if not slots:
        raise HTTPException(
            status_code=404,
            detail="No availability found for this consultant. Run setup_consultant_availability.py first.",
        )
    
    return slots


@router.post("/consultant/{consultant_id}/day/{day_of_week}", response_model=ConsultantAvailabilityResponseDTO)
async def create_or_update_availability(
    consultant_id: int,
    day_of_week: int,
    payload: ConsultantAvailabilityDTO,
    db: Session = Depends(get_db),
):
    """Create or update availability for a specific day."""
    
    if not 0 <= day_of_week <= 6:
        raise HTTPException(status_code=400, detail="day_of_week must be 0-6 (Monday-Sunday)")
    
    existing = (
        db.query(ConsultantAvailability)
        .filter(
            (ConsultantAvailability.consultant_id == consultant_id)
            & (ConsultantAvailability.day_of_week == day_of_week)
        )
        .first()
    )
    
    if existing:
        # Update
        existing.start_time = payload.start_time
        existing.end_time = payload.end_time
        existing.slot_duration_minutes = payload.slot_duration_minutes
        existing.is_available = payload.is_available
        db.commit()
        return existing
    else:
        # Create
        new_availability = ConsultantAvailability(
            consultant_id=consultant_id,
            day_of_week=day_of_week,
            start_time=payload.start_time,
            end_time=payload.end_time,
            slot_duration_minutes=payload.slot_duration_minutes,
            is_available=payload.is_available,
        )
        db.add(new_availability)
        db.commit()
        db.refresh(new_availability)
        return new_availability


@router.delete("/consultant/{consultant_id}/day/{day_of_week}")
async def delete_availability(
    consultant_id: int,
    day_of_week: int,
    db: Session = Depends(get_db),
):
    """Delete availability for a specific day."""
    
    slot = (
        db.query(ConsultantAvailability)
        .filter(
            (ConsultantAvailability.consultant_id == consultant_id)
            & (ConsultantAvailability.day_of_week == day_of_week)
        )
        .first()
    )
    
    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    db.delete(slot)
    db.commit()
    
    return {"message": "Deleted successfully"}
