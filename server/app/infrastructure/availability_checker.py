"""
Consultant availability checking utilities.
Handles checking if a consultant is available and finding alternative slots.
"""

from datetime import datetime, timedelta, time as time_type
from sqlalchemy.orm import Session
from app.models.consultant import Consultant
from app.models.appointment import Appointment
from app.models.consultant_availability import ConsultantAvailability


def get_consultant_availability_for_day(db: Session, consultant_id: int, date: datetime) -> ConsultantAvailability | None:
    """
    Get the availability record for a consultant on a specific day.
    Returns the ConsultantAvailability object or None if no hours set for that day.
    """
    day_of_week = date.weekday()  # 0=Monday, 6=Sunday
    
    availability = (
        db.query(ConsultantAvailability)
        .filter(
            (ConsultantAvailability.consultant_id == consultant_id)
            & (ConsultantAvailability.day_of_week == day_of_week)
        )
        .first()
    )
    return availability


def is_consultant_available_at_time(
    db: Session,
    consultant_id: int,
    appointment_datetime: datetime,
    duration_minutes: int = 30
) -> dict[str, bool | str]:
    """
    Check if a consultant is available at a specific date/time.
    
    Returns:
        {
            "available": True/False,
            "reason": "Available" / "Not within working hours" / "Double-booked" / etc.
        }
    """
    
    # 1. Check if consultant exists and is active
    consultant = db.query(Consultant).filter(Consultant.id == consultant_id).first()
    if not consultant or consultant.status != "active":
        return {"available": False, "reason": "Consultant not found or inactive"}
    
    # 2. Check if day has working hours set
    availability = get_consultant_availability_for_day(db, consultant_id, appointment_datetime)
    if not availability or not availability.is_available:
        return {"available": False, "reason": f"Not available on {appointment_datetime.strftime('%A')}"}
    
    # 3. Check if time is within working hours
    appointment_time = appointment_datetime.time()
    if not (availability.start_time <= appointment_time < availability.end_time):
        return {
            "available": False,
            "reason": f"Outside working hours ({availability.start_time.strftime('%H:%M')} - {availability.end_time.strftime('%H:%M')})"
        }
    
    # 4. Check for conflicts with existing appointments
    appointment_end = appointment_datetime + timedelta(minutes=duration_minutes)
    
    conflicts = (
        db.query(Appointment)
        .filter(
            (Appointment.consultant_id == consultant_id)
            & (Appointment.appointment_time < appointment_end)
            & (Appointment.end_time.isnot(None))
            & (Appointment.end_time > appointment_datetime)
            & (Appointment.status.notin_(["cancelled", "completed"]))  # Ignore cancelled/completed
        )
        .first()
    )
    
    if conflicts:
        return {"available": False, "reason": "Time slot already booked"}
    
    return {"available": True, "reason": "Available"}


def find_available_slots(
    db: Session,
    consultant_id: int,
    start_date: datetime,
    num_slots: int = 3,
    duration_minutes: int = 30,
) -> list[datetime]:
    """
    Find the next N available appointment slots for a consultant.
    Searches forward from start_date across multiple days if needed.
    
    Returns: List of datetime objects representing available slots
    """
    available_slots = []
    current_date = start_date
    max_search_days = 30  # Don't search more than 30 days ahead
    
    while len(available_slots) < num_slots and (current_date - start_date).days < max_search_days:
        # Get availability for this day
        availability = get_consultant_availability_for_day(db, consultant_id, current_date)
        
        if availability and availability.is_available:
            # Generate time slots for this day
            current_time = datetime.combine(current_date.date(), availability.start_time)
            end_of_day = datetime.combine(current_date.date(), availability.end_time)
            
            while current_time < end_of_day and len(available_slots) < num_slots:
                # Check if this slot is available
                check = is_consultant_available_at_time(
                    db, consultant_id, current_time, duration_minutes
                )
                if check["available"]:
                    available_slots.append(current_time)
                
                current_time += timedelta(minutes=availability.slot_duration_minutes)
        
        # Move to next day
        current_date += timedelta(days=1)
    
    return available_slots


def format_available_slots_for_whatsapp(slots: list[datetime]) -> str:
    """
    Format available slots as a readable WhatsApp message.
    
    Example:
    "Available slots:
    1️⃣ Mar 24, 2 PM
    2️⃣ Mar 24, 3 PM
    3️⃣ Mar 25, 10 AM"
    """
    if not slots:
        return "Sorry, no available slots in the next 30 days."
    
    lines = ["Available slots:\n"]
    for i, slot in enumerate(slots, 1):
        formatted = slot.strftime("%b %d, %I:%M %p")
        lines.append(f"{i}️⃣ {formatted}")
    
    return "\n".join(lines)
