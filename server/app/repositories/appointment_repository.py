from datetime import date, datetime, time, timedelta
from sqlalchemy.orm import Session

from app.domain.enums import AppointmentFilterType, AppointmentStatus
from app.models.appointment import Appointment
from app.models.consultant import Consultant
from app.models.user import User
from app.repositories.base_repository import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, db: Session):
        super().__init__(db, Appointment)

    def get_all_ordered(self) -> list[Appointment]:
        return self.db.query(Appointment).order_by(Appointment.created_at.desc()).all()

    def update_status(self, appointment_id: int, status: AppointmentStatus | str) -> Appointment | None:
        appointment = self.get_by_id(appointment_id)
        if not appointment:
            return None
        appointment.status = status
        return self.save(appointment)

    def get_kpis(self, filter_type: AppointmentFilterType | str, reference_date: date | None = None) -> dict:
        start_at, end_at = self._get_range(filter_type, reference_date)

        scoped_query = self.db.query(Appointment).filter(
            Appointment.appointment_time >= start_at,
            Appointment.appointment_time < end_at,
        )

        total = scoped_query.count()
        pending = scoped_query.filter(Appointment.status == AppointmentStatus.pending).count()
        confirmed = scoped_query.filter(Appointment.status == AppointmentStatus.confirmed).count()
        completed = scoped_query.filter(Appointment.status == AppointmentStatus.completed).count()

        today = (reference_date or datetime.utcnow().date())
        daily_start = datetime.combine(today, time.min)
        daily_end = daily_start + timedelta(days=1)
        daily_upcoming = self.db.query(Appointment).filter(
            Appointment.appointment_time >= max(datetime.utcnow(), daily_start),
            Appointment.appointment_time < daily_end,
        ).count()

        return {
            "total": total,
            "pending": pending,
            "confirmed": confirmed,
            "completed": completed,
            "daily_upcoming_appointments": daily_upcoming,
        }

    def get_calendar_items(self, filter_type: AppointmentFilterType | str, reference_date: date | None = None) -> list[dict]:
        start_at, end_at = self._get_range(filter_type, reference_date)

        rows = (
            self.db.query(
                Appointment.id,
                Appointment.customer_name,
                User.full_name,
                Consultant.display_name,
                Appointment.appointment_time,
                Appointment.end_time,
                Appointment.status,
            )
            .outerjoin(User, User.id == Appointment.user_id)
            .join(Consultant, Consultant.id == Appointment.consultant_id)
            .filter(
                Appointment.appointment_time >= start_at,
                Appointment.appointment_time < end_at,
            )
            .order_by(Appointment.appointment_time.asc())
            .all()
        )

        result = []
        for row in rows:
            start_time = row.appointment_time
            applicant_name = row.full_name or row.customer_name
            result.append(
                {
                    "id": row.id,
                    "applicant_name": applicant_name,
                    "consultant_name": row.display_name,
                    "start_time": start_time,
                    "end_time": row.end_time,
                    "status": row.status,
                    "date": start_time.date(),
                }
            )

        return result

    def _get_range(self, filter_type: AppointmentFilterType | str, reference_date: date | None) -> tuple[datetime, datetime]:
        anchor_date = reference_date or datetime.utcnow().date()

        if filter_type == AppointmentFilterType.weekly:
            week_start = anchor_date - timedelta(days=anchor_date.weekday())
            start_at = datetime.combine(week_start, time.min)
            end_at = start_at + timedelta(days=7)
            return start_at, end_at

        start_at = datetime.combine(anchor_date, time.min)
        end_at = start_at + timedelta(days=1)
        return start_at, end_at
