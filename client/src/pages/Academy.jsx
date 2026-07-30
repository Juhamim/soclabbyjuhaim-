import React, { useState } from 'react';
import { BookOpen, CheckCircle, Award, Terminal, HelpCircle, ShieldCheck } from 'lucide-react';

const MODULES = [
  {
    id: 'mod-1',
    title: '1. Networking Fundamentals',
    category: 'Networking',
    description: 'Master OSI Model, TCP/IP, IP Subnetting, Routing, DNS, DHCP, and Packet Inspection.',
    lessons: [
      'OSI 7-Layer Architecture vs TCP/IP Protocol Stack',
      'IPv4 Addressing & Classless Inter-Domain Routing (CIDR)',
      'Domain Name System (DNS) & Address Resolution Protocol (ARP)'
    ],
    lab: {
      title: 'Lab 1.1: Calculate Subnet Range & Identify Malicious DNS',
      question: 'What is the network address for host 192.168.1.135 with subnet mask 255.255.255.192 (/26)?',
      options: ['192.168.1.128', '192.168.1.0', '192.168.1.64', '192.168.1.192'],
      correct: 0,
      explanation: '/26 mask has block size of 64. Subnet ranges: 0-63, 64-127, 128-191. Host .135 falls inside .128 network.'
    }
  },
  {
    id: 'mod-2',
    title: '2. Operating System Security',
    category: 'OS Security',
    description: 'Windows & Linux Internals, Registry, Systemd, Process Tree Lineage, User Permissions.',
    lessons: [
      'Windows Security Identifier (SID) & ACL Access Checks',
      'Linux PAM Authentication & Privilege Escalation Paths',
      'Parent-Child Process Tree Lineage Auditing'
    ],
    lab: {
      title: 'Lab 2.1: Detect Suspicious Parent Process Lineage',
      question: 'Which parent process spawning cmd.exe is considered highly suspicious in Windows?',
      options: ['winword.exe (MS Word)', 'explorer.exe', 'services.exe', 'taskmgr.exe'],
      correct: 0,
      explanation: 'Office applications spawning shell interpreters (cmd.exe / powershell.exe) indicates phishing macro execution.'
    }
  },
  {
    id: 'mod-3',
    title: '3. SOC Fundamentals & Alert Triage',
    category: 'SOC',
    description: 'Tier 1/2/3 Analyst Responsibilities, Escalation Criteria, MTTD & MTTR Performance Metrics.',
    lessons: [
      'SOC Triage Workflow & Incident Lifecycle',
      'Key Performance Indicators (MTTD, MTTR, False Positive Ratio)',
      'Escalation Paths & Chain of Custody'
    ],
    lab: {
      title: 'Lab 3.1: Determine Alert Escalation Priority',
      question: 'An alert shows 500 failed SSH logins followed immediately by 1 successful login from an external IP. Priority?',
      options: ['Critical (Immediate Escalation to Tier 2/IR)', 'Low (Ignore)', 'Medium (Review tomorrow)', 'Informational'],
      correct: 0,
      explanation: 'Successful login following brute force indicates compromised credentials and active breach.'
    }
  },
  {
    id: 'mod-4',
    title: '4. SIEM Fundamentals & Log Parsing',
    category: 'SIEM',
    description: 'Log Aggregation Pipelines, FTS Indexing, Event Correlation, Windows Event IDs, Sysmon.',
    lessons: [
      'Windows Event Security Logging (4624, 4625, 4672, 4720, 1102)',
      'Sysmon Process Creation & Network Connection Tracing',
      'Building SQL / FTS Log Search Queries'
    ],
    lab: {
      title: 'Lab 4.1: Identify Windows Event ID for Failed Logon',
      question: 'Which Windows Event ID records a failed user authentication logon attempt?',
      options: ['4625', '4624', '4672', '1102'],
      correct: 0,
      explanation: 'Event ID 4625 is generated when an authentication request fails on Windows.'
    }
  },
  {
    id: 'mod-5',
    title: '5. Digital Forensics (DFIR)',
    category: 'DFIR',
    description: 'RAM Artifact Extraction, Volatility Framework, Registry Hive Analysis, MFT File System Forensics.',
    lessons: [
      'Volatile Memory Capture & Artifact Analysis',
      'Windows Registry Hives (SYSTEM, SAM, NTUSER.DAT)',
      'Master File Table (MFT) & USN Journal Timeline Reconstruction'
    ],
    lab: {
      title: 'Lab 5.1: Select RAM Memory Forensics Framework',
      question: 'Which open-source tool is standard for analyzing raw RAM memory dumps for process artifacts?',
      options: ['Volatility Framework', 'Wireshark', 'Nmap', 'Metasploit'],
      correct: 0,
      explanation: 'Volatility is the industry standard open-source memory forensics analysis framework.'
    }
  },
  {
    id: 'mod-6',
    title: '6. Malware Analysis & Reverse Engineering',
    category: 'Malware',
    description: 'Static & Dynamic Malware Analysis, PE Headers, Base64 Deobfuscation, YARA Rule Writing.',
    lessons: [
      'PE Header Structure & Import Address Table (IAT) Inspection',
      'Deobfuscating Encoded PowerShell & VBScript Payloads',
      'Writing YARA Rules for File Signature Detection'
    ],
    lab: {
      title: 'Lab 6.1: Identify Encoded PowerShell Flag',
      question: 'Which PowerShell command switch is commonly used by malware to pass Base64-encoded scripts?',
      options: ['-EncodedCommand (-enc)', '-NoLogo', '-NonInteractive', '-Command'],
      correct: 0,
      explanation: '-EncodedCommand accepts a Base64-encoded Unicode string command.'
    }
  },
  {
    id: 'mod-7',
    title: '7. Threat Hunting & Hypothesis Testing',
    category: 'Threat Hunting',
    description: 'Proactive Threat Sweeping, Least Frequency of Occurrence (LFO), C2 Beaconing Detection.',
    lessons: [
      'Formulating Threat Hunting Hypotheses',
      'Least Frequency of Occurrence (LFO) Anomaly Detection',
      'Identifying Periodic C2 Beaconing Traffic Patterns'
    ],
    lab: {
      title: 'Lab 7.1: Identify C2 Beaconing Characteristics',
      question: 'A workstation connects to an external IP port 443 every 30.0 seconds transmitting exactly 128 bytes. What is this?',
      options: ['C2 Beaconing Traffic', 'Normal Web Browsing', 'Windows Update', 'DNS Query'],
      correct: 0,
      explanation: 'Regular periodic connections of fixed payload size to an external IP indicate automated Command & Control beaconing.'
    }
  },
  {
    id: 'mod-8',
    title: '8. Incident Response Lifecycle (PICERL)',
    category: 'Incident Response',
    description: 'NIST 800-61 & SANS Incident Handling: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.',
    lessons: [
      'PICERL Incident Response Framework Steps',
      'Short-term vs Long-term Containment Strategies',
      'Eradication Verification & Root Cause Analysis'
    ],
    lab: {
      title: 'Lab 8.1: First Action During Active Ransomware Attack',
      question: 'Upon detecting active ransomware spreading on WORKSTATION-01, what is the immediate containment step?',
      options: ['Isolate host network interface immediately', 'Email upper management', 'Run Windows Update', 'Power off all DC servers'],
      correct: 0,
      explanation: 'Immediate network isolation stops lateral propagation of ransomware across network shares.'
    }
  },
  {
    id: 'mod-9',
    title: '9. MITRE ATT&CK Framework',
    category: 'Threat Intel',
    description: 'Mapping Tactics, Techniques, and Sub-techniques to Cyber Kill Chain and SOC Detections.',
    lessons: [
      'Enterprise ATT&CK Matrix Structure & 14 Tactic Categories',
      'Mapping Adversary Behaviors to Technique IDs',
      'Emulation vs Detection Coverage Gaps'
    ],
    lab: {
      title: 'Lab 9.1: Identify Brute Force MITRE ID',
      question: 'Which MITRE ATT&CK technique ID corresponds to Password Spraying & Brute Force attacks?',
      options: ['T1110', 'T1059', 'T1071', 'T1486'],
      correct: 0,
      explanation: 'T1110 is the MITRE ATT&CK ID for Brute Force under Credential Access.'
    }
  },
  {
    id: 'mod-10',
    title: '10. Detection Engineering & Sigma Rules',
    category: 'Detection',
    description: 'Writing, Testing, and Deploying Open-Source Sigma Rules to SIEM Engine.',
    lessons: [
      'Sigma YAML Rule Structure (logsource, detection, selection, condition)',
      'Tuning False Positive Ratios in Production Rules',
      'Translating Sigma Rules to SQL / FTS Database Queries'
    ],
    lab: {
      title: 'Lab 10.1: Identify Sigma Rule Matching Block',
      question: 'Which top-level section of a Sigma YAML rule defines event matching key-value selections?',
      options: ['detection:', 'logsource:', 'title:', 'author:'],
      correct: 0,
      explanation: 'The detection: section specifies the selection logic and evaluation conditions.'
    }
  },
  {
    id: 'mod-11',
    title: '11. Advanced Network Packet Inspection',
    category: 'Networking',
    description: 'Deep Packet Inspection (DPI), Wireshark Filters, PCAP Dissection, TCP Flags, Handshake Analysis.',
    lessons: [
      'TCP 3-Way Handshake & Flag Auditing (SYN, ACK, FIN, RST)',
      'Constructing Wireshark Display Filters for Exploit Artifacts',
      'PCAP Protocol Layer Dissection (Ethernet -> IP -> TCP/UDP)'
    ],
    lab: {
      title: 'Lab 11.1: Identify Wireshark Filter for HTTP GET Requests',
      question: 'Which Wireshark filter display expression filters HTTP GET method traffic?',
      options: ['http.request.method == "GET"', 'ip.proto == http', 'tcp.port == 80', 'http.get'],
      correct: 0,
      explanation: 'http.request.method == "GET" isolates HTTP GET requests specifically.'
    }
  },
  {
    id: 'mod-12',
    title: '12. Firewall & Network Defense Systems',
    category: 'Networking',
    description: 'Stateful vs Stateless Firewalls, Network Segmentation, Intrusion Detection Systems (Suricata / Snort).',
    lessons: [
      'Stateful Inspection vs Deep Packet Filtering',
      'Suricata Rule Syntax & IDS Network Signatures',
      'Zero-Trust Network Microsegmentation'
    ],
    lab: {
      title: 'Lab 12.1: IDS Rule Action for Blocking Traffic',
      question: 'Which Suricata rule action drops malicious network packets inline on an IPS device?',
      options: ['drop', 'alert', 'pass', 'reject'],
      correct: 0,
      explanation: 'The drop action silences and drops matching malicious packets inline.'
    }
  },
  {
    id: 'mod-13',
    title: '13. Active Directory & Identity Security',
    category: 'Identity',
    description: 'Kerberos Authentication, NTLM Hashes, SPNs, Kerberoasting, Golden Ticket Attacks.',
    lessons: [
      'Kerberos Ticket Granting Ticket (TGT) & Service Ticket Flow',
      'Detecting Kerberoasting Service Ticket Requests (Event 4769)',
      'Pass-the-Hash & Privilege Escalation Mitigation'
    ],
    lab: {
      title: 'Lab 13.1: Kerberos Encryption Type for Kerberoasting',
      question: 'Which weak Kerberos ticket encryption type is targeted during Kerberoasting offline hash cracking?',
      options: ['0x17 (RC4-HMAC)', '0x12 (AES256-CTS)', '0x11 (AES128-CTS)', '0x1'],
      correct: 0,
      explanation: '0x17 indicates RC4-HMAC encryption, which is vulnerable to rapid offline password cracking.'
    }
  },
  {
    id: 'mod-14',
    title: '14. Web Application Security (OWASP Top 10)',
    category: 'Web Security',
    description: 'SQL Injection, Cross-Site Scripting (XSS), CSRF, Remote Code Execution, Web Shell Detection.',
    lessons: [
      'OWASP Top 10 Vulnerabilities Overview',
      'SQL Injection Primitives (UNION SELECT, Error-based, Blind)',
      'Identifying Web Shell Artifacts in Web Server Access Logs'
    ],
    lab: {
      title: 'Lab 14.1: Identify SQL Injection Primitive',
      question: 'Which string in an Apache access log query parameter indicates a SQL injection payload attempt?',
      options: ["UNION SELECT", "<script>", "../../../etc/passwd", "eval()"],
      correct: 0,
      explanation: 'UNION SELECT is a SQL injection primitive used to join results from another table.'
    }
  },
  {
    id: 'mod-15',
    title: '15. SOAR & Response Automation',
    category: 'Automation',
    description: 'Automated Containment Playbook Engineering, API Integrations, Incident Response Automation.',
    lessons: [
      'Automated Security Playbook Engineering Principles',
      'REST API & Webhook Integrations for Firewall & EDR Containment',
      'Auditing Automated Response Actions & Reducing Risk'
    ],
    lab: {
      title: 'Lab 15.1: Primary SOAR Containment Playbook',
      question: 'Which SOAR playbook isolates a compromised host network interface automatically?',
      options: ['PB-ISOLATE-HOST', 'PB-BLOCK-IP', 'PB-KILL-PROC', 'PB-DISABLE-USER'],
      correct: 0,
      explanation: 'PB-ISOLATE-HOST isolates the target workstation at the network interface level.'
    }
  }
];

