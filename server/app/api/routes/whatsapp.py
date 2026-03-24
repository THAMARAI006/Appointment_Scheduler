from fastapi import APIRouter, Request, Depends, Query, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Any
import os
import re
import requests as http_client

from pydantic import BaseModel, Field
from dateutil import parser as dateutil_parser
from dateutil.parser._parser import ParserError

from app.application.dto.appointment_dto import AppointmentCreateDTO
from app.application.dto.user_dto import UserRegisterDTO, UserProfileUpdateDTO
from app.application.services.appointment_application_service import create_appointment_use_case
from app.application.services.user_application_service import (
    login_user_use_case,
    register_user_use_case,
    update_user_profile_use_case,
)
from app.core.database import get_db
from app.infrastructure.repositories import AppointmentRepositoryImplementation
from app.infrastructure.repositories import UserRepositoryImplementation
from app.infrastructure.availability_checker import (
    is_consultant_available_at_time,
    find_available_slots,
    format_available_slots_for_whatsapp,
)
from app.domain.enums import AppointmentStatus
from app.models.appointment import Appointment
from app.models.consultant import Consultant
from app.models.service import Service

router = APIRouter()

# In-memory intake state for multi-turn CRM flow.
# Key: phone number, Value: collected fields for current booking session.
INTAKE_STATE: dict[str, dict[str, Any]] = {}

VERIFY_TOKEN          = "my_verify_token"        # same token in Meta dashboard
DEFAULT_TENANT_ID     = os.getenv("DEFAULT_TENANT_ID")
DEFAULT_CONSULTANT_ID = os.getenv("DEFAULT_CONSULTANT_ID")
DEFAULT_SERVICE_ID    = os.getenv("DEFAULT_SERVICE_ID")

# WhatsApp Cloud API credentials (set in .env)
WHATSAPP_TOKEN          = os.getenv("WHATSAPP_TOKEN")           # Bearer token from Meta
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID") # Phone Number ID from Meta dashboard

# If true, backend sends WhatsApp replies directly from /n8n/book.
# Keep this false when n8n already has a dedicated "Send message" node.
SEND_WHATSAPP_REPLY_FROM_API = os.getenv("SEND_WHATSAPP_REPLY_FROM_API", "false").lower() == "true"
WHATSAPP_INSTANT_CONFIRMATION = os.getenv("WHATSAPP_INSTANT_CONFIRMATION", "true").lower() == "true"


def _parse_int(value: str):
    try:
        return int(value) if value is not None else None
    except ValueError:
        return None


def _normalize_phone(value: str | None) -> str:
    """Normalize phone to digits-only format for stable intake/session keys."""
    if not value:
        return ""
    return re.sub(r"\D", "", value)


# ── n8n helper utilities ──────────────────────────────────────────────────────

def _extract_datetime(text: str, default_datetime: datetime | None = None) -> datetime | None:
    """Fuzzy-parse a datetime from arbitrary text; returns None on failure.

    Handles ranges like "10am-11am" by using the first time token.
    When only time is provided, default_datetime allows preserving the previously
    captured appointment date.
    """
    if not text:
        return None

    # Normalize common range inputs: "10am-11am" -> "10am"
    normalized_text = re.sub(
        r"(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b)\s*[-–]\s*(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b)",
        r"\1",
        text,
        flags=re.IGNORECASE,
    )
    try:
        if default_datetime is not None:
            return dateutil_parser.parse(normalized_text, fuzzy=True, default=default_datetime)
        return dateutil_parser.parse(normalized_text, fuzzy=True)
    except (ParserError, OverflowError, ValueError):
        return None


def _find_consultant(db: Session, text: str) -> int | None:
    """Return the ID of the first active consultant whose display_name appears in text."""
    consultants = db.query(Consultant).filter(Consultant.status == "active").all()
    lower = text.lower()
    for c in consultants:
        if c.display_name and c.display_name.lower() in lower:
            return c.id
    return None


def _find_consultants_by_specialization(db: Session, text: str) -> list[Consultant]:
    """Return active consultants whose specialization appears in the user text."""
    consultants = db.query(Consultant).filter(Consultant.status == "active").all()
    lower = text.lower()
    matches: list[Consultant] = []
    for consultant in consultants:
        specialization = (consultant.specialization or "").strip().lower()
        if specialization and specialization in lower:
            matches.append(consultant)
    return matches


def _find_service(db: Session, text: str) -> int | None:
    """Return the ID of the first active service whose name appears in text."""
    services = db.query(Service).filter(Service.status == "active").all()
    lower = text.lower()
    for s in services:
        if s.name and s.name.lower() in lower:
            return s.id
    return None


def _list_active_consultants(db: Session) -> list[str]:
    return [item.display_name for item in db.query(Consultant).filter(Consultant.status == "active").all() if item.display_name]


def _list_active_services(db: Session) -> list[str]:
    return [item.name for item in db.query(Service).filter(Service.status == "active").all() if item.name]


