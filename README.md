# WP Integration - Appointment Scheduling System

This is the single project README for both frontend and backend.

## Overview

The repository contains a full-stack appointment scheduling system:

- `client/`: React + Vite dashboard UI
- `server/`: FastAPI backend with appointment, availability, and WhatsApp routes

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+
- pip

## Local Setup and Run

### 1) Start backend

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Optional environment file (`server/.env`):

```env
DATABASE_URL=sqlite:///./app.db
```

If no `DATABASE_URL` is provided, SQLite is used at `server/app.db`.

Backend docs:

- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2) Start frontend

```bash
cd client
npm install
npm run dev
```

Frontend usually runs at `http://localhost:5173`.

In development, frontend `/api/*` requests are proxied to `http://127.0.0.1:8000` by Vite.

## Build

Frontend production build:

```bash
cd client
npm run build
```

## Backend Route Groups

- `/tenants`
- `/users`
- `/consultants`
- `/services`
- `/appointments`
- `/availability`
- `/whatsapp`

## Availability Initialization

Run once after consultants are created:

```bash
cd server
python setup_consultant_availability.py
```

This script initializes default weekly availability for active consultants.

## n8n Integration (Using ngrok)

To connect local backend with n8n:

1. Start backend on port 8000.
2. In another terminal, run:

```bash
ngrok http 8000
```

3. Copy the ngrok https URL.
4. Configure n8n to call this URL for API endpoints.

Example endpoint in n8n:

```text
https://<your-ngrok-url>/whatsapp/...
```

## Repository Cleanliness

The repo is configured to ignore generated/local files:

- Python cache and compiled files (`__pycache__/`, `*.pyc`)
- Virtual environments (`.venv/`, `venv/`)
- Local DB files (`*.db`, `*.sqlite*`)
- Frontend build/deps (`client/dist/`, `client/node_modules/`)
- Local env files (`.env`, `server/.env`)
- Local helper binary (`ngrok.exe`)

