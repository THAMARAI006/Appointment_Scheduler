from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class UserRegisterDTO(BaseModel):
    tenant_id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    status: str = "active"


class UserLoginDTO(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None

    @model_validator(mode="after")
    def validate_identifier(self):
        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided")
        return self


class UserProfileUpdateDTO(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class UserResponseDTO(BaseModel):
    id: int
    tenant_id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
