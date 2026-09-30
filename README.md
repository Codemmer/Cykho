# CYKHO Mini SOC Platform

A full-stack cybersecurity platform and Mini Security Operations Center (SOC).

## Features
- **Real-time Log Collection**: Live ingestion of network and security logs.
- **Threat Detection Engine**: Rule-based detection mapping to MITRE ATT&CK.
- **Live SOC Dashboard**: Real-time event velocity graphs and threat statistics.
- **Incident & Alert Management**: Categorized alerts by severity and tactic.
- **Traffic Simulator**: Built-in script to generate normal and attack traffic.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Recharts, Socket.IO
- **Backend**: FastAPI (Python), Motor (Async MongoDB), Socket.IO
- **Database**: MongoDB

## Prerequisites
1. **Node.js** (v18+)
2. **Python** (3.9+)
3. **MongoDB** (Running locally on default port 27017, or update `MONGO_URL` in `backend/database.py`)

## Running Locally

### 1. Setup Environment
**Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

*(Note: dependencies include `fastapi uvicorn motor pydantic python-socketio motor-types python-multipart`)*

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Start Services
You can start all services at once using the provided PowerShell script from the root directory:
```powershell
.\start.ps1
```

Or manually start them in separate terminals:
1. **API**: `cd backend && .\venv\Scripts\activate && uvicorn main:app --reload`
2. **Simulator**: `cd backend && .\venv\Scripts\activate && python simulator.py`
3. **Frontend**: `cd frontend && npm run dev`
