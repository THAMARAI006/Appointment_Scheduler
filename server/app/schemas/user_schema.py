from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    tenant_id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    status: str = "active"


class UserResponse(UserCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
