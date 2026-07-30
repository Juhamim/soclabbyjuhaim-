<div align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-indigo?style=for-the-badge&labelColor=1e1b4b" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-emerald?style=for-the-badge&labelColor=1e1b4b" alt="License"/>
  <img src="https://img.shields.io/badge/offline-100%25-22c55e?style=for-the-badge&labelColor=1e1b4b" alt="Offline"/>
  <img src="https://img.shields.io/badge/build-passing-22c55e?style=for-the-badge&labelColor=1e1b4b" alt="Build"/>
  <img src="https://img.shields.io/badge/PRs-welcome-f59e0b?style=for-the-badge&labelColor=1e1b4b" alt="PRs"/>
  <br/>
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js" alt="Node"/>
  <img src="https://img.shields.io/badge/Python-3-3776AB?style=flat-square&logo=python" alt="Python"/>
  <img src="https://img.shields.io/badge/SQLite-FTS5-003B57?style=flat-square&logo=sqlite" alt="SQLite"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
</div>

<br/>

<div align="center">
  <h1>🛡️ SOCLab AI</h1>
  <h3>Enterprise SOC Simulation Platform — 100% Offline</h3>
  <p><strong>Cyber Range · Red vs Blue · SIEM · SOAR · Academy · Forensics</strong></p>
  <br/>
  <p>
    <i>Your personal Security Operations Center. No cloud. No subscriptions. Just pure cybersecurity simulation power.</i>
  </p>
</div>

<br/>

---

## ✨ About This Project

SOCLab AI is a **full-stack, offline-first** Security Operations Center simulation platform built for cybersecurity professionals, students, and enthusiasts. It simulates a real enterprise SOC environment with live telemetry, attack simulation, SIEM dashboards, SOAR automation, and a complete cybersecurity academy — **all running locally on your machine**.

> 🚀 **12 attack vectors** · 🎯 **Red vs Blue team battles** · 📚 **15 academy modules** · 🔍 **Live detection engine** · 🤖 **SOAR automation**

---

## 🎯 What Makes SOCLab AI Different?

