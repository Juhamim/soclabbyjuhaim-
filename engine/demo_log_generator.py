import sqlite3
import json
import random
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'soclab.db')

LOG_SOURCES = ['windows_event', 'sysmon', 'firewall', 'dns', 'suricata', 'zeek', 'wazuh', 'apache', 'nginx', 'o365']
HOSTNAMES = ['DC-PRIMARY-01', 'WORKSTATION-01', 'WORKSTATION-02', 'WEB-PROD-01', 'VPN-GATEWAY']
USERS = ['administrator', 'j.smith', 'a.davis', 'm.taylor', 'dev_user', 'admin_corp']
IPS = ['192.168.1.105', '10.0.4.15', '172.16.0.4', '185.220.101.5', '45.33.32.156', '10.0.4.88']

ATTACK_PAYLOADS = [
    {"source_type": "windows_event", "event_id": 4625, "severity": "HIGH", "user": "administrator", "payload": json.dumps({"EventID": 4625, "Status": "0xC000006D", "SubStatus": "0xC000006A", "message": "Logon Failure: Unknown user name or bad password"})},
    {"source_type": "sysmon", "event_id": 1, "severity": "CRITICAL", "user": "administrator", "payload": json.dumps({"Image": "C:\\Windows\\System32\\powershell.exe", "CommandLine": "powershell.exe -enc JABjAGwAaQBlAG4AdAAgAD0A...", "ParentImage": "C:\\Program Files\\Microsoft Office\\Office16\\WINWORD.EXE"})},
    {"source_type": "apache", "event_id": None, "severity": "HIGH", "user": "guest", "payload": json.dumps({"request": "GET /api/users?id=1' UNION SELECT username, password FROM users-- HTTP/1.1", "status_code": 200})},
    {"source_type": "zeek", "event_id": None, "severity": "HIGH", "user": "m.taylor", "payload": json.dumps({"query": "v8a9f8s9d8f9s8d9f8.exfil.attacker.com", "qtype": "TXT", "bytes_sent": 4096})},
    {"source_type": "sysmon", "event_id": 1, "severity": "CRITICAL", "user": "administrator", "payload": json.dumps({"Image": "C:\\Windows\\System32\\vssadmin.exe", "CommandLine": "vssadmin.exe delete shadows /all /quiet", "ParentImage": "C:\\Windows\\System32\\cmd.exe"})},
    {"source_type": "sysmon", "event_id": 10, "severity": "CRITICAL", "user": "NT AUTHORITY\\SYSTEM", "payload": json.dumps({"SourceImage": "C:\\Temp\\mimikatz.exe", "TargetImage": "C:\\Windows\\System32\\lsass.exe", "GrantedAccess": "0x1fffff"})},
    {"source_type": "windows_event", "event_id": 4769, "severity": "HIGH", "user": "krbtgt", "payload": json.dumps({"TicketOptions": "0x40810000", "TicketEncryptionType": "0x17", "Service": "MSSQLSvc/db.corp.local"})},
    {"source_type": "suricata", "event_id": None, "severity": "HIGH", "user": "system", "payload": json.dumps({"alert": "ET MALWARE ARP Poisoning Spoofing Detected", "src_mac": "00:11:22:33:44:55"})}
]

def generate_logs():
    print("Generating 50,000 realistic enterprise log records...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    records = []
    now = datetime.utcnow()

    for i in range(50000):
        log_id = f"LOG-SEED-{i:06d}"
        days_offset = random.uniform(0, 7)
        timestamp = (now - timedelta(days=days_offset)).strftime('%Y-%m-%dT%H:%M:%SZ')
        
        if random.random() < 0.05:  # 5% attack scenario logs
            atk = random.choice(ATTACK_PAYLOADS)
            source_type = atk["source_type"]
            event_id = atk["event_id"]
            severity = atk["severity"]
            user_name = atk["user"]
            raw_payload = atk["payload"]
            is_sim = 1
        else:
            source_type = random.choice(LOG_SOURCES)
            event_id = random.choice([4624, 4672, 4720, 1, 3, 11]) if source_type in ['windows_event', 'sysmon'] else None
            severity = 'INFO'
            user_name = random.choice(USERS)
            raw_payload = json.dumps({
                "message": f"Normal operational telemetry event for {random.choice(HOSTNAMES)}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "status_code": 200
            })
            is_sim = 0

        host_name = random.choice(HOSTNAMES)
        process_name = random.choice(['svchost.exe', 'powershell.exe', 'chrome.exe', 'cmd.exe', 'vssadmin.exe'])
        src_ip = random.choice(IPS)
        dest_ip = random.choice(IPS)

        records.append((log_id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_sim))

        if len(records) >= 5000:
            cursor.executemany('''
                INSERT OR REPLACE INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', records)
            conn.commit()
            records = []

    if records:
        cursor.executemany('''
            INSERT INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', records)
        conn.commit()

    conn.close()
    print("50,000 realistic logs generated successfully.")

if __name__ == '__main__':
    generate_logs()
