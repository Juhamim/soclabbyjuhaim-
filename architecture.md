# SOCLab AI Architecture & Technical Specification
**Offline Security Operations Center (SOC) Learning, Simulation, Detection & Incident Response Platform**

Please see detailed architecture document in [docs/architecture.md](file:///e:/soc%20simulator/docs/architecture.md).

---

## Architecture Highlights

1. **System Core**: Node.js Express Backend + WebSocket Server + SQLite FTS5 Log Indexing.
2. **Frontend UI**: React 18 + Vite + Crisp Light SOC Design System (Slate background `#f8fafc`, crisp white card surfaces `#ffffff`, deep indigo accents `#1e1b4b`, electric cyan `#0284c7`, vivid alert badges).
3. **Telemetry & Network Collector Agent**: Safe local Python monitoring agent parsing live system network traffic, socket states, ARP tables, listening ports, Windows Event Logs, Sysmon, process trees, and hardware metrics.
4. **Cyber Range & Attack Simulator**: 20+ one-click zero-risk attack scenarios (Brute Force, SQLi, XSS, Reverse Shell, Ransomware simulation, DNS Tunneling, ARP Spoofing).
5. **Detection & Correlation Engine**: Multi-stage Sigma rule engine, YARA memory/file scanner, behavioral anomaly scoring, and IOC matcher.
6. **Investigation & Forensics Lab**: Graph node inspector (Host - Process - User - IP - MITRE alert) + Web PCAP packet analyzer with hex decoder.
7. **Cybersecurity Academy**: 10 modules (Networking, OS Security, SOC, SIEM, Forensics, Malware, Threat Hunting, IR, MITRE ATT&CK, Detection Engineering).
8. **Local AI Assistant**: Ollama LLM integration (`http://localhost:11434`) with rule-based fallback when offline.
