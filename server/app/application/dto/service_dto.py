from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ServiceCreateDTO(BaseModel):
    tenant_id: int
    name: str
    duration_minutes: int
    price: Optional[Decimal] = None
    status: str = "active"


class ServiceResponseDTO(ServiceCreateDTO):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
