from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
import app.models  # noqa: F401
from app.api.routes.appointments import router as appointment_router
from app.api.routes.whatsapp import router as whatsapp_router
from app.api.routes.tenants import router as tenant_router
from app.api.routes.users import router as user_router
from app.api.routes.consultants import router as consultant_router
from app.api.routes.services import router as service_router

# 🔹 Create DB tables
Base.metadata.create_all(bind=engine)

# 🔹 CREATE APP FIRST
app = FastAPI(title="WhatsApp Appointment Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 THEN include routers
app.include_router(
    tenant_router,
    prefix="/tenants",
    tags=["Tenants"]
)

app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)

app.include_router(
    consultant_router,
    prefix="/consultants",
    tags=["Consultants"]
)

app.include_router(
    service_router,
    prefix="/services",
    tags=["Services"]
)

app.include_router(
    appointment_router,
    prefix="/appointments",
    tags=["Appointments"]
)

app.include_router(
    whatsapp_router,
    prefix="/whatsapp",
    tags=["WhatsApp"]
)