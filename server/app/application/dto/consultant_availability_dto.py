from pydantic import BaseModel
from datetime import time


class ConsultantAvailabilityDTO(BaseModel):
    """DTO for creating/updating consultant availability."""
    consultant_id: int
    day_of_week: int  # 0-6 (Monday to Sunday)
    start_time: time
    end_time: time
    slot_duration_minutes: int = 30
    is_available: bool = True

    class Config:
        from_attributes = True


class ConsultantAvailabilityResponseDTO(BaseModel):
    """DTO for returning consultant availability."""
    id: int
    consultant_id: int
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration_minutes: int
    is_available: bool

    class Config:
        from_attributes = True
