from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class TenantEntity:
    id: Optional[int]
    name: str
    code: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
