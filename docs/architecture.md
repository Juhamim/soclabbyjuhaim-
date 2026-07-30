# SOCLab AI Architecture & Technical Specification
**Offline Security Operations Center (SOC) Learning, Simulation, Detection & Incident Response Platform**

---

## 1. System Overview

SOCLab AI is a fully offline, enterprise-grade Security Operations Center (SOC) simulator, cyber range, detection lab, and cybersecurity learning platform designed to run locally on a workstation (Windows/Linux/macOS). 

The platform seamlessly integrates:
1. **Real-time Host Telemetry & System Network Monitoring**: Captures live Windows Event Logs, Sysmon, process activity, network interface packet metrics, active TCP/UDP socket connections, DNS requests, listening ports, ARP tables, and system resource metrics safely without external data exfiltration.
2. **Enterprise SIEM & SOC Dashboard**: Features live alert feeds, interactive log query engine, real-time charts, attack timeline, security score calculator, and interactive MITRE ATT&CK® heatmap with a crisp, modern, professional Light SOC theme (and toggleable dark mode).
3. **Cybersecurity Academy**: 10 comprehensive modules (Networking, OS Security, SOC, SIEM, Forensics, Malware, Threat Hunting, IR, MITRE, Detection Engineering) with interactive labs, quizzes, and simulations.
4. **Attack Simulator & Cyber Range**: One-click execution of 20+ realistic attack scenarios (Brute force, Credential Spray, SQLi, XSS, Reverse Shell, Ransomware behavior, DNS Tunneling, ARP Spoofing, etc.) generating synthetic telemetry.
5. **Real Detection Engine**: Multi-stage detection engine executing Sigma rules, YARA scans, correlation logic, behavioral anomaly scoring, and IOC matching against host & synthetic logs.
6. **Investigation Lab & Packet Analyzer**: Wireshark-equivalent web packet inspector (PCAP viewer, hex viewer, protocol dissector) and graph-based incident investigation workspace.
7. **SOAR Playbooks & Containment**: Interactive Playbook execution (Kill Process, Block IP, Isolate Host, Disable Account, Generate Forensics Package).
8. **Local AI SOC Analyst (Ollama Integration)**: Offline LLM assistant for log interpretation, alert summarization, Sigma/YARA rule generation, and guided investigation recommendations.

---

## 2. System Architecture Diagram

```mermaid
flowchart TB
    subgraph UI ["Frontend (React 18 + Vite + Tailwind/CSS SOC Design System)"]
        Dashboard["SIEM & SOC Dashboard"]
        Academy["Cybersecurity Academy (10 Modules)"]
        AttackSimUI["Attack Simulator & Cyber Range UI"]
        Investigator["Incident Investigation & Graph Lab"]
        PacketUI["Packet Analyzer & Hex Viewer"]
        DetectionUI["Detection & Rule Studio (Sigma/YARA)"]
        PlaybookUI["SOAR Playbooks Workspace"]
        AIAssistantUI["Ollama AI Assistant Chat"]
    end

    subgraph CoreServer ["Backend Server (Node.js Express + WebSocket Server)"]
        APIRouter["REST API Router"]
        WSServer["WebSocket Stream Manager"]
        TelemetryConsumer["Telemetry Ingestion & Parsing Engine"]
        SigmaEngineJS["Sigma & Correlation Detection Engine"]
        LogIndexEngine["SQLite FTS5 Log Indexing & Query Engine"]
        SOARRunner["SOAR Execution Engine"]
        ReportGen["PDF/MD Report Generator"]
        AuthRBAC["RBAC & Session Manager"]
    end

    subgraph TelemetryAgent ["Local System Telemetry Agent (Python 3)"]
        WinEventCollector["Windows Event Log & Sysmon Collector"]
        ProcMonitor["Process & Parent-Child Tree Tracker"]
        NetMonitor["Socket, ARP & DNS Monitor"]
        SysMetrics["CPU, RAM, Disk & Hardware Monitor"]
        FileMonitor["File Integrity & Registry Change Tracker"]
    end

    subgraph DataEngine ["Attack & Demo Log Generator (Python / JS Engine)"]
        SyntheticGen["Enterprise Log Generator (50k+ events)"]
        AttackRunner["Safe Attack Scenario Executor"]
        YARAEngine["YARA File & Memory Scanner"]
    end

    subgraph Storage ["Offline Storage Layer (Local Workstation)"]
        SQLiteDB[("SQLite Database (Logs, Alerts, Labs, Users, Rules)")]
        FTS5Index[("FTS5 Full-Text Log Index")]
        PcapStore[("Local PCAP & Artifact File Store")]
    end

    subgraph OllamaAI ["Local LLM Service"]
        OllamaAPI["Ollama Local API (llama3 / mistral / qwen)"]
    end

    %% Connections
    UI <-->|REST & WebSockets| CoreServer
    TelemetryAgent -->|Local HTTP/WS Pipeline| TelemetryConsumer
    DataEngine -->|Synthetic Telemetry & Alerts| TelemetryConsumer
    CoreServer <--> Storage
    CoreServer <-->|Local REST (11434)| OllamaAI
```

