import urllib.request
import json
import time
import sys

SCENARIOS = {
    "brute_force": {
        "title": "Windows Password Spray & Brute Force Attack",
        "tactic": "Credential Access (T1110)",
        "source_type": "windows_event",
        "severity": "HIGH",
        "event_id": 4625,
        "host_name": "DC-PRIMARY-01",
        "src_ip": "185.220.101.5",
        "user_name": "administrator",
        "raw_payload": {"EventID": 4625, "TargetUserName": "administrator", "Status": "0xC000006D", "SubStatus": "0xC000006A", "IpAddress": "185.220.101.5"}
    },
    "powershell_enc": {
        "title": "Encoded PowerShell Reverse Shell Execution",
        "tactic": "Execution (T1059.001)",
        "source_type": "sysmon",
        "severity": "CRITICAL",
        "event_id": 1,
        "host_name": "FINANCE-PC",
        "process_name": "powershell.exe",
        "user_name": "m.taylor",
        "src_ip": "10.0.4.15",
        "raw_payload": {"EventID": 1, "Image": "C:\\Windows\\System32\\powershell.exe", "CommandLine": "powershell.exe -nop -w hidden -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...", "ParentImage": "C:\\Windows\\System32\\cmd.exe"}
    },
    "sqli": {
        "title": "Web Application SQL Injection Web Attack",
        "tactic": "Initial Access (T1190)",
        "source_type": "apache",
        "severity": "HIGH",
        "host_name": "WEB-PROD-01",
        "src_ip": "45.33.32.156",
        "raw_payload": {"request": "GET /api/users?id=1' UNION SELECT username, password_hash FROM users-- HTTP/1.1", "status": 200, "user_agent": "sqlmap/1.5#stable"}
    },
    "dns_tunnel": {
        "title": "DNS Data Exfiltration Tunneling",
        "tactic": "Command & Control (T1071.004)",
        "source_type": "zeek",
        "severity": "HIGH",
        "host_name": "WORKSTATION-01",
        "src_ip": "192.168.1.105",
        "raw_payload": {"query": "v8a9f8s9d8f9s8d9f8.exfil.attacker.com", "qtype": "TXT", "bytes_out": 4096}
    },
    "ransomware": {
        "title": "Ransomware Shadow Copy Deletion & Encryption",
        "tactic": "Impact (T1486)",
        "source_type": "sysmon",
        "severity": "CRITICAL",
        "event_id": 1,
        "host_name": "DEV-SERVR-01",
        "process_name": "vssadmin.exe",
        "raw_payload": {"EventID": 1, "Image": "C:\\Windows\\System32\\vssadmin.exe", "CommandLine": "vssadmin.exe delete shadows /all /quiet", "User": "NT AUTHORITY\\SYSTEM"}
    }
}

def trigger_attack(scenario_key):
    scenario = SCENARIOS.get(scenario_key)
    if not scenario:
        print(f"Unknown scenario: {scenario_key}")
        return False

    url = "http://localhost:5000/api/logs"
    payload = {
        "source_type": scenario["source_type"],
        "host_name": scenario["host_name"],
        "severity": scenario["severity"],
        "event_id": scenario.get("event_id"),
        "process_name": scenario.get("process_name"),
        "user_name": scenario.get("user_name"),
        "src_ip": scenario.get("src_ip"),
        "raw_payload": scenario["raw_payload"],
        "is_simulated": 1
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req, timeout=3) as res:
            res_body = res.read().decode('utf-8')
            print(f"[Attack Simulator] Successfully triggered '{scenario['title']}': {res_body}")
            return True
    except Exception as e:
        print(f"[Attack Simulator] Error sending attack telemetry: {e}")
        return False

if __name__ == '__main__':
    key = sys.argv[1] if len(sys.argv) > 1 else "brute_force"
    trigger_attack(key)
