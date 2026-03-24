"""
Setup script to initialize consultant availability slots.
Run this after adding consultants to set up their working hours.

Example: Monday-Friday, 9 AM to 5 PM with 30-min slots.
"""

from datetime import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import DATABASE_URL
from app.models.consultant import Consultant
from app.models.consultant_availability import ConsultantAvailability


def setup_consultant_availability():
    """Initialize default availability for all active consultants."""
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Get all active consultants
        consultants = db.query(Consultant).filter(Consultant.status == "active").all()
        
        if not consultants:
            print("No active consultants found. Add consultants first.")
            return
        
        # Default working hours: Mon-Fri 9 AM - 5 PM, Sat-Sun off
        working_days = {
            0: ("Monday", True, time(9, 0), time(17, 0)),
            1: ("Tuesday", True, time(9, 0), time(17, 0)),
            2: ("Wednesday", True, time(9, 0), time(17, 0)),
            3: ("Thursday", True, time(9, 0), time(17, 0)),
            4: ("Friday", True, time(9, 0), time(17, 0)),
            5: ("Saturday", False, time(0, 0), time(0, 0)),
            6: ("Sunday", False, time(0, 0), time(0, 0)),
        }
        
        slots_created = 0
        
        for consultant in consultants:
            print(f"\nConfiguring availability for: {consultant.display_name}")
            
            for day_num, (day_name, is_available, start_hour, end_hour) in working_days.items():
                # Check if this availability already exists
                existing = (
                    db.query(ConsultantAvailability)
                    .filter(
                        (ConsultantAvailability.consultant_id == consultant.id)
                        & (ConsultantAvailability.day_of_week == day_num)
                    )
                    .first()
                )
                
                if existing:
                    print(f"  - {day_name}: already configured")
                    continue
                
                # Create new availability
                availability = ConsultantAvailability(
                    consultant_id=consultant.id,
                    day_of_week=day_num,
                    start_time=start_hour if is_available else time(0, 0),
                    end_time=end_hour if is_available else time(0, 0),
                    slot_duration_minutes=30,
                    is_available=is_available,
                )
                db.add(availability)
                
                if is_available:
                    print(f"  - {day_name}: {start_hour.strftime('%H:%M')} - {end_hour.strftime('%H:%M')}")
                else:
                    print(f"  - {day_name}: OFF")
                
                slots_created += 1
        
        db.commit()
        print(f"\nSetup complete. Created {slots_created} availability slots.")
        print("\nNext steps:")
        print("1. Update working hours as needed in the database")
        print("2. Add holidays or days off in consultant_availability")
        print("3. Verify booking flow with availability checks")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    setup_consultant_availability()
