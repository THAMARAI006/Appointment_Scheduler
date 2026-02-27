from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TenantCreateDTO(BaseModel):
    name: str
    code: str
    status: str = "active"


class TenantResponseDTO(TenantCreateDTO):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
