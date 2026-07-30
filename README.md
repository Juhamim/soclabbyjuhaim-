# SOCLab AI - Enterprise SOC Simulation Platform

**100% Offline Security Operations Center (SOC) Learning, Simulation, Detection & Incident Response Platform**

SOCLab AI is a full-stack, offline-capable SOC simulation platform for cybersecurity training, Red vs Blue team exercises, attack simulation, SIEM log analysis, and incident response.

---

## Features

### Cyber Range Attack Simulator (12 Attack Vectors)
| Attack | MITRE Technique | Log Source |
|--------|----------------|------------|
| Windows Password Spray & Brute Force | T1110 | Windows Event (4625) |
| Encoded PowerShell Reverse Shell | T1059.001 | Sysmon (1) |
| Web Application SQL Injection | T1190 | Apache |
| DNS Data Exfiltration Tunneling | T1071.004 | Zeek |
| Ransomware Shadow Copy Deletion | T1486 | Sysmon (1) |
| LSASS Memory Dumping (Mimikatz) | T1003.001 | Sysmon (10) |
| Kerberoasting Service Ticket Request | T1558.003 | Windows Event (4769) |
| Persistence via Scheduled Task | T1053.005 | Windows Event (4698) |
| Kerberos Golden Ticket Forgery | T1558.001 | Windows Event (4624) |
| ARP Cache Poisoning / MITM | T1557.002 | Suricata |
| Stored XSS Session Hijacking | T1189 | Nginx |
| Nmap Reconnaissance Port Scan | T1046 | Firewall |

### Red vs Blue Team Simulation
- **Red Team**: Launch multi-stage adversary campaigns (Operation Blackout, SilentExfil, RansomLock)
- **Blue Team**: Execute containment playbooks in real-time with live scoring
- MTTD (Mean Time to Detect) tracking
- Real-time Red Attack Success vs Blue Mitigation Rate

### Cybersecurity Academy (15 Modules)
1. Networking Fundamentals
2. Advanced Network Packet Inspection
3. Operating System Security
4. SOC Fundamentals & Alert Triage
5. SIEM Log Analysis & FTS Queries
6. Digital Forensics & Incident Response (DFIR)
7. Malware Analysis & Reverse Engineering
8. Threat Hunting & Hypothesis Testing
9. Incident Response Frameworks (NIST 800-61 / PICERL)
10. MITRE ATT&CK Framework Mapping
11. Detection Engineering & Sigma Rules
12. Firewall & Network Defense
13. Active Directory & Identity Security
14. Web Application Security (OWASP Top 10)
15. SOAR & Response Automation

### Additional Capabilities
- **SIEM Dashboard**: Real-time log ingestion, alert monitoring, severity breakdown
- **Detection Engine**: 12 Sigma rules with MITRE ATT&CK mapping
- **SOAR Playbooks**: Automated IP blocking, host isolation, user disablement
- **Live Telemetry**: System metrics, process monitoring, network connections
- **Web PCAP Analyzer**: Packet hex inspection with protocol decoding
- **Investigation Graph**: Node-based incident investigation (Host → Process → User → IP)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js 22, Express, WebSocket (ws) |
| Database | SQLite (FTS5 full-text search) |
| Attack Engine | Python 3 (attack_simulator.py) |
| Log Generator | Python 3 (demo_log_generator.py) |
| Telemetry Agent | Python 3 (telemetry/agent.py) |

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Initialize Database
```bash
node server/src/config/initDb.js
```

### 3. Seed Demo Logs (optional)
```bash
python engine/demo_log_generator.py
```

### 4. Run the Platform
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend client
npm run client
```

Open **http://localhost:5173** in your browser. Default credentials: `admin` / `admin123`.

---

## Architecture

```
soclab/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── pages/          # Page components
│       └── styles/         # Global CSS
├── server/                 # Node.js Express backend
│   └── src/
│       ├── config/         # Database & init
│       ├── routes/         # API endpoints
│       ├── services/       # Detection, SOAR, Reports
│       └── websocket/      # Real-time WebSocket server
├── engine/                 # Python attack & log engines
├── telemetry/              # Python telemetry agent
├── data/                   # SQLite database
└── docs/                   # Documentation
```

---

## Running Attack Simulations

### From the UI
Navigate to **Cyber Range** tab → Select attack → Click **Launch Attack**

### From CLI
```bash
# Single stage attack
python engine/attack_simulator.py brute_force

# Multi-stage attack (full kill chain)
python engine/attack_simulator.py ransomware multi
```

**Available scenarios:** `brute_force`, `powershell_enc`, `sqli`, `dns_tunnel`, `ransomware`, `lsass_dump`, `kerberoast`, `scheduled_task`, `golden_ticket`, `arp_spoof`, `xss_exfil`, `port_scan`

---

## Red vs Blue Team Exercises

Navigate to **Red vs Blue** tab → Select operation → Launch campaign

Red team operations execute multi-stage attacks with live scoring. Blue team selects containment playbooks to mitigate each stage. Final scores show Red Attack Success % vs Blue Mitigation Rate.

---

## License

SOCLab AI - Enterprise SOC Simulation Platform