def _extract_customer_name(text: str) -> str:
    """Extract customer name from message text using multiple strategies."""
    # Explicit patterns first
    explicit_patterns = [
        r"myself\s+([A-Za-z]+(?: [A-Za-z]+){0,2})",
        r"my name is ([A-Za-z]+(?: [A-Za-z]+){0,3})",
        r"i(?:'m| am) ([A-Za-z]+(?: [A-Za-z]+){0,2})",
        r"this is ([A-Za-z]+(?: [A-Za-z]+){0,2})",
        r"name[:\s]+([A-Za-z]+(?: [A-Za-z]+){0,3})",
        r"call me ([A-Za-z]+(?: [A-Za-z]+){0,2})",
    ]
    for pattern in explicit_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            # Handle corrections like "myself thara not priya raman".
            candidate = re.split(r"\bnot\b", candidate, maxsplit=1, flags=re.IGNORECASE)[0].strip()
            # reject obvious non-names
            if candidate.lower() not in ("a", "the", "whatsapp", "customer", "user", "doctor"):
                return candidate.title()

    # Fallback: first two consecutive capitalised words that look like a name
    m = re.search(r"\b([A-Z][a-z]{1,20}(?:\s[A-Z][a-z]{1,20})+)\b", text)
    if m:
        candidate = m.group(1).strip()
        skip = {"Please", "Welcome", "Thanks", "Hello", "Hi", "Dear", "Good", "Sorry", "WhatsApp", "Available", "Options"}
        first_word = candidate.split()[0]
        if first_word not in skip:
            return candidate

    return ""