---

## 3. High-Level Directory & Module Structure

```
soc-simulator/
├── client/                     # Frontend UI (React + Vite + Tailwind CSS + Lucide Icons + Recharts)
│   ├── public/                 # Static assets, fonts, pre-loaded PCAPs
│   ├── src/
│   │   ├── components/         # Reusable SOC UI components (Terminal, MetricCard, Timeline, Graph)
│   │   ├── context/            # Socket & State Contexts (AuthContext, TelemetryContext, SOCContext)
│   │   ├── pages/              # Primary Views
│   │   │   ├── Dashboard.jsx   # Live SIEM Dashboard
│   │   │   ├── Academy.jsx     # Cybersecurity Academy & Interactive Modules
│   │   │   ├── Attacks.jsx     # Attack Simulator & Cyber Range
│   │   │   ├── Detection.jsx   # Sigma & YARA Rule Manager & Detection Lab
│   │   │   ├── Investigation.jsx # Graph-based Incident Investigation Lab
│   │   │   ├── PacketAnalyzer.jsx # Wireshark-like PCAP & Protocol Inspection
│   │   │   ├── Playbooks.jsx   # SOAR Playbook Automation Engine
│   │   │   ├── Telemetry.jsx   # Live Local Host Telemetry & Device Monitoring
│   │   │   ├── Reports.jsx     # Executive & Forensic Report Generator
│   │   │   └── Settings.jsx    # User Management, RBAC, Ollama Model Settings
│   │   └── styles/             # Dark Futuristic Cyber Theme Design Tokens
├── server/                     # Core Backend Application
│   ├── src/
│   │   ├── config/             # Database initialization, SQLite schemas
│   │   ├── controllers/        # Handlers for API endpoints
│   │   ├── middleware/         # Auth, RBAC, Audit Logging
│   │   ├── routes/             # API Routes
│   │   ├── services/           # Detection engine, SOAR executor, Report engine, Ollama service
│   │   ├── websocket/          # Live log & alert streaming websocket gateway
│   │   └── index.js            # Server entry point
├── telemetry/                  # Python Host Telemetry Collection Agent
│   ├── agent.py                # Main collector process
│   ├── modules/                # Collectors (win_events, processes, network, hardware, registry)
│   └── requirements.txt
├── engine/                     # Detection & Attack Simulation Engine
│   ├── attack_simulator.py    # Safe attack scenario runners
│   ├── demo_log_generator.py  # Generates 50,000+ realistic logs across 15+ log sources
│   ├── yara_scanner.py         # YARA file & memory scanner script
│   └── rules/                  # Sigma Rules repository & YARA definitions
├── data/                       # Local SQLite DB, Seed Datasets, Demo PCAPs, Lab Materials
├── docs/                       # Complete Offline Documentation
│   ├── architecture.md
│   ├── soc_handbook.md
│   ├── mitre_guide.md
│   ├── sigma_yara_guide.md
│   └── api_docs.md
└── package.json                # Main workspace orchestrator & setup scripts
```

