from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ServiceCreate(BaseModel):
    tenant_id: int
    name: str
    duration_minutes: int
    price: Optional[Decimal] = None
    status: str = "active"


class ServiceResponse(ServiceCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
