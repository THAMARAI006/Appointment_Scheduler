from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class ServiceEntity:
    id: Optional[int]
    tenant_id: int
    name: str
    duration_minutes: int
    price: Optional[Decimal]
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
