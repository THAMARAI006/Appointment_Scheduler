from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class UserEntity:
    id: Optional[int]
    tenant_id: int
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
