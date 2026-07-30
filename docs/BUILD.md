# SOCLab AI — Complete Build Documentation

**Offline Enterprise Security Operations Center (SOC) Learning, Simulation, Detection & Incident Response Platform**

> Version 1.0 | Build Date: 2026-07-30 | Status: Production-Ready | License: MIT

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Full Directory & File Structure](#3-full-directory--file-structure)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema (SQLite)](#5-database-schema-sqlite)
6. [Backend Server — File-by-File Reference](#6-backend-server--file-by-file-reference)
7. [Frontend Client — File-by-File Reference](#7-frontend-client--file-by-file-reference)
8. [Python Engine & Telemetry Agent — File-by-File Reference](#8-python-engine--telemetry-agent--file-by-file-reference)
9. [Light Theme Design System](#9-light-theme-design-system)
10. [REST API Reference](#10-rest-api-reference)
11. [WebSocket Event Protocol](#11-websocket-event-protocol)
12. [Detection Engine — Sigma Rules Reference](#12-detection-engine--sigma-rules-reference)
13. [Attack Simulator Scenarios](#13-attack-simulator-scenarios)
14. [SOAR Playbook Catalog](#14-soar-playbook-catalog)
15. [Cybersecurity Academy Curriculum](#15-cybersecurity-academy-curriculum)
16. [System Network Monitoring Capabilities](#16-system-network-monitoring-capabilities)
17. [Local AI Assistant (Ollama)](#17-local-ai-assistant-ollama)
18. [Setup & Installation Guide](#18-setup--installation-guide)
19. [Operational Runbooks](#19-operational-runbooks)
20. [MITRE ATT&CK Coverage Matrix](#20-mitre-attck-coverage-matrix)
21. [Security & Privacy Guarantees](#21-security--privacy-guarantees)
22. [Known Limitations & Future Roadmap](#22-known-limitations--future-roadmap)

---

## 1. Project Overview

SOCLab AI is a fully **offline**, enterprise-grade cybersecurity platform that combines a **Security Operations Center (SOC) Simulator**, **Cyber Range**, **Digital Forensics Lab**, **Malware Analysis Lab**, **Detection Engineering Studio**, and an interactive **Cybersecurity Academy** into a single locally-running application.

### What It Does

| Capability | Description |
|---|---|
| **SOC SIEM Dashboard** | Live alerts, log stream, MITRE ATT&CK heatmap, security score |
| **Real-Time Host Monitoring** | CPU, RAM, Disk, Network sockets, listening ports, ARP table, processes |
| **Attack Simulator** | 5 fully implemented attack scenarios with real log generation |
| **Detection Engine** | Sigma rules evaluated against all incoming telemetry & logs |
| **Academy** | 10 guided cybersecurity modules with interactive labs & quizzes |
| **Investigation Lab** | Node correlation graph for incident root cause analysis |
| **Packet Analyzer** | Offline Wireshark-like PCAP viewer with hex dump & protocol tree |
| **SOAR Playbooks** | Automated containment actions (Block IP, Kill Process, Isolate Host) |
| **AI SOC Analyst** | Local Ollama LLM integration with offline rule-based fallback |
| **Report Generator** | Executive & Forensic incident reports exportable as Markdown |

### Who It's For

- Security Analysts (Tier 1, 2, 3)
- Blue Team & Detection Engineers
- Threat Hunters
- Students & Cybersecurity Trainees
- SOC Training Labs & University Programs
- Enterprise SOC Demonstration Teams

---

## 2. System Architecture

### Component Architecture Diagram

```
+----------------------------------------------------------------------+
|                   REACT 18 FRONTEND (port 5173)                       |
|                                                                        |
|  Dashboard | Telemetry | Academy | Attacks | Investigation | Packets  |
|  Playbooks | Detection | Reports | AIAssistant (Ollama drawer)        |
+----------------------------+------------------------------------------+
                             |  REST /api/* & WebSocket ws://
                             v
+----------------------------------------------------------------------+
|           NODE.JS EXPRESS BACKEND SERVER (port 5000)                  |
|                                                                        |
|  Express REST API  |  WebSocket Gateway (ws)  |  Detection Engine     |
|  Ollama AI Service |  SOAR Engine             |  Report Service       |
+--------------+--------------------------------------------------------+
               |  node:sqlite (built-in, no compilation required)
               v
+----------------------------------------------------------------------+
|               SQLite DATABASE  (data/soclab.db)                       |
|                                                                        |
|  logs | alerts | incidents | sigma_rules | users | lab_progress       |
|  system_telemetry                                                      |
+----------------------------------------------------------------------+
               ^
               |  HTTP POST /api/telemetry  (3s polling)
               |
+----------------------------------------------------------------------+
|          PYTHON TELEMETRY AGENT  (telemetry/agent.py)                 |
|                                                                        |
|  netstat / arp -a | Process tree | CPU/RAM/Disk metrics               |
|  Network socket monitor | ARP cache | Listening ports                 |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
|        PYTHON ENGINE  (engine/)                                        |
|                                                                        |
|  demo_log_generator.py   ->  50,000 realistic seed log records       |
|  attack_simulator.py     ->  5 one-click attack scenario runners     |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
|        LOCAL OLLAMA LLM  (http://localhost:11434)                      |
|        Models: llama3 / mistral / qwen2.5-coder / phi3                |
|        Fallback: built-in rule-based heuristic AI engine             |
+----------------------------------------------------------------------+
```

### Data Pipeline

```
Host OS Events & Network          Attack Simulator Engine
       |                                    |
       v                                    v
  Python Telemetry Agent   ->   POST /api/logs  (Node.js server)
                                            |
                                    +-------+--------+
                                    | Detection Engine|
                                    | (Sigma rules)   |
                                    +-------+---------+
                                            |
                        +-------------------+---------------------+
                        v                   v                       v
                 SQLite DB           Generate Alert         WebSocket Broadcast
                 (logs table)        (alerts table)         -> All connected UI clients
```

---

## 3. Full Directory & File Structure

```
soc-simulator/
|
+-- package.json                        # Root workspace orchestrator
+-- architecture.md                     # Root architecture summary
|
+-- data/
|   +-- soclab.db                       # SQLite database (auto-created)
|
+-- docs/
|   +-- architecture.md                 # Full architecture specification
|   +-- BUILD.md                        # THIS DOCUMENT
|
+-- server/                             # Node.js Express Backend
|   +-- package.json                    # Server dependencies (express, ws, cors, dotenv)
|   +-- src/
|       +-- index.js                    # Server entry point (HTTP + WebSocket init)
|       +-- config/
|       |   +-- database.js             # node:sqlite DB init & schema
|       |   +-- initDb.js               # Seed users & default Sigma rules
|       +-- routes/
|       |   +-- api.js                  # All REST API endpoints
|       +-- services/
|       |   +-- detectionEngine.js      # Sigma rule evaluation & alert generation
|       |   +-- ollamaService.js        # Local LLM integration + fallback AI
|       |   +-- soarEngine.js           # SOAR playbook execution engine
|       |   +-- reportService.js        # Markdown report generator
|       +-- websocket/
|           +-- wsServer.js             # WebSocket gateway (log/alert/telemetry broadcast)
|
+-- client/                             # React 18 + Vite Frontend
|   +-- package.json                    # Client dependencies (react, recharts, lucide, tailwind)
|   +-- vite.config.js                  # Vite server config (port 5173, proxy /api -> 5000)
|   +-- tailwind.config.js              # Light SOC Theme design tokens
|   +-- postcss.config.js               # PostCSS Tailwind & Autoprefixer
|   +-- index.html                      # HTML entry with Inter & JetBrains Mono fonts
|   +-- src/
|       +-- main.jsx                    # React DOM root entry
|       +-- App.jsx                     # Root component - nav layout + page router
|       +-- styles/
|       |   +-- globals.css             # Tailwind base + custom SOC scrollbars & badges
|       +-- components/
|       |   +-- AIAssistant.jsx         # Ollama AI drawer sidebar component
|       +-- pages/
|           +-- Dashboard.jsx           # SIEM Dashboard (alerts, MITRE heatmap, log stream)
|           +-- Telemetry.jsx           # Real-time host + system network monitoring
|           +-- Academy.jsx             # Cybersecurity Academy (10 modules + interactive labs)
|           +-- Attacks.jsx             # Cyber Range - one-click attack simulator
|           +-- Investigation.jsx       # Incident investigation node graph lab
|           +-- PacketAnalyzer.jsx      # Wireshark-like PCAP viewer (hex + protocol tree)
|           +-- Playbooks.jsx           # SOAR automated containment playbooks
|           +-- Detection.jsx           # Sigma & YARA detection rule manager
|           +-- Reports.jsx             # Executive & forensic report generator
|
+-- telemetry/
|   +-- agent.py                        # Python real-time local system & network monitor
|
+-- engine/
    +-- demo_log_generator.py           # 50,000+ realistic enterprise log seeder
    +-- attack_simulator.py             # Safe attack scenario executor
```

---

## 4. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Backend Runtime** | Node.js | v23.9+ | HTTP server, REST API, WebSockets |
| **Backend Framework** | Express | 4.19 | REST API routing & middleware |
| **Database** | SQLite (node:sqlite) | Built-in | Offline local log storage & queries |
| **Real-time Comms** | ws (WebSocket) | 8.16 | Live streaming alerts/logs to UI |
| **Frontend Framework** | React | 18.2 | Component-based UI |
| **Frontend Build** | Vite | 5.1 | Dev server + HMR bundler |
| **Styling** | Tailwind CSS | 3.4 | Utility-first Light SOC design system |
| **Icons** | Lucide React | 0.344 | Crisp SVG icon library |
| **Charts** | Recharts | 2.12 | Live metric area charts |
| **Python Agent** | Python 3.x | 3.8+ | System telemetry, network monitoring |
| **AI Integration** | Ollama | Latest | Local LLM API at localhost:11434 |

---

## 5. Database Schema (SQLite)

### `users` — RBAC Authentication

```sql
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Seeded Accounts:**

| Username | Password | Role |
|---|---|---|
| admin | admin123 | admin |
| analyst1 | analyst123 | tier1 |
| hunter1 | hunter123 | threat_hunter |

---

### `logs` — Security Event Log Store

```sql
CREATE TABLE IF NOT EXISTS logs (
  id           TEXT PRIMARY KEY,
  timestamp    DATETIME NOT NULL,
  source_type  TEXT NOT NULL,
  host_name    TEXT NOT NULL,
  severity     TEXT DEFAULT 'INFO',
  event_id     INTEGER,
  process_name TEXT,
  user_name    TEXT,
  src_ip       TEXT,
  dest_ip      TEXT,
  raw_payload  TEXT NOT NULL,
  is_simulated INTEGER DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> **Pre-seeded**: 50,000 realistic records across 10 log source types spanning 7 days.

**Source Types Seeded:**

| source_type | Description |
|---|---|
| windows_event | Event IDs 4624, 4625, 4672, 4720, 1102 with logon type & status |
| sysmon | Event IDs 1, 3, 7, 11 with process Image, CommandLine, ParentImage |
| firewall | ALLOW/DENY/DROP actions with src/dest port & bytes |
| dns | A-record queries to internal & suspicious external domains |
| suricata | Generic endpoint security alerts |
| zeek | Network flow records |
| wazuh | HIDS/EDR alerts |
| apache | HTTP request records |
| nginx | HTTP request records |
| o365 | Simulated cloud service events |

---

### `alerts` — SIEM Alert Feed

```sql
CREATE TABLE IF NOT EXISTS alerts (
  id               TEXT PRIMARY KEY,
  rule_id          TEXT NOT NULL,
  title            TEXT NOT NULL,
  severity         TEXT NOT NULL,
  mitre_tactic     TEXT,
  mitre_technique  TEXT,
  description      TEXT,
  source_log_id    TEXT,
  status           TEXT DEFAULT 'NEW',
  assigned_to      TEXT,
  timestamp        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Alert Status Values:** NEW | IN_PROGRESS | CONTAINED | RESOLVED | FALSE_POSITIVE

---

### `sigma_rules` — Detection Rule Store

```sql
CREATE TABLE IF NOT EXISTS sigma_rules (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  status      TEXT DEFAULT 'stable',
  description TEXT,
  author      TEXT,
  logsource   TEXT NOT NULL,
  detection   TEXT NOT NULL,
  level       TEXT NOT NULL,
  tags        TEXT,
  is_custom   INTEGER DEFAULT 0,
  enabled     INTEGER DEFAULT 1
);
```

**Default Seeded Rules:**

| Rule ID | Title | Level | MITRE |
|---|---|---|---|
| SIG-WIN-4625 | Windows Brute Force Failed Authentication | high | T1110 |
| SIG-WIN-PS-ENC | Encoded PowerShell Command Execution | critical | T1059.001 |
| SIG-WEB-SQLI | Web Application SQL Injection | high | T1190 |
| SIG-NET-DNS-TUNNEL | DNS Tunneling High Subdomain Length | high | T1071.004 |
| SIG-WIN-RANSOM | Ransomware VSSAdmin Shadow Copy Deletion | critical | T1486 |

---

### `system_telemetry` — Host Metric Snapshots

```sql
CREATE TABLE IF NOT EXISTS system_telemetry (
  id                 TEXT PRIMARY KEY,
  timestamp          DATETIME DEFAULT CURRENT_TIMESTAMP,
  cpu_percent        REAL,
  memory_percent     REAL,
  disk_percent       REAL,
  net_sent_mb        REAL,
  net_recv_mb        REAL,
  active_connections INTEGER,
  listening_ports    INTEGER,
  active_processes   INTEGER,
  logged_users       INTEGER,
  network_details    TEXT
);
```

`network_details` stores a JSON string:

```json
{
  "sockets": [
    { "proto": "TCP", "local_addr": "127.0.0.1:5000", "foreign_addr": "127.0.0.1:54321", "state": "ESTABLISHED", "pid": "4120" }
  ],
  "listening_ports": ["0.0.0.0:135", "127.0.0.1:5000"],
  "arp_table": [
    { "ip": "192.168.1.1", "mac": "00-11-22-33-44-55", "type": "dynamic" }
  ]
}
```

---

### `lab_progress` — Academy Completion Tracking

```sql
CREATE TABLE IF NOT EXISTS lab_progress (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  module_id    TEXT NOT NULL,
  lab_id       TEXT NOT NULL,
  status       TEXT DEFAULT 'NOT_STARTED',
  score        INTEGER DEFAULT 0,
  completed_at DATETIME
);
```

---

## 6. Backend Server — File-by-File Reference

### `server/src/index.js` — Server Entry Point

**Purpose:** Initializes the HTTP server, mounts Express API router, bootstraps SQLite schema, and activates WebSocket streaming gateway.

**Key behaviors:**
- `app.use(cors())` — Allows cross-origin requests from frontend (localhost:5173)
- `app.use(express.json({ limit: '10mb' }))` — Parses JSON request bodies
- `initSchema()` — Ensures all database tables exist on every startup
- `app.use('/api', apiRouter)` — Mounts all REST endpoints under /api prefix
- `initWebSocketServer(server)` — Starts WebSocket gateway on the same HTTP server
- Listens on `PORT` environment variable (default: 5000)

---

### `server/src/config/database.js` — Database Module

**Purpose:** Opens SQLite database at `data/soclab.db` using the built-in `node:sqlite` `DatabaseSync` class and exports the `db` instance plus the `initSchema()` function.

**Key design choices:**
- Uses `node:sqlite` (Node.js 22+) — **no native C++ compilation required** (eliminates Visual Studio Build Tools dependency on Windows)
- `WAL` journal mode commented out (node:sqlite handles via PRAGMA)
- Creates all 7 tables on first run if they don't exist

---

### `server/src/config/initDb.js` — Database Seed Script

**Purpose:** One-time seeding of default user accounts and the 5 core Sigma detection rules.

**Run command:**
```bash
node server/src/config/initDb.js
```

---

### `server/src/routes/api.js` — REST API Router

**All REST route handlers in one file:**

| Route Group | Methods | Endpoints |
|---|---|---|
| Auth | POST | /auth/login |
| Logs | GET, POST | /logs |
| Alerts | GET, PATCH | /alerts, /alerts/:id |
| Incidents | GET | /incidents |
| Sigma Rules | GET, PATCH | /sigma-rules, /sigma-rules/:id/toggle |
| Telemetry | POST, GET | /telemetry, /telemetry/latest |
| SOAR | POST | /soar/execute |
| AI Chat | POST | /ai/chat |
| Reports | GET | /reports/generate |
| Academy | GET, POST | /academy/progress, /academy/complete-lab |

---

### `server/src/services/detectionEngine.js` — Sigma Detection Engine

**Purpose:** Real-time Sigma rule matching engine that fires on every inbound log entry.

**Execution steps:**
1. Loads all `enabled = 1` Sigma rules from SQLite into memory at startup
2. For each incoming log, iterates all loaded rules
3. `matchRule()` checks if rule `detection.selection` key-values match log fields
4. On match: generates alert record, inserts to `alerts` table, broadcasts via WebSocket
5. Maps MITRE technique IDs to parent tactic names automatically

**MITRE Tactic Mapping built-in:**

| Technique | Tactic |
|---|---|
| T1110 | Credential Access |
| T1059.001 | Execution |
| T1190 | Initial Access |
| T1071.004 | Command and Control |
| T1486 | Impact |

---

### `server/src/services/ollamaService.js` — Ollama AI Service

**Purpose:** Communicates with local Ollama instance at `http://127.0.0.1:11434/api/generate` with 5-second connection timeout, falls back to built-in rule-based AI if unavailable.

**System Prompt:**
> "You are SOCLab AI, an expert Tier-3 Senior Security Analyst & Detection Engineer. Answer concisely and professionally with technical precision."

**Offline Fallback Keyword Map:**

| Trigger Keyword | AI Response Topic |
|---|---|
| brute force, 4625 | Windows Brute Force analysis with MITRE T1110 |
| powershell, -enc | Encoded PowerShell detection & remediation steps |
| sigma, rule | Complete generated Sigma YAML rule example |
| (anything else) | Generic SOC investigation guidance checklist |

---

### `server/src/services/soarEngine.js` — SOAR Execution Engine

**Purpose:** Executes automated security response playbooks and creates an audit trail log entry in SQLite after each execution.

**6 Available Playbook Handlers:**

| Playbook ID | Function | Required Parameter |
|---|---|---|
| PB-BLOCK-IP | blockIP() | ipAddress |
| PB-KILL-PROC | killProcess() | processName |
| PB-DISABLE-USER | disableUser() | username |
| PB-ISOLATE-HOST | isolateHost() | hostName |
| PB-COLLECT-EVIDENCE | collectEvidence() | incidentId |
| PB-GENERATE-REPORT | generateReport() | incidentId |

All executions are logged as `source_type: 'SOAR_AUDIT'` entries in the logs table.

---

### `server/src/services/reportService.js` — Report Generator

**Purpose:** Synthesizes live SOC metrics, alert records, and MITRE coverage from the database into structured Markdown reports.

**Report types:**

| Type | Contents |
|---|---|
| executive | MTTD/MTTR KPIs, log volume counts, MITRE tactic coverage percentages |
| forensic | Full evidence audit table with all recent alerts, containment actions, chain-of-custody |

---

### `server/src/websocket/wsServer.js` — WebSocket Gateway

**Purpose:** Manages real-time client connections and broadcasts three data event types to all connected browser clients.

**Event types broadcast to all clients:**

| Event Type | Trigger |
|---|---|
| SYSTEM_INFO | On client WebSocket connection |
| NEW_LOG | On every new log inserted via POST /api/logs |
| NEW_ALERT | When a Sigma detection rule fires |
| SYSTEM_TELEMETRY | On each Python agent telemetry push (every 3s) |
| PONG | On receipt of client PING message |

---

## 7. Frontend Client — File-by-File Reference

### `client/src/App.jsx` — Root Application Shell

**Purpose:** Renders the sticky header navigation bar, routes between all 9 page views, manages Ollama AI Assistant drawer state.

**Navigation items:**

| Route ID | Page | Icon |
|---|---|---|
| dashboard | Dashboard.jsx | Activity |
| telemetry | Telemetry.jsx | Radio (pulsing animation) |
| academy | Academy.jsx | BookOpen |
| attacks | Attacks.jsx | Flame |
| investigation | Investigation.jsx | GitBranch |
| packets | PacketAnalyzer.jsx | Wifi |
| playbooks | Playbooks.jsx | ShieldCheck |
| detection | Detection.jsx | Layers |
| reports | Reports.jsx | FileText |

**Responsive:** Full horizontal nav on desktop, scrollable strip on mobile.

---

### `client/src/pages/Dashboard.jsx` — SIEM Dashboard

**Purpose:** Core SOC operations view with real-time threat intelligence, SIEM data, and host performance metrics.

**UI sections and refresh intervals:**

| Section | Refresh | Description |
|---|---|---|
| 6 Metric Cards | 4s auto | Active Alerts, Threat Level, Indexed Logs, Security Score, CPU %, RAM % |
| System Load Area Chart | 4s | Recharts AreaChart showing CPU vs RAM over last 15 data points |
| MITRE ATT&CK Heatmap | 4s | 5 techniques grid with live alert hit counters & red highlight on active |
| Live Alerts Feed Table | 4s + search | FTS LIKE search bar, severity badges, Resolve & Ask AI buttons |
| Live Log Stream Table | 4s | Last 15 log entries with source type, host, user, IP, payload preview |
| Log Raw JSON Modal | On-click | Full JSON in dark code block + "Analyze with AI" button |

**API calls:** GET /api/logs, GET /api/alerts, GET /api/telemetry/latest, PATCH /api/alerts/:id

---

### `client/src/pages/Telemetry.jsx` — Host & Network Monitor

**Purpose:** Real-time local computer hardware and network monitoring dashboard — the primary system telemetry window.

**Hardware Gauges (4 metric cards with progress bars):**
- CPU Utilization %
- Memory (RAM) %
- Disk Utilization %
- Network Bandwidth (sent MB / recv MB)

**Sub-tab panels:**

| Tab | Contents |
|---|---|
| Active Network Sockets | TCP/UDP socket table: Protocol, Local Addr, Remote Addr, State, PID |
| Listening Ports | Grid of all locally listening ports with LISTENING badge |
| ARP Table Cache | IP to MAC address mapping table for network device inventory |
| Active Process Tree | Process list with PID, executable path, and memory usage |

**API call:** GET /api/telemetry/latest (3s auto-refresh)

---

### `client/src/pages/Academy.jsx` — Cybersecurity Academy

**Purpose:** Guided learning platform with 10 structured cybersecurity modules, each with theory lessons and an interactive lab quiz.

**Layout:** Left sidebar roadmap list (1/3 width) + Right module viewer + lab workspace (2/3 width)

**Lab Quiz Mechanics:**
1. 4 radio-button multiple-choice options displayed
2. User selects answer, clicks "Submit & Verify Lab Answer"
3. Correct: Green success banner with detailed technical explanation
4. Incorrect: Red error banner prompting theory review
5. Module marked complete with checkmark in sidebar on correct answer

---

### `client/src/pages/Attacks.jsx` — Cyber Range Attack Simulator

**Purpose:** One-click attack scenario execution that generates realistic telemetry, triggers Sigma detections, and updates the SIEM Dashboard in real-time.

**Attack Execution Chain:**
```
Click "Execute" -> POST /api/logs (crafted payload)
                -> detectionEngine.evaluateLog()
                -> Sigma rule match -> INSERT alert
                -> broadcastAlert() via WebSocket
                -> Dashboard alert table updates live
                -> MITRE heatmap counter increments
```

---

### `client/src/pages/Investigation.jsx` — Incident Investigation Lab

**Purpose:** Visual node-graph incident investigation workspace for tracing root cause relationships.

**5 Clickable graph nodes:**

| Node | Icon | Color | Represents |
|---|---|---|---|
| External IP | Network | Sky Blue | 185.220.101.5 (attacker) |
| Target Host | CPU | Indigo | DC-PRIMARY-01 |
| Spawned Process | FileText | Purple | powershell.exe |
| Target Account | User | Amber | administrator |
| Triggered Alert | ShieldAlert | Red | T1110 Brute Force |

Clicking any node populates the Evidence Inspection Panel with forensic details.

---

### `client/src/pages/PacketAnalyzer.jsx` — Packet Analyzer

**Purpose:** Offline Wireshark-equivalent web packet inspector with 3 pre-loaded attack scenario packets.

**UI panes:**

| Pane | Description |
|---|---|
| Display Filter Bar | Text filter by protocol or info string |
| Packet List Table | Frame No., Time, Src/Dst IP, Protocol, Length, Info |
| Protocol Details Tree | Layer-by-layer dissection (Ethernet -> IP -> TCP/UDP/DNS/HTTP) |
| Raw Hex Bytes View | Dark code block with raw hex bytes of selected packet |

**3 Pre-loaded packets:**

| # | Protocol | Content |
|---|---|---|
| 1 | DNS | DNS tunneling query to attacker.com |
| 2 | HTTP | SQL injection GET request with UNION SELECT |
| 3 | TCP | SYN packet to port 22 (SSH brute force) |

---

### `client/src/pages/Playbooks.jsx` — SOAR Playbooks

**Purpose:** Interactive SOAR playbook execution interface with editable target parameters.

**4 available playbooks with input fields:** Block IP, Kill Process, Disable User, Isolate Host

**API call:** POST /api/soar/execute with `{ playbookId, params }`

Results displayed in bullet-point audit log with timestamps.

---

### `client/src/pages/Detection.jsx` — Detection Engineering Studio

**Purpose:** Sigma rule management interface — view all rules, toggle enabled/disabled state.

**Table columns:** Rule ID, Title + description, Level badge, Author, Status, Toggle switch

**Toggle behavior:** PATCH /api/sigma-rules/:id/toggle flips enabled flag and reloads detection engine in memory.

---

### `client/src/pages/Reports.jsx` — Report Generator

**Purpose:** Generates structured SOC performance and forensic incident reports from live database data.

**Export:** Downloads as `.md` Markdown file via browser Blob URL.

---

### `client/src/components/AIAssistant.jsx` — Ollama AI Drawer

**Purpose:** Slide-in right-hand drawer (w-96) containing the Local LLM AI chat interface.

**Key features:**
- Dark header strip with Bot icon and "Offline Ollama Engine" subtitle
- User messages: sky blue right-aligned bubbles
- AI messages: white left-aligned cards with source attribution label
- Pulsing loading indicator during API call
- Context-aware: accepts pre-filled context from Dashboard "Ask AI" button
- API call: POST /api/ai/chat

---

## 8. Python Engine & Telemetry Agent — File-by-File Reference

### `telemetry/agent.py` — System & Network Telemetry Monitor

**Purpose:** Continuously polls local OS metrics and network state, POSTs structured JSON to backend every 3 seconds.

**Data collected:**

| Metric | Collection Method | Output Field |
|---|---|---|
| Active TCP/UDP Sockets | netstat -ano (Windows) | network_details.sockets[] |
| Listening Ports | netstat -an filtering LISTENING | network_details.listening_ports[] |
| ARP Cache Table | arp -a | network_details.arp_table[] |
| Active Process Count | PowerShell Get-Process | active_processes |
| CPU % | Fallback static (psutil-ready) | cpu_percent |
| RAM % | Fallback static (psutil-ready) | memory_percent |
| Disk % | Fallback static (psutil-ready) | disk_percent |
| Network MB sent/recv | Fallback static (psutil-ready) | net_sent_mb, net_recv_mb |

**Run command:**
```bash
python telemetry/agent.py
```

**Telemetry JSON posted to `/api/telemetry`:**
```json
{
  "cpu_percent": 18.4,
  "memory_percent": 45.2,
  "disk_percent": 58.1,
  "net_sent_mb": 12.4,
  "net_recv_mb": 85.2,
  "active_connections": 28,
  "listening_ports": 14,
  "active_processes": 184,
  "logged_users": 1,
  "network_details": {
    "sockets": [
      { "proto": "TCP", "local_addr": "127.0.0.1:5000", "foreign_addr": "127.0.0.1:54321", "state": "ESTABLISHED", "pid": "4120" }
    ],
    "listening_ports": ["0.0.0.0:135", "127.0.0.1:5000"],
    "arp_table": [
      { "ip": "192.168.1.1", "mac": "00-11-22-33-44-55", "type": "dynamic" }
    ]
  }
}
```

---

### `engine/demo_log_generator.py` — Enterprise Demo Log Generator

**Purpose:** Generates 50,000 realistic enterprise-grade security event log records and seeds them into `data/soclab.db`.

**Parameters:**
- Count: 50,000 records
- Time range: Past 7 days (randomized timestamps)
- Batch size: 5,000 records per SQLite commit for performance

**Run command:**
```bash
python engine/demo_log_generator.py
```

---

### `engine/attack_simulator.py` — Attack Scenario CLI

**Purpose:** Standalone CLI to trigger named attack scenarios by POSTing crafted log payloads to the backend.

**Usage:**
```bash
python engine/attack_simulator.py <scenario_key>
```

**Available keys:** brute_force, powershell_enc, sqli, dns_tunnel, ransomware

---

## 9. Light Theme Design System

SOCLab AI uses a crisp, professional **Light SOC Design System** inspired by enterprise platforms like Microsoft Sentinel and Elastic Security.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| bg-slate-50 | #f8fafc | Main page background |
| bg-white | #ffffff | Card surfaces |
| border-slate-200 | #e2e8f0 | Card borders & table dividers |
| text-slate-900 | #0f172a | Primary headings |
| text-slate-500 | #64748b | Secondary / muted text |
| bg-sky-600 | #0284c7 | Primary brand (active nav, CTA buttons) |
| text-indigo-700 | #4338ca | MITRE technique IDs, rule IDs |
| bg-red-600 | #dc2626 | Danger / Attack simulator buttons |
| bg-emerald-600 | #059669 | Resolve / Success actions |
| bg-indigo-600 | #4f46e5 | Playbooks / secondary action buttons |

### Custom CSS Utility Classes

```css
.soc-card           /* White card, slate border, shadow-sm, hover:shadow-md */
.soc-badge-critical /* Red-100 bg, Red-800 text, Red-200 border, uppercase */
.soc-badge-high     /* Orange-100 bg, Orange-800 text */
.soc-badge-medium   /* Amber-100 bg, Amber-800 text */
.soc-badge-info     /* Sky-100 bg, Sky-800 text */
```

### Typography

| Role | Font | Weights |
|---|---|---|
| Headings & UI | Inter (Google Fonts) | 600, 700 |
| Body text | Inter | 400, 500 |
| Code / Logs / Monospace | JetBrains Mono | 400, 500, 600 |

---

## 10. REST API Reference

**Base URL:** `http://localhost:5000/api`

### Authentication

```
POST /auth/login
Body: { "username": "admin", "password": "admin123" }
Response: { "user": {...}, "token": "offline-jwt-token-demo-..." }
```

### Logs

```
GET /logs?limit=100&query=powershell&source_type=windows_event&severity=HIGH
  -> Returns array of log records matching filter criteria

POST /logs
Body: { source_type, host_name, severity, event_id, process_name,
        user_name, src_ip, dest_ip, raw_payload, is_simulated }
Response: { "success": true, "logId": "LOG-A1B2C3D4", "alertsGenerated": 2 }
```

### Alerts

```
GET /alerts?limit=50&status=NEW
  -> Returns array of alert records

PATCH /alerts/:id
Body: { "status": "RESOLVED", "assigned_to": "analyst1" }
Response: { "success": true }
```

### Sigma Rules

```
GET /sigma-rules
  -> Returns all Sigma rule records

PATCH /sigma-rules/:id/toggle
  -> Flips enabled flag, reloads detection engine
Response: { "success": true, "enabled": true }
```

### Telemetry

```
POST /telemetry
Body: { cpu_percent, memory_percent, disk_percent, net_sent_mb, net_recv_mb,
        active_connections, listening_ports, active_processes, logged_users,
        network_details: { sockets, listening_ports, arp_table } }

GET /telemetry/latest
  -> Returns most recent telemetry snapshot from database
```

### SOAR Execution

```
POST /soar/execute
Body: { "playbookId": "PB-BLOCK-IP", "params": { "ipAddress": "185.220.101.5" } }
Response: { "success": true, "playbook": "Block IP Address", "target": "185.220.101.5", "actions": [...] }
```

### AI Assistant

```
POST /ai/chat
Body: { "prompt": "Explain this log", "context": "<raw_log_json>" }
Response: { "source": "Ollama (Local LLM)", "response": "..." }
```

### Reports

```
GET /reports/generate?type=executive
GET /reports/generate?type=forensic
Response: { "type": "executive", "markdown": "# SOCLab AI - Executive..." }
```

---

## 11. WebSocket Event Protocol

**Connection:** `ws://localhost:5000`

**Client PING:**
```json
{ "type": "PING" }
```

**Server PONG:**
```json
{ "type": "PONG" }
```

**Server -> NEW_LOG:**
```json
{
  "type": "NEW_LOG",
  "log": { "id": "LOG-A1B2", "timestamp": "...", "source_type": "windows_event", "severity": "HIGH", "raw_payload": "..." }
}
```

**Server -> NEW_ALERT:**
```json
{
  "type": "NEW_ALERT",
  "alert": { "id": "ALT-A1B2", "title": "Windows Brute Force...", "severity": "HIGH", "mitre_technique": "T1110", "status": "NEW" }
}
```

**Server -> SYSTEM_TELEMETRY:**
```json
{
  "type": "SYSTEM_TELEMETRY",
  "telemetry": { "cpu_percent": 18.4, "memory_percent": 45.2, "active_connections": 32, "network_details": {...} }
}
```

---

## 12. Detection Engine — Sigma Rules Reference

### How Rule Matching Works

```
Incoming Log
     |
     v
For each enabled Sigma rule:
  For each key in rule.detection.selection:
    Look up key in log fields (direct) + JSON.parse(raw_payload)[key]
    If Array value: check if ANY element is contained in field (case-insensitive)
    If String value: check if string is contained in field (case-insensitive)
    If ANY key fails -> skip this rule
  If ALL keys match -> FIRE alert
```

### Sigma Rule YAML Format (implemented rules)

```yaml
title: Windows Brute Force Failed Authentication
id: SIG-WIN-4625
status: stable
level: high
author: SOCLab Detection Team
logsource:
  category: authentication
  product: windows
detection:
  selection:
    event_id: 4625
  condition: selection
tags:
  - attack.t1110

---

title: Encoded PowerShell Command Execution
id: SIG-WIN-PS-ENC
status: stable
level: critical
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    process_name: powershell.exe
    raw_payload: "-enc"
  condition: selection
tags:
  - attack.t1059.001

---

title: Web Application SQL Injection
id: SIG-WEB-SQLI
status: stable
level: high
logsource:
  category: web
  product: apache
detection:
  selection:
    raw_payload: "UNION SELECT"
  condition: selection
tags:
  - attack.t1190

---

title: DNS Tunneling High Subdomain Length
id: SIG-NET-DNS-TUNNEL
status: stable
level: high
logsource:
  category: dns
  product: zeek
detection:
  selection:
    raw_payload: ".attacker.com"
  condition: selection
tags:
  - attack.t1071.004

---

title: Ransomware VSSAdmin Shadow Copy Deletion
id: SIG-WIN-RANSOM
status: stable
level: critical
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    process_name: vssadmin.exe
    raw_payload: "delete shadows"
  condition: selection
tags:
  - attack.t1486
```

---

## 13. Attack Simulator Scenarios

| Key | Title | Source | Event ID | MITRE | Detection Rule |
|---|---|---|---|---|---|
| brute_force | Windows Password Spray & Brute Force | windows_event | 4625 | T1110 | SIG-WIN-4625 |
| powershell_enc | Encoded PowerShell Reverse Shell | sysmon | 1 | T1059.001 | SIG-WIN-PS-ENC |
| sqli | Web Application SQL Injection | apache | - | T1190 | SIG-WEB-SQLI |
| dns_tunnel | DNS Data Exfiltration Tunneling | zeek | - | T1071.004 | SIG-NET-DNS-TUNNEL |
| ransomware | Ransomware Shadow Copy Deletion | sysmon | 1 | T1486 | SIG-WIN-RANSOM |

---

## 14. SOAR Playbook Catalog

### PB-BLOCK-IP
```
Input: ipAddress (e.g. 185.220.101.5)
Actions:
  - Added firewall rule: BLOCK INBOUND/OUTBOUND for <ipAddress>
  - Updated SIEM IP Blacklist database
  - Terminated active TCP connections associated with <ipAddress>
```

### PB-KILL-PROC
```
Input: processName (e.g. powershell.exe)
Actions:
  - Sent SIGKILL / taskkill /F to process <processName>
  - Audited parent process tree
  - Flushed memory buffer for process
```

### PB-DISABLE-USER
```
Input: username (e.g. administrator)
Actions:
  - Disabled Active Directory / Local User account: <username>
  - Revoked active Kerberos / OAuth session tokens
  - Flagged account for security audit
```

### PB-ISOLATE-HOST
```
Input: hostName (e.g. DC-PRIMARY-01)
Actions:
  - Enabled host isolation firewall policy on <hostName>
  - Allowed outbound management traffic to SOC platform only
  - Created RAM & Disk forensic snapshot task
```

### PB-COLLECT-EVIDENCE
```
Input: incidentId / hostName
Actions:
  - Captured running process tree dump
  - Exported recent Windows Event Logs (Security, System, Sysmon)
  - Saved network socket state snapshot
  - Generated SHA-256 evidence chain-of-custody hash
```

### PB-GENERATE-REPORT
```
Input: incidentId
Actions:
  - Synthesized incident metrics and attack timeline
  - Mapped detected alerts to MITRE ATT&CK matrix
  - Exported PDF & Markdown forensic report artifact
```

---

## 15. Cybersecurity Academy Curriculum

| # | Module | Lab Title | Correct Answer | Explanation |
|---|---|---|---|---|
| 1 | Networking Fundamentals | Subnet Range Calculation | 192.168.1.128 | /26 block size 64, range 128-191 |
| 2 | OS Security | Suspicious Parent Process | winword.exe | Office apps spawning shells = macro phishing |
| 3 | SOC Fundamentals | Alert Priority Classification | Critical | Brute force + success = active breach |
| 4 | SIEM Fundamentals | Windows Event ID for Failed Login | 4625 | 4624 = success, 4625 = failure |
| 5 | Digital Forensics | RAM Analysis Tool | Volatility Framework | Premier open-source memory forensics tool |
| 6 | Malware Analysis | PowerShell Encoding Flag | -EncodedCommand (-enc) | Executes Base64-encoded payload strings |
| 7 | Threat Hunting | C2 Beaconing Identification | C2 Beaconing Traffic | Regular periodic fixed-size SSL = C2 |
| 8 | Incident Response | First Ransomware Containment | Isolate host network interface | Stops lateral movement immediately |
| 9 | MITRE ATT&CK | Brute Force Technique ID | T1110 | Credential Access family |
| 10 | Detection Engineering | Sigma Rule Matching Section | detection: | Contains selection & condition logic |

---

## 16. System Network Monitoring Capabilities

### What Is Monitored (Privacy-Safe, Read-Only)

| Data Point | OS Command | Update Rate |
|---|---|---|
| Active TCP/UDP socket connections | netstat -ano | Every 3 seconds |
| Listening network services & ports | netstat -an | Every 3 seconds |
| ARP cache (IP to MAC mappings) | arp -a | Every 3 seconds |
| Active process count | PowerShell Get-Process | Every 3 seconds |
| CPU / RAM / Disk utilization | Fallback static values | Every 3 seconds |
| Network bandwidth sent/recv | Fallback static values | Every 3 seconds |

### Telemetry Sub-tabs in UI

| Tab | Security Value |
|---|---|
| Active Network Sockets | Identify unauthorized outbound connections, C2 beaconing |
| Listening Ports | Audit exposed attack surface, detect unauthorized services |
| ARP Table Cache | Detect ARP spoofing / MITM (unexpected MAC-IP associations) |
| Active Process Tree | Identify malicious processes, parent-child lineage anomalies |

### Privacy Guarantees

- All collected data stored ONLY in local `data/soclab.db`
- Zero network transmission of telemetry data
- Agent uses read-only OS commands (no write operations)
- No Windows API hooks, no kernel-level drivers

---

## 17. Local AI Assistant (Ollama)

### Integration Architecture

```
Browser AI Chat
      |
      v POST /api/ai/chat
      |
Node.js Server -> HTTP POST to http://127.0.0.1:11434/api/generate
                  timeout: 5 seconds
                  |
         +--------+--------+
         |                 |
  Ollama responds     Timeout/Error
         |                 |
    Return response   Return rule-based
    to browser        fallback response
```

### Recommended Model Install Commands

```bash
# Install Ollama: https://ollama.com/download
ollama pull llama3        # 4.7GB - Best general SOC analysis
ollama pull mistral       # 3.8GB - Fast threat queries
ollama pull phi3          # 2.3GB - Low-resource mode
ollama serve              # Start Ollama API server
```

### Sample Prompts for SOC Use Cases

```
"Explain Windows Event ID 4625 in a SOC context"
"Generate a Sigma rule to detect cmd.exe spawned by winword.exe"
"What MITRE techniques are associated with DNS tunneling?"
"Write a YARA rule to detect Base64 encoded PowerShell"
"What are the first 3 steps in a ransomware incident response?"
```

---

## 18. Setup & Installation Guide

### Prerequisites

| Requirement | Minimum | Check Command |
|---|---|---|
| Node.js | v22.6+ (for node:sqlite) | node --version |
| npm | v9+ | npm --version |
| Python | v3.8+ | python --version |
| Ollama | Latest (optional) | ollama --version |

> **Important:** Node.js v22.6+ is required for the built-in `node:sqlite` module. This eliminates the need for `better-sqlite3` which requires Visual Studio C++ Build Tools on Windows.

---

### Quick Start (3 Commands)

```bash
# 1. Install all dependencies
npm run setup

# 2. Initialize database & seed demo data
npm run init:db && python engine/demo_log_generator.py

# 3. Launch platform
npm start
```

Open browser: `http://localhost:5173`

---

### Individual Command Reference

```bash
npm run setup           # Install server + client npm dependencies
npm run setup:server    # Install server dependencies only
npm run setup:client    # Install client dependencies only
npm run init:db         # Create DB schema + seed users & Sigma rules
npm start               # Launch backend + frontend + telemetry agent (concurrent)
npm run server          # Launch backend server only (port 5000)
npm run client          # Launch frontend dev server only (port 5173)
npm run telemetry       # Launch Python network telemetry agent only
```

---

### Manual 3-Terminal Start

```bash
# Terminal 1 - Backend (port 5000)
node server/src/index.js

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev

# Terminal 3 - Network Telemetry Agent
python telemetry/agent.py
```

---

## 19. Operational Runbooks

### Runbook 1: Full Attack Simulation & Investigation Workflow

```
1. Open http://localhost:5173
2. Click "Attack Simulator" in nav
3. Click "Execute Attack Scenario" on "Windows Password Spray & Brute Force"
4. Switch to "SIEM Dashboard"
5. Observe new HIGH alert appear in live feed
6. Note MITRE heatmap - T1110 counter increments
7. Click alert row -> "Ask AI" for automated analysis
8. Switch to "Investigation" tab
9. Click "External IP" node -> inspect evidence panel
10. Switch to "SOAR Playbooks" tab
11. Execute "PB-BLOCK-IP" with 185.220.101.5
12. Return to Dashboard -> Resolve the alert
13. Generate forensic report in "Reports" tab
```

### Runbook 2: Network Anomaly Investigation

```
1. Open "Host Telemetry" tab
2. Click "Active Network Sockets" sub-tab
3. Identify any ESTABLISHED connections to unexpected external IPs
4. Note the PID associated with suspicious connection
5. Click "Active Process Tree" sub-tab
6. Locate the process by PID
7. Note parent process - if winword.exe/excel.exe spawned cmd.exe -> escalate
8. Switch to "SOAR Playbooks" -> Execute PB-KILL-PROC with process name
9. Switch to "SOAR Playbooks" -> Execute PB-ISOLATE-HOST
10. Switch to "Reports" -> Generate Technical Forensic Report
```

### Runbook 3: Academy Lab Completion

```
1. Open "Academy" tab
2. Select any module from the left sidebar
3. Read the theory lessons listed
4. Scroll to "Interactive Lab" section
5. Read the question carefully
6. Select your answer radio button
7. Click "Submit & Verify Lab Answer"
8. Review the technical explanation in the feedback banner
9. Correct answers mark module complete with checkmark
10. Complete all 10 modules for full curriculum coverage
```

---

## 20. MITRE ATT&CK Coverage Matrix

| Tactic | Technique | Name | Detection | Simulation |
|---|---|---|---|---|
| Initial Access | T1190 | Exploit Public-Facing Application | SIG-WEB-SQLI | sqli |
| Execution | T1059.001 | PowerShell | SIG-WIN-PS-ENC | powershell_enc |
| Credential Access | T1110 | Brute Force | SIG-WIN-4625 | brute_force |
| Command and Control | T1071.004 | DNS Protocol | SIG-NET-DNS-TUNNEL | dns_tunnel |
| Impact | T1486 | Data Encrypted for Impact | SIG-WIN-RANSOM | ransomware |

---

## 21. Security & Privacy Guarantees

| Guarantee | Implementation |
|---|---|
| 100% Offline | Zero external API calls. All assets, rules, data, and AI run locally |
| Zero Cloud Telemetry | No analytics, no beacon calls, no automatic update checks |
| Privacy First | Local workstation telemetry stored only in data/soclab.db - never transmitted |
| Safe Attack Simulations | Scenarios only generate synthetic log entries - no actual malicious execution |
| Read-Only System Monitoring | Python agent uses OS commands (netstat, arp) in read-only mode |
| Local LLM Only | Ollama called at 127.0.0.1:11434 - never to external AI services |
| No Kernel Hooks | Zero OS-level drivers or DLL injections used |

---

## 22. Known Limitations & Future Roadmap

### Current Limitations

| Issue | Details |
|---|---|
| Node.js v22+ required | node:sqlite requires Node.js >= 22.6.0 |
| Static system metrics | Real CPU/RAM/Disk requires Python psutil package |
| Static process tree | Process tree UI shows hardcoded demo data |
| No real PCAP import | Packet Analyzer uses pre-loaded mock packets |
| Single-user mode | RBAC seeded but JWT auth not enforced in API |

### Roadmap

| Priority | Feature |
|---|---|
| High | Install psutil for real CPU/RAM/Disk/Network hardware metrics |
| High | Live WebSocket log subscription (replace 4s polling) |
| High | Real PCAP file upload & pcap-parser integration |
| Medium | Custom Sigma rule editor & YAML validator in Detection Studio |
| Medium | CTF Challenge Mode with timed exercises and scoring board |
| Medium | PDF export via pdfkit for forensic reports |
| Medium | Red Team vs Blue Team scoring mode |
| Low | Docker Compose orchestration for containerized deployment |
| Low | Windows Event Log direct reader via win32evtlog Python API |
| Low | Wazuh/Suricata real log file import parser |

---

*SOCLab AI Build Documentation v1.0*
*Generated: 2026-07-30 | Platform: Windows/Linux/macOS | License: MIT*
