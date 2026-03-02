from fastapi import APIRouter, Request, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.application.dto.appointment_dto import AppointmentCreateDTO
from app.application.services.appointment_application_service import create_appointment_use_case
from app.core.database import get_db
from app.infrastructure.repositories import AppointmentRepositoryImplementation

router = APIRouter()

VERIFY_TOKEN = "my_verify_token"  # same token in Meta dashboard
DEFAULT_TENANT_ID = os.getenv("DEFAULT_TENANT_ID")
DEFAULT_CONSULTANT_ID = os.getenv("DEFAULT_CONSULTANT_ID")
DEFAULT_SERVICE_ID = os.getenv("DEFAULT_SERVICE_ID")


def _parse_int(value: str):
    try:
        return int(value) if value is not None else None
    except ValueError:
        return None


# 🔹 1️⃣ Webhook verification (GET)
@router.get("/webhook", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str = None,
    hub_challenge: str = None,
    hub_verify_token: str = None
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return hub_challenge
    return "Verification failed"


# 🔹 2️⃣ Receive WhatsApp messages (POST)
@router.post("/webhook")
async def receive_whatsapp_message(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()
    print("Incoming WhatsApp Data:", data)

    try:
        message = data["entry"][0]["changes"][0]["value"]["messages"][0]
        phone_number = message["from"]
        text = message["text"]["body"]

        tenant_id = _parse_int(DEFAULT_TENANT_ID)
        consultant_id = _parse_int(DEFAULT_CONSULTANT_ID)
        service_id = _parse_int(DEFAULT_SERVICE_ID)

        if not tenant_id or not consultant_id or not service_id:
            print("Skipping appointment creation: default IDs not configured")
            return {"status": "received"}

        # 🔹 TEMP: auto-create appointment
        appointment = AppointmentCreateDTO(
            tenant_id=tenant_id,
            consultant_id=consultant_id,
            service_id=service_id,
            customer_name="WhatsApp User",
            phone_number=phone_number,
            appointment_time=datetime.utcnow()
        )

        repository = AppointmentRepositoryImplementation(db)
        create_appointment_use_case(repository, appointment)

    except Exception as e:
        print("Error processing WhatsApp message:", e)

    return {"status": "received"}