from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConsultantCreateDTO(BaseModel):
    tenant_id: int
    display_name: str
    specialization: Optional[str] = None
    user_id: Optional[int] = None
    status: str = "active"


class ConsultantResponseDTO(ConsultantCreateDTO):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