export default function Academy() {
  const [activeMod, setActiveMod] = useState(MODULES[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [completedMods, setCompletedMods] = useState({});

  const handleVerifyLab = () => {
    if (selectedOption === activeMod.lab.correct) {
      setCompletedMods(prev => ({ ...prev, [activeMod.id]: true }));
      fetch('/api/academy/complete-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: activeMod.id, lab_id: 'lab-1', score: 100 })
      }).catch(console.error);
    }
    setLabSubmitted(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Interactive Curriculum</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Cybersecurity Academy</h2>
        <p className="text-xs text-slate-500">15 enterprise cybersecurity modules covering Networking, SOC Triage, DFIR, Malware, and SOAR</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Sidebar List */}
        <div className="card p-4 space-y-2 max-h-[600px] overflow-y-auto">
          <div className="section-label mb-3">Roadmap Modules ({MODULES.length})</div>
          {MODULES.map(m => {
            const isActive = activeMod.id === m.id;
            const isDone = completedMods[m.id];
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMod(m);
                  setSelectedOption(null);
                  setLabSubmitted(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs">{m.title}</span>
                  {isDone && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">{m.category}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Module Viewer */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          <div>
            <span className="badge badge-indigo">{activeMod.category}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">{activeMod.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeMod.description}</p>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lessons Covered:</h4>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc font-mono">
              {activeMod.lessons.map((les, i) => (
                <li key={i}>{les}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Lab Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              {activeMod.lab.title}
            </h4>
            <p className="text-xs text-slate-800 font-bold">{activeMod.lab.question}</p>

            <div className="space-y-2">
              {activeMod.lab.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="radio"
                    name="lab-opt"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleVerifyLab}
              disabled={selectedOption === null}
              className="btn btn-primary text-xs"
            >
              Submit & Verify Lab Answer
            </button>

            {labSubmitted && (
              <div className={`p-4 rounded-xl text-xs ${selectedOption === activeMod.lab.correct ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <p className="font-bold">{selectedOption === activeMod.lab.correct ? '✓ Correct Answer!' : '✕ Incorrect Answer'}</p>
                <p className="mt-1">{activeMod.lab.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
