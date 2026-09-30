from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from models import LogEntry, Alert, Incident
from services.detection import analyze_log
import socketio
from typing import List

app = FastAPI(title="CYKHO Mini SOC API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Socket.IO for real-time updates
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

db = get_db()

@app.on_event("startup")
async def startup_db_client():
    pass

@app.on_event("shutdown")
async def shutdown_db_client():
    pass

@app.get("/")
def read_root():
    return {"message": "CYKHO API is running"}

@app.post("/api/logs")
async def receive_log(log: LogEntry, background_tasks: BackgroundTasks):
    log_dict = log.dict()
    # Insert log into DB
    result = await db.logs.insert_one(log_dict)
    log_dict["_id"] = str(result.inserted_id)
    
    # Broadcast new log to frontend
    await sio.emit('new_log', log_dict)
    
    # Analyze for threats
    alerts = await analyze_log(log, db)
    for alert in alerts:
        alert_dict = alert.dict()
        alert_dict["_id"] = str(alert_dict.get("id", ""))
        await sio.emit('new_alert', alert_dict)
        
    return {"status": "success", "id": str(result.inserted_id)}

@app.get("/api/logs")
async def get_logs(limit: int = 100):
    logs = await db.logs.find().sort("timestamp", -1).limit(limit).to_list(length=limit)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs

@app.get("/api/alerts")
async def get_alerts(limit: int = 100):
    alerts = await db.alerts.find().sort("timestamp", -1).limit(limit).to_list(length=limit)
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
    return alerts

@app.get("/api/stats")
async def get_stats():
    total_logs = await db.logs.count_documents({})
    total_alerts = await db.alerts.count_documents({})
    critical_alerts = await db.alerts.count_documents({"severity": "critical"})
    return {
        "total_logs": total_logs,
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts
    }

app_asgi = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app_asgi", host="0.0.0.0", port=8000, reload=True)
