from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class ConsultantEntity:
    id: Optional[int]
    tenant_id: int
    display_name: str
    specialization: Optional[str]
    user_id: Optional[int]
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