def _extract_customer_address(text: str) -> str:
    """Best-effort extraction of customer address from natural language text."""
    patterns = [
        r"address(?: is)?\s*[:\-]?\s*(.+)",
        r"i live at\s+(.+)",
        r"my location(?: is)?\s*[:\-]?\s*(.+)",
        r"(?:i am|i'm|im)\s+from\s+(.+)",
        r"^\s*from\s+(.+)$",
        r"^\s*(?:no\.?\s*)?\d+[\w\s,./-]{5,}$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # Some patterns capture the full text; others capture group(1).
            extracted = match.group(1) if match.lastindex else match.group(0)
            candidate = extracted.strip(" .")
            if candidate:
                return candidate[:200]

    # Heuristic: standalone address-like line with a number and comma.
    compact = text.strip()
    if (
        compact
        and len(compact) <= 200
        and re.search(r"\d", compact)
        and ("," in compact or re.search(r"nagar|street|road|lane|avenue|chennai", compact, re.IGNORECASE))
    ):
        return compact.strip(" .")[:200]
    return ""


def _extract_enquiry_text(text: str) -> str:
    """Extract the core reason/enquiry for the appointment from free text."""
    patterns = [
        r"reason(?:\s+is|\s*:)?\s*(.+)",
        r"(?:for|about|regarding|because of)\s+([^.!?\n]+)",
        r"(?:issue|problem|symptom)(?: is|:)?\s*([^.!?\n]+)",
        r"(?:i\s+(?:have|had|am having|feel|felt)\s+)([^.!?\n]+)",
        r"(?:need to\s+(?:visit|consult|check|see)\s+)([^.!?\n]+)",
        r"(?:i\s+)?need\s+(?:a\s+)?([^.!?\n]*(?:consultation|check\s*up|checkup|follow[\s-]?up|visit|appointment)[^.!?\n]*)",
        r"^\s*(general\s+consultation|consultation|check\s*up|checkup|follow[\s-]?up)\s*$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip(" .")[:200]
    return ""


def _is_emergency_message(text: str) -> bool:
    lower = text.lower()

    # De-escalation phrases should suppress emergency triage replies.
    deescalation_phrases = [
        "feeling good now",
        "feeling better",
        "better now",
        "now i'm feeling good",
        "now i am feeling good",
        "for check up",
        "for checkup",
        "follow up",
        "follow-up",
        "not urgent",
        "not emergency",
    ]
    if any(phrase in lower for phrase in deescalation_phrases):
        return False

    emergency_keywords = [
        "emergency",
        "urgent",
        "severe pain",
        "bleeding",
        "chest pain",
        "accident",
        "can't breathe",
        "cant breathe",
    ]
    return any(keyword in lower for keyword in emergency_keywords)


def _is_status_query(text: str) -> bool:
    status_keywords = ["status", "pending", "completed", "confirmed", "my appointment"]
    lower = text.lower()
    if _is_cancel_intent(lower) or _is_reschedule_intent(lower):
        return False
    return any(keyword in lower for keyword in status_keywords)


def _is_booking_intent(text: str) -> bool:
    booking_keywords = [
        "book",
        "appointment",
        "schedule",
        "consultation",
        "visit",
        "checkup",
        "check up",
        "follow up",
        "follow-up",
    ]
    lower = text.lower()
    return any(keyword in lower for keyword in booking_keywords)


def _is_reschedule_intent(text: str) -> bool:
    reschedule_keywords = [
        "reschedule",
        "change appointment",
        "change my appointment",
        "move appointment",
        "postpone appointment",
        "shift appointment",
    ]
    lower = text.lower()
    return any(keyword in lower for keyword in reschedule_keywords)


def _is_cancel_intent(text: str) -> bool:
    cancel_keywords = [
        "cancel appointment",
        "cancel this appointment",
        "cancel my appointment",
        "cancel booking",
        "cancel",
    ]
    lower = text.lower()
    return any(keyword in lower for keyword in cancel_keywords)


def _extract_reference_id(text: str) -> int | None:
    match = re.search(r"(?:ref\s*#?|reference\s*#?)\s*(\d+)", text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None


def _get_service_duration_minutes(db: Session, service_id: int | None) -> int:
    if not service_id:
        return 30
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service or not getattr(service, "duration_minutes", None):
        return 30
    return int(service.duration_minutes)


def _extract_end_datetime_from_range(text: str, start_dt: datetime) -> datetime | None:
    range_match = re.search(
        r"(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))",
        text,
        flags=re.IGNORECASE,
    )
    if not range_match:
        return None

    end_part = range_match.group(2)
    end_dt = _extract_datetime(end_part, default_datetime=start_dt)
    if not end_dt:
        return None

    # Keep logical ordering for same-day ranges.
    if end_dt <= start_dt:
        end_dt = end_dt + timedelta(hours=12)
    if end_dt <= start_dt:
        end_dt = end_dt + timedelta(days=1)

    return end_dt


def _build_end_datetime(db: Session, service_id: int | None, start_dt: datetime, text_for_range: str) -> datetime:
    parsed_end = _extract_end_datetime_from_range(text_for_range, start_dt)
    if parsed_end:
        return parsed_end

    duration_minutes = _get_service_duration_minutes(db, service_id)
    return start_dt + timedelta(minutes=duration_minutes)


def _get_latest_appointment(db: Session, user_id: int):
    return (
        db.query(Appointment)
        .filter(Appointment.user_id == user_id)
        .order_by(Appointment.appointment_time.desc())
        .first()
    )


def _get_latest_appointment_for_contact(db: Session, user_id: int | None, phone_number: str | None):
    if user_id:
        appointment = _get_latest_appointment(db, user_id)
        if appointment:
            return appointment

    if phone_number:
        normalized_phone = _normalize_phone(phone_number)
        candidates = (
            db.query(Appointment)
            .order_by(Appointment.appointment_time.desc())
            .limit(100)
            .all()
        )
        for appointment in candidates:
            if _normalize_phone(str(getattr(appointment, "phone_number", ""))) == normalized_phone:
                return appointment

    return None


def _get_consultant_name(db: Session, consultant_id: int | None) -> str:
    if not consultant_id:
        return "your consultant"
    consultant = db.query(Consultant).filter(Consultant.id == consultant_id).first()
    if consultant and consultant.display_name:
        return consultant.display_name
    return "your consultant"


def _get_or_create_customer(db: Session, phone: str, full_name: str, tenant_id: int):
    """
    Look up user by phone number.
    - If found  → return existing user (existing customer)
    - If not    → register as new customer and return
    Returns (user_id, is_new: bool, full_name: str)
    """
    user_repo = UserRepositoryImplementation(db)
    from app.application.dto.user_dto import UserLoginDTO
    existing = login_user_use_case(user_repo, UserLoginDTO(phone=phone))
    if existing:
        return existing.id, False, existing.full_name

    new_dto = UserRegisterDTO(
        tenant_id=tenant_id,
        full_name=full_name,
        phone=phone,
        role="customer",
        status="active",
    )
    created = register_user_use_case(user_repo, new_dto)
    return created.id, True, created.full_name


def _send_whatsapp_reply(to_phone: str, message: str) -> bool:
    """
    Send a WhatsApp message directly via the Meta Cloud API.
    Requires WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env
    """
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        print("⚠️  WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — skipping reply send.")
        return False

    url = f"https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": message},
    }
    try:
        resp = http_client.post(url, json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        return True
    except Exception as e:
        print(f"⚠️  Failed to send WhatsApp reply: {e}")
        return False


def _get_intake_state(phone: str) -> dict[str, Any]:
    if phone not in INTAKE_STATE:
        INTAKE_STATE[phone] = {
            "active": False,
            "name": "",
            "address": "",
            "enquiry": "",
            "emergency_alerted": False,
            "consultant_id": None,
            "service_id": None,
            "appointment_time": None,
        }
    return INTAKE_STATE[phone]


def _reset_intake_state(phone: str) -> None:
    if phone in INTAKE_STATE:
        INTAKE_STATE[phone] = {
            "active": False,
            "name": "",
            "address": "",
            "enquiry": "",
            "emergency_alerted": False,
            "consultant_id": None,
            "service_id": None,
            "appointment_time": None,
        }


# ── n8n forward payload schema ────────────────────────────────────────────────

class N8NForwardPayload(BaseModel):
    """Accepts both the original and current n8n payload shapes."""
    from_number: str | None = Field(default=None, alias="from")   # "from" is reserved keyword
    message: str | None = None
    ai_analysis: str | None = None
    output: dict[str, Any] | str | None = None
    properties: dict[str, Any] | None = None
    phone: str | None = None
    email: str | None = None
    service: str | None = None
    date: str | None = None
    time: str | list[Any] | None = None
    notes: str | None = None

    model_config = {"populate_by_name": True}


# 🔹 1️⃣ Webhook verification (GET)
@router.get("/webhook", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_challenge: str | None = Query(default=None, alias="hub.challenge"),
    hub_verify_token: str | None = Query(default=None, alias="hub.verify_token")
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
        value = data["entry"][0]["changes"][0]["value"]
        incoming_messages = value.get("messages") or []

        # Delivery receipts and status callbacks do not include customer text.
        if not incoming_messages:
            return {"status": "received", "event": "status_update"}

        message = incoming_messages[0]
        phone_number = message.get("from")
        text = (message.get("text") or {}).get("body", "")

        if not phone_number or not text:
            return {"status": "received", "event": "unsupported_message"}

        result = await n8n_book_appointment(
            N8NForwardPayload(from_number=phone_number, message=text),
            db,
            send_direct_reply=True,
        )
        return {"status": "received", "booking_flow_status": result.get("status")}

    except Exception as e:
        print("Error processing WhatsApp message:", e)

    return {"status": "received"}


# 🔹 3️⃣  n8n → book appointment  (target for "Forward to External System" node)
@router.post("/n8n/book")
async def n8n_book_appointment(
    payload: N8NForwardPayload,
    db: Session = Depends(get_db),
    send_direct_reply: bool = SEND_WHATSAPP_REPLY_FROM_API,
):
    """
    Receives the forwarded payload from the n8n 'Forward to External System' node.

    Full flow:
      1. Check if the customer already exists in the DB by phone number.
      2. If new → auto-register them as a customer.
      3. Parse appointment date/time from the message text.
      4. Resolve consultant & service (by name match or .env defaults).
      5. Save the appointment to the database.
      6. Send a WhatsApp confirmation reply directly via Meta Cloud API.
      7. Return JSON for n8n (booking reference, status, reply text).

    Set the n8n 'Forward to External System' node URL to:
        http://<your-host>/whatsapp/n8n/book
    """
    properties = payload.properties or {}
    phone_number = payload.from_number or payload.phone or properties.get("phone")
    phone_number = _normalize_phone(str(phone_number) if phone_number is not None else None)
    phone_missing = not phone_number
    if phone_missing:
        phone_number = f"unknown-{int(datetime.utcnow().timestamp())}"

    message_text = payload.message or ""
    ai_analysis_text = payload.ai_analysis or ""
    output_text = payload.output if isinstance(payload.output, str) else ""
    output_dict = payload.output if isinstance(payload.output, dict) else {}
    output_properties = output_dict.get("properties") if isinstance(output_dict.get("properties"), dict) else {}
    # Never trust assistant-generated reply text as user-provided booking data.
    output_hint_text = ""

    date_text = payload.date or properties.get("date") or ""
    time_value = payload.time if payload.time is not None else properties.get("time")
    if isinstance(time_value, list):
        time_text = " ".join(str(item) for item in time_value if item)
    else:
        time_text = str(time_value) if time_value else ""

    service_text = payload.service or properties.get("service") or ""
    notes_text = payload.notes or properties.get("notes") or ""
    provided_name = str(properties.get("name") or "").strip()
    provided_address = str(
        properties.get("address") or properties.get("location") or properties.get("residence") or ""
    ).strip()
    provided_enquiry = str(
        properties.get("enquiry")
        or properties.get("reason")
        or properties.get("issue")
        or ""
    ).strip()
    combined_text = " ".join(
        part for part in [
            message_text,
            ai_analysis_text,
            output_text,
            output_hint_text,
            date_text,
            time_text,
            service_text,
            notes_text,
        ] if part
    )

    # Determine intent from customer text only, not AI-generated text.
    customer_text = " ".join(part for part in [message_text, date_text, time_text, notes_text] if part)
    booking_intent = _is_booking_intent(customer_text)
    reschedule_intent = _is_reschedule_intent(customer_text)
    cancel_intent = _is_cancel_intent(customer_text)

    # Keep intake state across messages so CRM conversation does not restart each turn.
    intake = _get_intake_state(phone_number)

    def _maybe_send(reply_text: str) -> None:
        if send_direct_reply and not phone_missing:
            _send_whatsapp_reply(phone_number, reply_text)

    if booking_intent:
        intake["active"] = True

    continued_booking = bool(intake.get("active"))

    extracted_name = provided_name or _extract_customer_name(customer_text)
    extracted_address = provided_address or _extract_customer_address(customer_text)
    extracted_enquiry = provided_enquiry or _extract_enquiry_text(customer_text)

    if extracted_name:
        intake["name"] = extracted_name
    if extracted_address:
        intake["address"] = extracted_address
    if extracted_enquiry:
        intake["enquiry"] = extracted_enquiry

    customer_name = intake.get("name") or ""
    customer_address = intake.get("address") or ""
    enquiry_text = intake.get("enquiry") or ""

    if (booking_intent or continued_booking) and phone_missing:
        ask_phone_reply = "Please share your phone number (with country code) so we can continue your appointment booking safely."
        return {
            "status": "needs_details",
            "missing": ["phone"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_phone_reply,
        }

    # Run emergency triage only against customer-provided text, not AI text,
    # to avoid repeated false alerts from model-generated wording.
    safety_text = " ".join(part for part in [message_text, notes_text, provided_enquiry] if part)
    if _is_emergency_message(safety_text):
        if intake.get("emergency_alerted"):
            pass
        else:
            intake["emergency_alerted"] = True
            emergency_reply = (
                "🚨 This sounds urgent. Please call emergency services or visit the nearest emergency hospital immediately. "
                "If you still need follow-up booking, share your name, preferred date/time, and service."
            )
            _maybe_send(emergency_reply)
            return {
                "status": "emergency",
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": emergency_reply,
            }

    if any(phrase in safety_text.lower() for phrase in ["feeling good", "feeling better", "better now", "check up", "checkup", "follow up", "follow-up"]):
        intake["emergency_alerted"] = False

    # ── 1. resolve IDs ────────────────────────────────────────────────────
    tenant_id = _parse_int(DEFAULT_TENANT_ID)
    detected_consultant_id = _find_consultant(db, combined_text)
    detected_service_id = _find_service(db, combined_text)
    if detected_consultant_id:
        intake["consultant_id"] = detected_consultant_id
    if detected_service_id:
        intake["service_id"] = detected_service_id

    consultant_id = intake.get("consultant_id") or _parse_int(DEFAULT_CONSULTANT_ID)
    service_id = intake.get("service_id") or _parse_int(DEFAULT_SERVICE_ID)

    if not intake.get("consultant_id"):
        specialization_matches = _find_consultants_by_specialization(db, combined_text)
        if len(specialization_matches) == 1:
            intake["consultant_id"] = specialization_matches[0].id
            consultant_id = specialization_matches[0].id

    if not all([tenant_id, consultant_id, service_id]):
        raise HTTPException(
            status_code=422,
            detail=(
                "Cannot resolve tenant / consultant / service. "
                "Set DEFAULT_TENANT_ID, DEFAULT_CONSULTANT_ID, DEFAULT_SERVICE_ID "
                "in .env, or mention the consultant/service name in the message."
            ),
        )

    # ── 2. resolve customer details & appointment time ─────────────────────
    previous_appointment_time = intake.get("appointment_time") if isinstance(intake.get("appointment_time"), datetime) else None
    extracted_datetime = _extract_datetime(
        " ".join([date_text, time_text, message_text]),
        default_datetime=previous_appointment_time,
    )
    has_datetime = extracted_datetime is not None
    if extracted_datetime is not None:
        intake["appointment_time"] = extracted_datetime
    appointment_time = intake.get("appointment_time") or extracted_datetime or datetime.utcnow()

    # ── 3. check existing customer first to avoid redundant data collection ─
    existing_customer = None
    if not phone_missing:
        user_repo = UserRepositoryImplementation(db)
        from app.application.dto.user_dto import UserLoginDTO

        existing_customer = login_user_use_case(user_repo, UserLoginDTO(phone=phone_number))

    GENERIC_NAME = "WhatsApp Customer"
    if (booking_intent or continued_booking) and not existing_customer:
        missing_details = []
        if not customer_name or customer_name == GENERIC_NAME:
            missing_details.append("name")
        if not customer_address:
            missing_details.append("address")
        if not enquiry_text:
            missing_details.append("enquiry")

        if missing_details:
            prompts = {
                "name": "full name",
                "address": "address",
                "enquiry": "reason for visit / enquiry",
            }
            detail_list = ", ".join(prompts[item] for item in missing_details)
            ask_details_reply = (
                f"Before I confirm your appointment, please share your {detail_list}. "
                "This helps us keep your records accurate."
            )
            _maybe_send(ask_details_reply)
            return {
                "status": "needs_details",
                "missing": missing_details,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": ask_details_reply,
            }

    # ── 4. get/create customer once minimum details are available ─────────
    GENERIC_NAME = "WhatsApp Customer"
    name_explicitly_provided = bool(extracted_name)
    if existing_customer:
        user_id = existing_customer.id
        is_new_customer = False
        # If we now have a real explicit name from chat, keep profile current.
        has_real_name = bool(customer_name and customer_name != GENERIC_NAME)
        name_changed = has_real_name and (existing_customer.full_name or "").strip().lower() != customer_name.strip().lower()
        if name_changed:
            user_repo = UserRepositoryImplementation(db)
            update_user_profile_use_case(
                user_repo,
                user_id,
                UserProfileUpdateDTO(full_name=customer_name),
            )
            existing_customer.full_name = customer_name
        else:
            customer_name = existing_customer.full_name or customer_name
    else:
        # Ensure we never register with a generic placeholder name
        if not customer_name or customer_name == GENERIC_NAME:
            customer_name = GENERIC_NAME
        user_id, is_new_customer, customer_name = _get_or_create_customer(
            db,
            phone_number,
            customer_name,
            tenant_id,
        )

    latest_appointment = _get_latest_appointment_for_contact(db, user_id, phone_number)

    if cancel_intent:
        ref_id = _extract_reference_id(customer_text)
        target_appointment = None

        if ref_id is not None:
            target_appointment = (
                db.query(Appointment)
                .filter(Appointment.id == ref_id)
                .first()
            )
            if target_appointment:
                user_owned = bool(target_appointment.user_id and target_appointment.user_id == user_id)
                phone_owned = _normalize_phone(str(getattr(target_appointment, "phone_number", ""))) == phone_number
                if not (user_owned or phone_owned):
                    target_appointment = None

            if target_appointment is None:
                cancel_missing_reply = (
                    f"I could not find appointment Ref #{ref_id} under your account. "
                    "Please share a valid reference number or ask for your latest appointment status."
                )
                _maybe_send(cancel_missing_reply)
                return {
                    "status": "cancel_not_found",
                    "phone_number": phone_number,
                    "phone_missing": phone_missing,
                    "whatsapp_reply": cancel_missing_reply,
                }
        else:
            target_appointment = latest_appointment

        if not target_appointment:
            no_appointment_reply = "I could not find an appointment to cancel. Please share your booking reference number."
            _maybe_send(no_appointment_reply)
            return {
                "status": "cancel_not_found",
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": no_appointment_reply,
            }

        current_status = str(
            target_appointment.status.value if hasattr(target_appointment.status, "value") else target_appointment.status
        )
        if current_status == "cancelled":
            already_cancelled_reply = (
                f"Appointment Ref #{target_appointment.id} is already cancelled."
            )
            _maybe_send(already_cancelled_reply)
            return {
                "status": "already_cancelled",
                "appointment_id": target_appointment.id,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": already_cancelled_reply,
            }

        if current_status == "completed":
            completed_reply = (
                f"Appointment Ref #{target_appointment.id} is already completed and cannot be cancelled."
            )
            _maybe_send(completed_reply)
            return {
                "status": "cannot_cancel_completed",
                "appointment_id": target_appointment.id,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": completed_reply,
            }

        target_appointment.status = AppointmentStatus.cancelled
        db.add(target_appointment)
        db.commit()

        consultant_name = _get_consultant_name(db, target_appointment.consultant_id)
        cancel_success_reply = (
            f"Your appointment with {consultant_name} on "
            f"{target_appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')} "
            f"(Ref #{target_appointment.id}) has been cancelled successfully."
        )
        _maybe_send(cancel_success_reply)
        _reset_intake_state(phone_number)
        return {
            "status": "cancelled",
            "appointment_id": target_appointment.id,
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": cancel_success_reply,
        }

    if latest_appointment and _is_status_query(combined_text):
        status_value = str(latest_appointment.status.value if hasattr(latest_appointment.status, "value") else latest_appointment.status)
        consultant_name = _get_consultant_name(db, latest_appointment.consultant_id)
        status_reply = (
            f"Your latest appointment with {consultant_name} is currently '{status_value}'. "
            f"Scheduled for {latest_appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')} "
            f"(Ref #{latest_appointment.id})."
        )
        _maybe_send(status_reply)
        return {
            "status": "status_shared",
            "appointment_id": latest_appointment.id,
            "appointment_status": status_value,
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": status_reply,
        }

    if reschedule_intent:
        ref_id = _extract_reference_id(customer_text)
        target_appointment = None

        if ref_id is not None:
            target_appointment = db.query(Appointment).filter(Appointment.id == ref_id).first()
            if target_appointment:
                user_owned = bool(target_appointment.user_id and target_appointment.user_id == user_id)
                phone_owned = _normalize_phone(str(getattr(target_appointment, "phone_number", ""))) == phone_number
                if not (user_owned or phone_owned):
                    target_appointment = None
        else:
            target_appointment = latest_appointment

        if not target_appointment:
            reschedule_missing_reply = (
                "I could not find the appointment to reschedule. "
                "Please share your booking reference number (for example: Ref #7)."
            )
            _maybe_send(reschedule_missing_reply)
            return {
                "status": "reschedule_not_found",
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": reschedule_missing_reply,
            }

        if intake.get("appointment_time") is None:
            ask_new_datetime_reply = "Please share the new date and time for rescheduling (example: 10 April 4:00 PM)."
            _maybe_send(ask_new_datetime_reply)
            return {
                "status": "needs_details",
                "missing": ["reschedule_appointment_time"],
                "appointment_id": target_appointment.id,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": ask_new_datetime_reply,
            }

        new_appointment_time = intake.get("appointment_time") or appointment_time
        if new_appointment_time < datetime.utcnow():
            intake["appointment_time"] = None
            ask_future_reply = "Please share a future date and time to reschedule this appointment."
            _maybe_send(ask_future_reply)
            return {
                "status": "needs_details",
                "missing": ["future_reschedule_appointment_time"],
                "appointment_id": target_appointment.id,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": ask_future_reply,
            }

        # Keep existing consultant/service unless user explicitly provided new ones.
        new_consultant_id = detected_consultant_id or target_appointment.consultant_id
        new_service_id = detected_service_id or target_appointment.service_id
        new_end_time = _build_end_datetime(db, new_service_id, new_appointment_time, customer_text)
        duration_minutes = max(5, int((new_end_time - new_appointment_time).total_seconds() // 60))

        availability_check = is_consultant_available_at_time(
            db,
            new_consultant_id,
            new_appointment_time,
            duration_minutes=duration_minutes,
        )
        if not availability_check["available"]:
            alternatives = find_available_slots(
                db,
                new_consultant_id,
                new_appointment_time,
                num_slots=3,
                duration_minutes=duration_minutes,
            )
            intake["appointment_time"] = None
            if alternatives:
                slots_text = format_available_slots_for_whatsapp(alternatives)
                reschedule_unavailable_reply = (
                    f"❌ That reschedule time is not available ({availability_check['reason']}).\n\n"
                    f"{slots_text}\n\n"
                    "Please reply with one of the above slots or another time."
                )
            else:
                reschedule_unavailable_reply = (
                    f"❌ That reschedule time is not available ({availability_check['reason']}). "
                    "No alternative slots were found in the next 30 days."
                )
            _maybe_send(reschedule_unavailable_reply)
            return {
                "status": "needs_details",
                "missing": ["available_reschedule_time"],
                "appointment_id": target_appointment.id,
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "suggested_slots": [slot.isoformat() for slot in alternatives],
                "whatsapp_reply": reschedule_unavailable_reply,
            }

        target_appointment.consultant_id = new_consultant_id
        target_appointment.service_id = new_service_id
        target_appointment.appointment_time = new_appointment_time
        target_appointment.end_time = new_end_time
        if str(target_appointment.status.value if hasattr(target_appointment.status, "value") else target_appointment.status) == "cancelled":
            target_appointment.status = AppointmentStatus.confirmed
        db.add(target_appointment)
        db.commit()

        consultant_name = _get_consultant_name(db, target_appointment.consultant_id)
        reschedule_reply = (
            f"✅ Your appointment (Ref #{target_appointment.id}) has been rescheduled with {consultant_name} to "
            f"{target_appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')}"
            f" - {target_appointment.end_time.strftime('%I:%M %p')}."
        )
        _maybe_send(reschedule_reply)
        _reset_intake_state(phone_number)
        return {
            "status": "rescheduled",
            "appointment_id": target_appointment.id,
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "appointment_time": target_appointment.appointment_time.isoformat(),
            "end_time": target_appointment.end_time.isoformat() if target_appointment.end_time else None,
            "whatsapp_reply": reschedule_reply,
        }

    if (booking_intent or continued_booking) and not enquiry_text:
        ask_enquiry_reply = "Please tell me your reason for visit (your enquiry) so I can complete the booking safely."
        _maybe_send(ask_enquiry_reply)
        return {
            "status": "needs_details",
            "missing": ["enquiry"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_enquiry_reply,
        }

    if not (booking_intent or continued_booking):
        if existing_customer and name_explicitly_provided:
            updated_name_reply = (
                f"Thanks for the clarification, {customer_name}. "
                "I have updated your profile name."
            )
            _maybe_send(updated_name_reply)
            return {
                "status": "profile_updated",
                "phone_number": phone_number,
                "phone_missing": phone_missing,
                "whatsapp_reply": updated_name_reply,
            }

        no_booking_reply = (
            "I can help with appointments. To start booking, please say: "
            "'I want to book an appointment' and share your preferred date/time."
        )
        _maybe_send(no_booking_reply)
        return {
            "status": "general_message",
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": no_booking_reply,
        }

    if (booking_intent or continued_booking) and not intake.get("consultant_id"):
        specialization_matches = _find_consultants_by_specialization(db, combined_text)
        if specialization_matches:
            consultant_options = ", ".join(
                consultant.display_name for consultant in specialization_matches if consultant.display_name
            )
            ask_consultant_reply = (
                "Based on your requirement, these consultants are available: "
                f"{consultant_options}. Please confirm which consultant you want to meet."
            )
        else:
            consultant_options = ", ".join(_list_active_consultants(db)[:5]) or "our available consultants"
            ask_consultant_reply = f"Please tell me which consultant you want to meet. Available options: {consultant_options}."
        _maybe_send(ask_consultant_reply)
        return {
            "status": "needs_details",
            "missing": ["consultant"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_consultant_reply,
        }

    if (booking_intent or continued_booking) and not intake.get("service_id"):
        service_options = ", ".join(_list_active_services(db)[:5]) or "our available services"
        ask_service_reply = f"Please tell me which service you need. Available options: {service_options}."
        _maybe_send(ask_service_reply)
        return {
            "status": "needs_details",
            "missing": ["service"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_service_reply,
        }

    if (booking_intent or continued_booking) and intake.get("appointment_time") is None:
        ask_datetime_reply = "Please share your preferred appointment date and time (example: 20 March 10:00 AM)."
        _maybe_send(ask_datetime_reply)
        return {
            "status": "needs_details",
            "missing": ["appointment_time"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_datetime_reply,
        }

    if intake.get("appointment_time") is not None and appointment_time < datetime.utcnow():
        intake["appointment_time"] = None
        ask_future_datetime_reply = "Please share a future appointment date and time. The date you sent looks like a past date."
        _maybe_send(ask_future_datetime_reply)
        return {
            "status": "needs_details",
            "missing": ["future_appointment_time"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "whatsapp_reply": ask_future_datetime_reply,
        }

    appointment_end_time = _build_end_datetime(db, service_id, appointment_time, customer_text)
    duration_minutes = max(5, int((appointment_end_time - appointment_time).total_seconds() // 60))

    # ── 4.5 check consultant availability ────────────────────────────────
    availability_check = is_consultant_available_at_time(
        db, consultant_id, appointment_time, duration_minutes=duration_minutes
    )
    
    if not availability_check["available"]:
        # Find alternative slots
        alternative_slots = find_available_slots(
            db, consultant_id, appointment_time, num_slots=3, duration_minutes=duration_minutes
        )
        
        intake["appointment_time"] = None  # Reset so they can provide a new time
        
        if alternative_slots:
            slots_text = format_available_slots_for_whatsapp(alternative_slots)
            availability_reply = (
                f"❌ The selected time is not available ({availability_check['reason']}). \n\n"
                f"{slots_text}\n\n"
                f"Please reply with your preferred time from the list above, or suggest another date/time."
            )
        else:
            availability_reply = (
                f"❌ The selected time is not available ({availability_check['reason']}). \n"
                f"Sorry, no slots available in the next 30 days. Please try again later."
            )
        
        _maybe_send(availability_reply)
        return {
            "status": "needs_details",
            "missing": ["available_appointment_time"],
            "phone_number": phone_number,
            "phone_missing": phone_missing,
            "reason": availability_check["reason"],
            "suggested_slots": [slot.isoformat() for slot in alternative_slots],
            "whatsapp_reply": availability_reply,
        }

    # ── 5. save appointment ───────────────────────────────────────────────
    notes_parts = [
        "Booked via WhatsApp.",
        f"Enquiry: {enquiry_text or 'N/A'}.",
        f"Address: {customer_address or 'N/A'}.",
        f"Original message: {message_text}",
    ]
    dto = AppointmentCreateDTO(
        tenant_id=tenant_id,
        consultant_id=consultant_id,
        service_id=service_id,
        user_id=user_id,
        customer_name=customer_name,
        phone_number=phone_number,
        appointment_time=appointment_time,
        end_time=appointment_end_time,
        notes=" ".join(notes_parts),
        status=AppointmentStatus.confirmed if WHATSAPP_INSTANT_CONFIRMATION else AppointmentStatus.pending,
    )
    repository = AppointmentRepositoryImplementation(db)
    appointment = create_appointment_use_case(repository, dto)

    # ── 6. compose & send WhatsApp confirmation reply ─────────────────────
    if is_new_customer:
        greeting = "Welcome! We've created a new account for you. 🎉\n"
    elif name_explicitly_provided and customer_name and customer_name != GENERIC_NAME:
        greeting = f"Welcome back, {customer_name}! 👋\n"
    else:
        greeting = "Welcome back! 👋\n"

    appointment_status = str(appointment.status.value if hasattr(appointment.status, "value") else appointment.status)
    consultant_name = _get_consultant_name(db, consultant_id)
    status_text = appointment_status.replace("_", " ").title()

    whatsapp_reply = (
        f"{greeting}"
        f"✅ Your appointment with {consultant_name} is {status_text} for "
        f"{appointment_time.strftime('%B %d, %Y at %I:%M %p')}.\n"
        f"Booking reference: #{appointment.id}.\n"
        f"We look forward to seeing you!"
    )
    _maybe_send(whatsapp_reply)

    _reset_intake_state(phone_number)

    return {
        "status": "booked",
        "appointment_id": appointment.id,
        "customer_name": customer_name,
        "is_new_customer": is_new_customer,
        "user_id": user_id,
        "phone_number": phone_number,
        "phone_missing": phone_missing,
        "appointment_time": appointment_time.isoformat(),
        "end_time": appointment_end_time.isoformat(),
        "whatsapp_reply": whatsapp_reply,
    }