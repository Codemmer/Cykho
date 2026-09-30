import os
import json
from typing import Dict, Any, List
from models import LogEntry, Alert
from database import get_db

# Basic rules for a mini-SOC
DETECTION_RULES = [
    {
        "name": "Failed Login Spike",
        "description": "Multiple failed login attempts detected from a single IP.",
        "condition": lambda log: log.event_type == "failed_login",
        "severity": "high",
        "mitre_tactic": "Credential Access",
        "mitre_technique": "T1110 - Brute Force"
    },
    {
        "name": "Suspicious Port Scan",
        "description": "Multiple blocked connections to different ports.",
        "condition": lambda log: log.event_type == "firewall_block" and log.details.get("action") == "drop",
        "severity": "medium",
        "mitre_tactic": "Discovery",
        "mitre_technique": "T1046 - Network Service Scanning"
    },
    {
        "name": "Malware Beaconing Activity",
        "description": "Frequent periodic connections to an unknown external IP.",
        "condition": lambda log: log.event_type == "network_connection" and log.details.get("threat_intel") == "malicious",
        "severity": "critical",
        "mitre_tactic": "Command and Control",
        "mitre_technique": "T1071 - Application Layer Protocol"
    }
]

async def analyze_log(log_entry: LogEntry, db) -> List[Alert]:
    generated_alerts = []
    
    for rule in DETECTION_RULES:
        try:
            if rule["condition"](log_entry):
                alert = Alert(
                    rule_name=rule["name"],
                    severity=rule["severity"],
                    description=rule["description"],
                    mitre_tactic=rule["mitre_tactic"],
                    mitre_technique=rule["mitre_technique"],
                    source_ips=[log_entry.source_ip]
                )
                generated_alerts.append(alert)
        except Exception as e:
            print(f"Error evaluating rule {rule['name']}: {e}")
            
    # Save alerts to DB
    for alert in generated_alerts:
        await db.alerts.insert_one(alert.dict())
        
    return generated_alerts
