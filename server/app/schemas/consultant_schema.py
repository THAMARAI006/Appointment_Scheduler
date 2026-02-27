from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConsultantCreate(BaseModel):
    tenant_id: int
    display_name: str
    specialization: Optional[str] = None
    user_id: Optional[int] = None
    status: str = "active"


class ConsultantResponse(ConsultantCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
