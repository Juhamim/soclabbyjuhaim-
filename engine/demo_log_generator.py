import sqlite3
import json
import random
import time
import os
import uuid

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/soclab.db'))

HOSTNAMES = ['WORKSTATION-01', 'WORKSTATION-02', 'FINANCE-PC', 'DEV-SERVR-01', 'DC-PRIMARY-01', 'WEB-PROD-01', 'VPN-GATEWAY']
USERS = ['j.doe', 'a.smith', 'admin_corp', 'm.taylor', 'svc_backup', 'dev_user', 'system_acc']
IPS = ['192.168.1.105', '192.168.1.112', '10.0.4.15', '10.0.4.88', '172.16.0.4', '185.220.101.5', '45.33.32.156']
PROCESSES = ['cmd.exe', 'powershell.exe', 'explorer.exe', 'chrome.exe', 'svchost.exe', 'lsass.exe', 'python.exe', 'vssadmin.exe']

def generate_logs(count=50000):
    print(f"Generating {count} realistic enterprise log records for SOCLab AI...")
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    sources = ['windows_event', 'sysmon', 'firewall', 'dns', 'suricata', 'zeek', 'wazuh', 'apache', 'nginx', 'o365']
    severities = ['INFO', 'INFO', 'INFO', 'WARNING', 'HIGH', 'CRITICAL']

    now = time.time()
    batch = []

    for i in range(count):
        log_id = f"LOG-SEED-{i+1:06d}"
        # Spread timestamps over past 7 days
        ts_offset = random.randint(0, 7 * 86400)
        ts_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(now - ts_offset))

        src_type = random.choice(sources)
        host = random.choice(HOSTNAMES)
        user = random.choice(USERS)
        proc = random.choice(PROCESSES)
        src_ip = random.choice(IPS)
        dest_ip = random.choice(IPS)
        sev = random.choice(severities)

        event_id = None
        payload = {}

        if src_type == 'windows_event':
            event_id = random.choice([4624, 4625, 4672, 4720, 1102])
            payload = {
                "EventID": event_id,
                "LogonType": random.choice([2, 3, 10]),
                "TargetUserName": user,
                "WorkstationName": host,
                "IpAddress": src_ip,
                "Status": "0xC000006D" if event_id == 4625 else "0x0"
            }
        elif src_type == 'sysmon':
            event_id = random.choice([1, 3, 7, 11])
            payload = {
                "EventID": event_id,
                "Image": f"C:\\Windows\\System32\\{proc}",
                "CommandLine": f"{proc} /c echo System Diagnostic",
                "ParentImage": "C:\\Windows\\System32\\explorer.exe",
                "User": f"CORP\\{user}"
            }
        elif src_type == 'firewall':
            payload = {
                "action": random.choice(['ALLOW', 'DENY', 'DROP']),
                "src_port": random.randint(1024, 65535),
                "dest_port": random.choice([80, 443, 22, 3389, 445]),
                "bytes": random.randint(64, 4096)
            }
        elif src_type == 'dns':
            sub = random.choice(['mail', 'api', 'vpn', 'update', 'staging', 'x9823hskdf'])
            payload = {
                "query": f"{sub}.corp.internal",
                "qtype": "A",
                "rcode": "NOERROR"
            }
        else:
            payload = {
                "message": f"Normal system operational telemetry event for {host}",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "status_code": 200
            }

        raw_json = json.dumps(payload)
        batch.append((log_id, ts_iso, src_type, host, sev, event_id, proc, user, src_ip, dest_ip, raw_json, 0))

        if len(batch) >= 5000:
            cursor.executemany("""
                INSERT INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch)
            conn.commit()
            batch = []

    if batch:
        cursor.executemany("""
            INSERT INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, batch)
        conn.commit()

    conn.close()
    print("Seed dataset generation complete!")

if __name__ == '__main__':
    generate_logs(50000)
