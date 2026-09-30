import time
import random
import requests
from datetime import datetime

API_URL = "http://localhost:8000/api/logs"

IPS = ["192.168.1.10", "192.168.1.15", "10.0.0.5", "172.16.0.22", "8.8.8.8", "45.33.32.156"]

def generate_normal_log():
    return {
        "source_ip": random.choice(IPS[:4]),
        "destination_ip": "192.168.1.1",
        "event_type": "network_connection",
        "severity": "low",
        "details": {"action": "allow", "port": random.choice([80, 443, 53])}
    }

def generate_attack_log():
    attack_type = random.choice(["brute_force", "port_scan", "malware_beacon"])
    
    if attack_type == "brute_force":
        return {
            "source_ip": random.choice(IPS[4:]),
            "destination_ip": "192.168.1.10",
            "event_type": "failed_login",
            "severity": "high",
            "details": {"username": "admin", "reason": "invalid_credentials"}
        }
    elif attack_type == "port_scan":
        return {
            "source_ip": random.choice(IPS[4:]),
            "destination_ip": "192.168.1.10",
            "event_type": "firewall_block",
            "severity": "medium",
            "details": {"action": "drop", "port": random.randint(1024, 65535)}
        }
    else:
        return {
            "source_ip": "192.168.1.15",
            "destination_ip": random.choice(IPS[4:]),
            "event_type": "network_connection",
            "severity": "critical",
            "details": {"action": "allow", "port": 443, "threat_intel": "malicious"}
        }

if __name__ == "__main__":
    print("Starting CYKHO Log Simulator...")
    while True:
        # 80% normal traffic, 20% attack traffic
        if random.random() > 0.2:
            log = generate_normal_log()
        else:
            log = generate_attack_log()
            
        try:
            requests.post(API_URL, json=log)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent log: {log['event_type']} from {log['source_ip']}")
        except Exception as e:
            print(f"Error sending log: {e}")
            
        time.sleep(random.uniform(0.5, 3.0))