---

## 4. Data Pipeline & Schema Design

### 4.1 Database Schema (SQLite)

```sql
-- Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'soc_manager', 'tier1', 'tier2', 'tier3', 'threat_hunter', 'ir_team', 'read_only')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs (FTS5 Enabled for Instant Sub-Second Search)
CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    source_type TEXT NOT NULL, -- 'windows_event', 'sysmon', 'firewall', 'dns', 'suricata', 'zeek', etc.
    host_name TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('DEBUG', 'INFO', 'WARNING', 'HIGH', 'CRITICAL')),
    event_id INTEGER,
    process_name TEXT,
    user_name TEXT,
    src_ip TEXT,
    dest_ip TEXT,
    raw_payload JSON NOT NULL,
    is_simulated BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE IF NOT EXISTS logs_fts USING fts5(
    id UNINDEXED,
    timestamp UNINDEXED,
    source_type,
    host_name,
    process_name,
    user_name,
    src_ip,
    dest_ip,
    raw_payload
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
    mitre_tactic TEXT,
    mitre_technique TEXT,
    description TEXT,
    source_log_id TEXT,
    status TEXT CHECK(status IN ('NEW', 'IN_PROGRESS', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE')) DEFAULT 'NEW',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    mitre_techniques TEXT, -- JSON array
    evidence_items TEXT,   -- JSON array
    assigned_to TEXT,
    summary TEXT,
    root_cause TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sigma Rules
CREATE TABLE IF NOT EXISTS sigma_rules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'stable',
    description TEXT,
    author TEXT,
    logsource JSON NOT NULL,
    detection JSON NOT NULL,
    level TEXT NOT NULL,
    tags JSON, -- MITRE technique IDs e.g. ["attack.t1059.001"]
    is_custom BOOLEAN DEFAULT 0,
    enabled BOOLEAN DEFAULT 1
);

-- Academy Labs Progress
CREATE TABLE IF NOT EXISTS lab_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    lab_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'NOT_STARTED',
    score INTEGER DEFAULT 0,
    completed_at DATETIME
);
```

---

## 5. Key Module Specifications

### 5.1 Real-Time Local Host Telemetry Engine
- Safe, read-only collection of local workstation metrics:
  - System performance: CPU %, Memory usage, Disk IO, Network Bandwidth.
  - Active Processes: PID, Name, Path, Parent PID, Memory usage, CPU load.
  - Socket Connections: Local IP, Remote IP, State (ESTABLISHED, LISTENING), Protocol (TCP/UDP), Process association.
  - User Sessions: Currently logged-in local users.
  - Windows Event Log / Sysmon Parser (via PowerShell/`win32evtlog` Python fallback) reading Security (4624, 4625, 4672, 4720), System, and PowerShell execution events.

### 5.2 Enterprise SIEM & SOC Dashboard UI
- Futuristic Cyber UI design with dark mode color palette (`#0a0f1d`, `#121b2d`, cyan `#00f2fe`, neon green `#00ff87`, amber `#ffab00`, crimson `#ff3366`).
- Live metrics streaming via WebSocket (2-second interval).
- Interactive query builder with FTS5 search (e.g. `source_type:windows_event AND EventID:4625 AND src_ip:192.168.1.100`).
- Interactive MITRE ATT&CK Matrix Heatmap displaying active technique detections with drill-down capability.
- Security Score & Risk Meter dynamically computed from open alerts and active host vulnerabilities.

