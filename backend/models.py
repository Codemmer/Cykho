from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LogEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_ip: str
    destination_ip: Optional[str] = None
    event_type: str
    severity: str = "low" # low, medium, high, critical
    details: Dict[str, Any] = {}
    normalized: bool = False

class Alert(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    rule_name: str
    severity: str
    description: str
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    source_ips: List[str] = []
    status: str = "new" # new, investigating, resolved
    related_logs: List[str] = []

class Incident(BaseModel):
    title: str
    description: str
    status: str = "open"
    severity: str = "high"
    alerts: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_to: Optional[str] = None
