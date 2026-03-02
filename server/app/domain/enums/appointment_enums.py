from enum import Enum


class AppointmentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class AppointmentFilterType(str, Enum):
    daily = "daily"
    weekly = "weekly"