| Feature | SOCLab AI | Cloud SOCs |
|---------|-----------|------------|
| 🌐 **100% Offline** | ✅ All local, no internet needed | ❌ Requires internet |
| 💰 **Cost** | ✅ Free & open source | 💸 Expensive licenses |
| 🛡️ **Attack Simulator** | ✅ 12 built-in attack vectors | ❌ Limited or extra cost |
| 🔴🔵 **Red vs Blue** | ✅ Full campaign simulation | ❌ Rarely included |
| 📚 **Academy** | ✅ 15 modules with quizzes | ❌ Separate platform |
| 🔧 **Customizable** | ✅ Full source access | ❌ Proprietary |

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Attack Scenarios](#-attack-scenarios)
- [Red vs Blue](#-red-vs-blue-team-simulation)
- [Academy Modules](#-cybersecurity-academy)
- [Running Experiments](#-running-experiments)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

### 🛡️ SIEM Dashboard
Real-time log ingestion with live severity breakdown, alert timeline, source distribution charts, and system health monitoring. Everything a Tier 1 SOC analyst needs.

### 🔥 Cyber Range (12 Attack Vectors)
One-click attack simulation for 12 real-world adversary techniques mapped to MITRE ATT&CK. Each attack includes multi-stage execution (Recon → Exploit → Exfil).

### 🔴🔵 Red vs Blue Team Simulation
Launch full adversary campaigns as Red Team or defend as Blue Team with real-time scoring, MTTD tracking, and containment playbooks.

### 📚 Cybersecurity Academy (15 Modules)
From Networking Fundamentals to SOAR Automation — each module includes detailed lessons and interactive lab quizzes with instant feedback.

### 🤖 SOAR Automation
6 automated playbooks: IP blocking, process termination, user disablement, host isolation, evidence collection, and report generation.

### 🔍 Detection Engine
12 Sigma rules mapped to MITRE ATT&CK with automatic alert generation on log ingestion. Supports custom rule creation.

### 📊 Reports & Forensics
Generate executive summary reports, investigate incidents via graph visualization, and analyze PCAPs with built-in hex decoder.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 22+
- [Python](https://www.python.org/) 3.10+
- npm (ships with Node.js)

### 1️⃣ Clone & Install
```bash
git clone https://github.com/Juhamim/soclabbyjuhaim-.git
cd soclabbyjuhaim-

# Install all dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2️⃣ Initialize Database
```bash
node server/src/config/initDb.js
```

### 3️⃣ Seed Demo Logs (recommended)
```bash
python engine/demo_log_generator.py
```

### 4️⃣ Launch the Platform
```bash
# Terminal 1 — Backend Server
npm run server

# Terminal 2 — Frontend Client
npm run client
```

### 5️⃣ Open & Login
Navigate to **http://localhost:5173**  
**Default credentials:** `admin` / `admin123`

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><b>🏠 SIEM Dashboard</b></td>
      <td align="center"><b>🔥 Cyber Range</b></td>
    </tr>
    <tr>
      <td><img src="docs/screenshots/dashboard.png" alt="SIEM Dashboard" width="400"/></td>
      <td><img src="docs/screenshots/cyber-range.png" alt="Cyber Range" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>🔴🔵 Red vs Blue</b></td>
      <td align="center"><b>📚 Academy</b></td>
    </tr>
    <tr>
      <td><img src="docs/screenshots/redblue.png" alt="Red vs Blue" width="400"/></td>
      <td><img src="docs/screenshots/academy.png" alt="Academy" width="400"/></td>
    </tr>
  </table>
</div>

---

## 🏗️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss) | UI framework, build tool, styling |
| **Backend** | ![Node](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js) ![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square) ![WebSocket](https://img.shields.io/badge/WS-8-4F5D73?style=flat-square) | REST API, WebSocket, real-time streaming |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-FTS5-003B57?style=flat-square&logo=sqlite) | Full-text search, offline storage |
| **Engine** | ![Python](https://img.shields.io/badge/Python-3-3776AB?style=flat-square&logo=python) | Attack simulation, log generation, telemetry |

</div>

---

## 📂 Architecture

```
soclab/
│
├── client/                        # 🎨 React Frontend
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx      # SIEM dashboard with live charts
│       │   ├── Attacks.jsx        # Cyber Range — 12 attack vectors
│       │   ├── RedBlueTeam.jsx    # Red vs Blue simulation
│       │   ├── Academy.jsx        # 15 cybersecurity modules
│       │   ├── Detection.jsx      # Detection rules & alert manager
│       │   ├── Playbooks.jsx      # SOAR automation playbooks
│       │   ├── Investigation.jsx  # Incident investigation graph
│       │   ├── PacketAnalyzer.jsx # PCAP hex decoder
│       │   ├── Telemetry.jsx      # Live host telemetry
│       │   └── Reports.jsx        # Executive report generator
│       └── styles/
│           └── globals.css        # Light SOC design system
│
├── server/                        # ⚙️ Node.js Backend
│   └── src/
│       ├── config/
│       │   ├── database.js        # SQLite connection
│       │   └── initDb.js          # Schema & seed data
│       ├── routes/
│       │   └── api.js             # REST API endpoints
│       ├── services/
│       │   ├── detectionEngine.js # Sigma rule engine
│       │   ├── soarEngine.js      # SOAR playbook executor
│       │   └── reportService.js   # Markdown report generator
│       └── websocket/
│           └── wsServer.js        # Real-time WebSocket server
│
├── engine/                        # 🐍 Python Engines
│   ├── attack_simulator.py        # 12 attack scenario executor
│   └── demo_log_generator.py      # 50k log dataset generator
│
├── telemetry/
│   └── agent.py                   # Python telemetry collector
│
├── data/
│   └── soclab.db                  # SQLite database
│
└── docs/
    ├── BUILD.md                   # Build instructions
    └── architecture.md            # Technical architecture docs
```

---

## 🔥 Attack Scenarios

| # | Attack | MITRE | Tactic | Log Source | Severity |
|---|--------|-------|--------|------------|----------|
| 1 | Windows Password Spray & Brute Force | [T1110](https://attack.mitre.org/techniques/T1110/) | Credential Access | Windows Event (4625) | 🔴 HIGH |
| 2 | Encoded PowerShell Reverse Shell | [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | Execution | Sysmon (1) | 🚨 CRITICAL |
| 3 | Web Application SQL Injection | [T1190](https://attack.mitre.org/techniques/T1190/) | Initial Access | Apache | 🔴 HIGH |
| 4 | DNS Data Exfiltration Tunneling | [T1071.004](https://attack.mitre.org/techniques/T1071/004/) | C2 | Zeek | 🔴 HIGH |
| 5 | Ransomware Shadow Copy Deletion | [T1486](https://attack.mitre.org/techniques/T1486/) | Impact | Sysmon (1) | 🚨 CRITICAL |
| 6 | LSASS Memory Dumping (Mimikatz) | [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | Credential Access | Sysmon (10) | 🚨 CRITICAL |
| 7 | Kerberoasting Service Ticket Request | [T1558.003](https://attack.mitre.org/techniques/T1558/003/) | Credential Access | Windows Event (4769) | 🔴 HIGH |
| 8 | Persistence via Scheduled Task | [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Persistence | Windows Event (4698) | 🔴 HIGH |
| 9 | Kerberos Golden Ticket Forgery | [T1558.001](https://attack.mitre.org/techniques/T1558/001/) | Privilege Escalation | Windows Event (4624) | 🚨 CRITICAL |
| 10 | ARP Cache Poisoning / MITM | [T1557.002](https://attack.mitre.org/techniques/T1557/002/) | Credential Access | Suricata | 🔴 HIGH |
| 11 | Stored XSS Session Hijacking | [T1189](https://attack.mitre.org/techniques/T1189/) | Initial Access | Nginx | 🔴 HIGH |
| 12 | Nmap Reconnaissance Port Scan | [T1046](https://attack.mitre.org/techniques/T1046/) | Discovery | Firewall | 🟡 MEDIUM |

### Multi-Stage Execution
Each attack follows a realistic kill chain with multiple stages:
```
┌─────────┐    ┌──────────┐    ┌──────────┐
│  Recon   │ → │ Exploit  │ → │  Exfil   │
│ (Probe)  │   │ (Access) │   │ (Impact) │
└─────────┘    └──────────┘    └──────────┘
```

### CLI Usage
```bash
# Single stage
python engine/attack_simulator.py brute_force

# Full kill chain (multi-stage)
python engine/attack_simulator.py ransomware multi

# All available scenarios
python engine/attack_simulator.py port_scan
```

---

## 🔴🔵 Red vs Blue Team Simulation

### Red Team Operations
| Operation | Difficulty | Stages | Description |
|-----------|-----------|--------|-------------|
| **Operation Blackout** | 🟡 Advanced | 4 | Credential theft & lateral movement across finance |
| **Operation SilentExfil** | 🔴 Expert | 4 | Covert DNS tunneling & C2 beaconing |
| **Operation RansomLock** | 🟡 Advanced | 4 | Full ransomware kill chain |

### Blue Team Playbooks
| Playbook | MITRE | Actions |
|----------|-------|---------|
| Brute Force Defense | T1110 | Account lockout, IP blocking, SOC alert |
| Ransomware Containment | T1486 | Host isolation, process kill, shadow copy enable |
| Data Exfil Interception | T1048 | DNS block, traffic inspect, anomaly alert |
| Kerberos Attack Remediation | T1558 | KRBTGT rotate, SPN audit, TGS monitor |

### How It Works
1. **Select team** — Red (attacker) or Blue (defender)
2. **Launch campaign** — Multi-stage attack executes automatically
3. **Counter (Blue)** — Select containment playbooks during each stage
4. **Score** — Live MTTD clock, Red Success % vs Blue Mitigation %

---

## 📚 Cybersecurity Academy

| # | Module | Category | Lab Quiz |
|---|--------|----------|----------|
| 1 | Networking Fundamentals | 🌐 Networking | Subnet CIDR calculation |
| 2 | Advanced Network Packet Inspection | 🌐 Networking | SYN scan identification |
| 3 | Operating System Security | 💻 OS Security | Suspicious parent process |
| 4 | SOC Fundamentals & Alert Triage | 🚨 SOC | Alert escalation priority |
| 5 | SIEM Log Analysis & FTS Queries | 🔍 SIEM | Windows Event ID matching |
| 6 | Digital Forensics & Incident Response | 🔎 Forensics | Memory analysis tooling |
| 7 | Malware Analysis & Reverse Engineering | 🦠 Malware | PowerShell obfuscation |
| 8 | Threat Hunting & Hypothesis Testing | 🎯 Threat Hunting | C2 beacon detection |
| 9 | Incident Response Frameworks | 🛡️ IR | Containment procedures |
| 10 | MITRE ATT&CK Framework Mapping | 📖 MITRE | Technique ID mapping |
| 11 | Detection Engineering & Sigma Rules | ⚙️ Detection Eng | Sigma rule syntax |
| 12 | Firewall & Network Defense | 🔥 Network Defense | Suricata rule actions |
| 13 | Active Directory & Identity Security | 🔐 AD Security | Kerberos attack types |
| 14 | Web Application Security (OWASP Top 10) | 🌍 Web Security | SQLi classification |
| 15 | SOAR & Response Automation | 🤖 SOAR | Playbook trigger logic |

Each module includes:
- 📖 **Multi-part technical lessons** with real-world context
- ✅ **Interactive multiple-choice lab quiz** with instant scoring
- 💡 **Detailed explanations** for every correct answer

---

## 🧪 Running Experiments

### Generate 50k Log Dataset
```bash
python engine/demo_log_generator.py
```
Generates 50,000 realistic enterprise log records with ~8% malicious event injection across all 12 attack vectors.

### Trigger Attacks via API
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "windows_event",
    "severity": "CRITICAL",
    "event_id": 4625,
    "raw_payload": {"attack": "brute_force", "src_ip": "185.220.101.5"},
    "is_simulated": 1
  }'
```

### Database Reset
```bash
rm data/soclab.db && node server/src/config/initDb.js
```

---

## 🤝 Contributing

SOCLab AI is an **open source project** and contributions are **warmly welcome**! Whether you're fixing bugs, adding new attack scenarios, improving the academy curriculum, or enhancing the UI — every contribution matters.

### Ways to Contribute
- 🐛 **Report bugs** — Open an issue with reproduction steps
- 💡 **Suggest features** — New attack vectors, detection rules, academy modules
- 📝 **Improve docs** — Fix typos, add examples, clarify instructions
- 🎨 **Enhance UI** — Design improvements, accessibility, dark mode
- 🌍 **Translations** — Localize the academy content
- 🔬 **New attack scenarios** — Implement new MITRE techniques

### Getting Started
```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

### Code of Conduct
Be respectful, inclusive, and constructive. All contributions are subject to the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## 👨‍💻 Author

### Juhamim

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>🔧 Creator & Lead Developer</strong>
        <br/>
        <br/>
        SOCLab AI was built with passion for cybersecurity education and simulation. As a security enthusiast, Juhamim created this platform to provide a free, offline-capable SOC environment where anyone can learn, practice, and master security operations without expensive licenses or cloud subscriptions.
        <br/><br/>
        <a href="https://github.com/Juhamim">🐙 GitHub</a>
      </td>
    </tr>
  </table>
</div>

---

## 📄 License

<div align="center">

**SOCLab AI** — Enterprise SOC Simulation Platform

Copyright © 2026 Juhamim

This is an **open source** project released under the MIT License.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

</div>

---

<div align="center">
  <p>
    <strong>Built with ❤️ for the cybersecurity community</strong>
    <br/>
    <sub>100% Offline · Open Source · No Cloud Dependencies</sub>
  </p>
  <br/>
  <p>
    <a href="https://github.com/Juhamim/soclabbyjuhaim-">⭐ Star on GitHub</a>
    ·
    <a href="https://github.com/Juhamim/soclabbyjuhaim-/issues">🐛 Report Bug</a>
    ·
    <a href="https://github.com/Juhamim/soclabbyjuhaim-/issues">💡 Request Feature</a>
  </p>
</div>