### 5.3 Cybersecurity Academy (10 Modules)
1. **Networking Fundamentals**: Interactive packet visualization, IP/Subnet calculator, protocol hierarchy dissector, ARP/DNS/DHCP labs.
2. **Operating System Security**: Process tree explorer, permission matrix builder, Windows registry & Linux `/etc` permission audit.
3. **SOC Fundamentals**: Alert triage simulation, MTTD/MTTR metric tracking, Tier 1 -> Tier 2 escalation flow.
4. **SIEM Fundamentals**: Log parsing playground, field extraction, correlation rule builder.
5. **Digital Forensics**: Memory dump string analyzer, registry hive timeline viewer, browser history & USB artifact analysis.
6. **Malware Analysis**: Static PE file inspector (Headers, Imports, Hashes, Strings) & YARA signature scanner.
7. **Threat Hunting**: Hypothesis-driven hunting workspace, IOC match query builder, behavioral baseline vs anomaly checker.
8. **Incident Response**: PICERL framework step-by-step incident response playbook exercise.
9. **MITRE ATT&CK**: Matrix navigator, technique deep-dive with realistic log samples and detection mitigations.
10. **Detection Engineering**: Sigma rule authoring editor with real-time validator against sample event logs.

### 5.4 Cyber Range & Attack Simulator
- 20+ Pre-packaged, zero-risk attack simulations:
  - **Brute Force & Password Spray**: Generates Windows 4625 / SSH failed login logs.
  - **SQL Injection & XSS**: Generates web server (Apache/Nginx) request logs containing payloads.
  - **Reverse Shell & Command Execution**: Generates Sysmon Event ID 1 (Process Create) with suspicious PowerShell encoded commands (`powershell -enc ...`).
  - **Ransomware Activity**: Simulates bulk file extension change telemetry & vssadmin shadowcopy deletion logs.
  - **DNS Tunneling & Data Exfiltration**: Generates high-frequency long subdomain DNS request logs (`xyz123.attacker.com`).
  - **ARP Spoofing / MITM**: Generates network layer anomaly alerts.
- Live attack execution updates the SOC Dashboard in real-time, populating alerts, logs, timeline, and MITRE heatmap.

### 5.5 Investigation Lab & Packet Analyzer
- **Graph-Based Incident Investigator**: Node-graph showing Relationships between Host <-> Process <-> User <-> Network IP <-> File Hash <-> MITRE Alert.
- **Web-based Packet Analyzer**: Parses PCAPs using JS dissector into Packet List, Frame Overview, Protocol Details Tree, and Raw Hex View with ASCII decoder.

### 5.6 Local AI SOC Analyst (Ollama Integration)
- Connects directly to local Ollama instance (`http://localhost:11434`).
- Configurable models (`llama3`, `mistral`, `qwen2.5-coder`, `phi3`).
- Built-in heuristic rule-based AI fallback if Ollama is not running.
- Features:
  - **Log & Alert Explainer**: Breaks down raw JSON/EVTX logs into human-readable plain text explanations.
  - **Sigma & YARA Generator**: Translates natural language descriptions into valid Sigma YAML or YARA rules.
  - **Incident Assistant**: Suggests immediate containment actions and evidence gathering steps.

---

## 6. One-Command Setup & Cross-Platform Execution

The application is structured for instant setup:
- Root `npm run setup` initializes database, populates 50,000+ realistic enterprise demo logs, installs node dependencies, and sets up Python virtualenv.
- Root `npm start` launches both Backend Express Server + WebSocket Gateway, Telemetry Agent, and Frontend React App concurrently.

---

## 7. Security, Privacy & Reliability Constraints

- **Offline Operating Guarantee**: Zero external API network calls. All static assets, fonts, icons, libraries, and documentation are bundled locally.
- **Host Safety**: Attack simulations run purely in synthetic memory/log generator mode or isolated mock handlers — never placing actual host machine at risk.
- **Privacy First**: Local host telemetry stays strictly within the SQLite database on disk and is never transmitted out of the local workstation.
