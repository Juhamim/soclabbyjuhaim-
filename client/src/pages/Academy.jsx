import React, { useState } from 'react';
import { BookOpen, CheckCircle, Award, Terminal, Play, HelpCircle, ChevronRight, Layers, ShieldCheck, Network, Server, FileSearch, Wifi, Webhook, Lock } from 'lucide-react';

const MODULES = [
  {
    id: 'mod-1',
    title: '1. Networking Fundamentals',
    category: 'Networking',
    description: 'Master OSI Model, TCP/IP, IP Subnetting, Routing, DNS, DHCP, and Packet Inspection.',
    lessons: [
      'OSI 7-Layer Architecture vs TCP/IP Protocol Stack',
      'IPv4 Addressing & Classless Inter-Domain Routing (CIDR)',
      'Domain Name System (DNS) & Address Resolution Protocol (ARP)',
      'TCP/UDP Header Analysis & Three-Way Handshake'
    ],
    icon: Network,
    lab: {
      title: 'Lab 1.1: Calculate Subnet Range & Identify Malicious DNS',
      question: 'What is the network address for host 192.168.1.135 with subnet mask 255.255.255.192 (/26)?',
      options: ['192.168.1.128', '192.168.1.0', '192.168.1.64', '192.168.1.192'],
      correct: 0,
      explanation: '/26 mask has block size of 64. Ranges: 0-63, 64-127, 128-191. Host .135 falls in .128 network.'
    }
  },
  {
    id: 'mod-2',
    title: '2. Advanced Network Packet Inspection',
    category: 'Networking',
    description: 'PCAP analysis, TCP flags, Wireshark filters, and protocol dissection.',
    lessons: [
      'TCP Flags: SYN, ACK, FIN, RST, PSH, URG',
      'Wireshark Display & Capture Filters',
      'PCAP Forensic Analysis Techniques',
      'Protocol Dissection: HTTP, DNS, SMB, TLS'
    ],
    icon: Wifi,
    lab: {
      title: 'Lab 2.1: Identify SYN Scan in PCAP',
      question: 'Which TCP flag combination indicates a half-open SYN scan (stealth scan)?',
      options: ['SYN then RST', 'SYN then ACK', 'SYN then FIN', 'SYN alone'],
      correct: 0,
      explanation: 'Stealth scan sends SYN, receives SYN-ACK if open, then sends RST instead of completing handshake.'
    }
  },
  {
    id: 'mod-3',
    title: '3. Operating System Security',
    category: 'OS Security',
    description: 'Windows & Linux Internals, Registry, Systemd, Process Tree Lineage, User Permissions.',
    lessons: [
      'Windows Security Identifier (SID) & ACL Access Checks',
      'Linux PAM Authentication & Privilege Escalation Paths',
      'Parent-Child Process Tree Lineage Auditing',
      'Windows Registry Run Keys & Persistence Mechanisms'
    ],
    icon: Server,
    lab: {
      title: 'Lab 3.1: Detect Suspicious Parent Process Lineage',
      question: 'Which parent process spawning cmd.exe is considered highly suspicious in Windows?',
      options: ['winword.exe (MS Word)', 'explorer.exe', 'services.exe', 'taskmgr.exe'],
      correct: 0,
      explanation: 'Office applications spawning shell interpreters (cmd.exe / powershell.exe) indicates phishing macro execution.'
    }
  },
  {
    id: 'mod-4',
    title: '4. SOC Fundamentals & Alert Triage',
    category: 'SOC',
    description: 'Tier 1/2/3 Analyst Responsibilities, Escalation Criteria, MTTD & MTTR Performance Metrics.',
    lessons: [
      'SOC Triage Workflow & Incident Lifecycle',
      'Key Performance Indicators (MTTD, MTTR, False Positive Ratio)',
      'Escalation Paths & Chain of Custody',
      'Alert Prioritization: Business Impact vs Technical Severity'
    ],
    icon: ShieldCheck,
    lab: {
      title: 'Lab 4.1: Determine Alert Escalation Priority',
      question: 'An alert shows 500 failed SSH logins followed immediately by 1 successful login from an external IP. Priority?',
      options: ['Critical (Immediate Escalation to Tier 2/IR)', 'Low (Ignore)', 'Medium (Review tomorrow)', 'Informational'],
      correct: 0,
      explanation: 'Successful login following brute force indicates compromised credentials and active breach.'
    }
  },
  {
    id: 'mod-5',
    title: '5. SIEM Log Analysis & FTS Queries',
    category: 'SIEM',
    description: 'Event IDs, Sysmon event codes, FTS5 parsing, log normalization, correlation rules.',
    lessons: [
      'Windows Event ID Reference: 4624, 4625, 4672, 4688, 4698, 4769, 1102',
      'Sysmon Event IDs: 1 (Process), 3 (Network), 7 (Image Load), 10 (Process Access), 11 (File Create)',
      'FTS5 Full-Text Search Query Syntax',
      'Building Multi-Field Correlation Rules'
    ],
    icon: FileSearch,
    lab: {
      title: 'Lab 5.1: Match Windows Event ID to Activity',
      question: 'Which Windows Security Event ID corresponds to a failed logon attempt?',
      options: ['4625', '4624', '4672', '1102'],
      correct: 0,
      explanation: 'Event ID 4625 records failed logons. Event ID 4624 records successful logons.'
    }
  },
  {
    id: 'mod-6',
    title: '6. Digital Forensics & Incident Response (DFIR)',
    category: 'Forensics',
    description: 'RAM dumps, MFT analysis, volatility, registry hives, chain of custody.',
    lessons: [
      'RAM Artifact Extraction with Volatility Framework',
      'Windows Registry Hive Analysis (SAM, SYSTEM, SOFTWARE)',
      'MFT Master File Table Forensics & Timelining',
      'Evidence Chain of Custody & Hashing (SHA-256)'
    ],
    icon: FileSearch,
    lab: {
      title: 'Lab 6.1: Memory Analysis Artifact Identification',
      question: 'Which tool is standard for analyzing raw physical RAM dumps (.raw / .vmem)?',
      options: ['Volatility Framework', 'Wireshark', 'Nmap', 'Burp Suite'],
      correct: 0,
      explanation: 'Volatility Framework is the premier open-source tool for memory forensics.'
    }
  },
  {
    id: 'mod-7',
    title: '7. Malware Analysis & Reverse Engineering',
    category: 'Malware',
    description: 'PE headers, Base64, YARA rules, static/dynamic analysis, sandboxing.',
    lessons: [
      'Portable Executable (PE) File Header Structure',
      'String Extraction & Base64 Deobfuscation Techniques',
      'YARA Rule Writing for Malware Signatures',
      'Dynamic Analysis in Sandbox Environments'
    ],
    icon: Terminal,
    lab: {
      title: 'Lab 7.1: Identify Obfuscated PowerShell Switch',
      question: 'Which PowerShell flag allows executing Base64 encoded payload strings directly?',
      options: ['-EncodedCommand (-enc)', '-NoProfile', '-ExecutionPolicy', '-WindowStyle'],
      correct: 0,
      explanation: '-EncodedCommand (-enc) accepts a base64-encoded string parameter.'
    }
  },
  {
    id: 'mod-8',
    title: '8. Threat Hunting & Hypothesis Testing',
    category: 'Threat Hunting',
    description: 'LFO analysis, C2 beacon detection, hypothesis-driven hunting, IOC sweeping.',
    lessons: [
      'Hypothesis Formulation Based on Threat Intelligence',
      'Least-Frequency-of-Occurrence (LFO) Anomaly Analysis',
      'C2 Beacon Detection: Jitter, Interval, Payload Size',
      'IOC & TTP Sweeping Across Telemetry Data'
    ],
    icon: Target,
    lab: {
      title: 'Lab 8.1: Behavioral C2 Beacon Anomaly Identification',
      question: 'A workstation connects to an external IP on port 443 every 5 minutes sending exactly 128 bytes. What is this?',
      options: ['C2 Beaconing Traffic', 'Normal Web Browsing', 'DNS Resolution', 'DHCP Lease'],
      correct: 0,
      explanation: 'Regular periodic fixed-size outbound SSL traffic is characteristic of C2 beaconing.'
    }
  },
  {
    id: 'mod-9',
    title: '9. Incident Response Frameworks (NIST 800-61 & PICERL)',
    category: 'Incident Response',
    description: 'NIST 800-61, PICERL lifecycle, preparation, containment, eradication, recovery.',
    lessons: [
      'PICERL: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned',
      'NIST 800-61 Incident Response Lifecycle',
      'Host Isolation & Network Segmentation Strategies',
      'Post-Incident Root Cause Analysis & Reporting'
    ],
    icon: ShieldCheck,
    lab: {
      title: 'Lab 9.1: Immediate Containment Procedure',
      question: 'What is the first containment action upon confirming an active ransomware infection on a host?',
      options: ['Isolate host network interface immediately', 'Reboot the system', 'Delete infected files', 'Format disk'],
      correct: 0,
      explanation: 'Network isolation stops lateral movement to network shares and secondary domain hosts.'
    }
  },
  {
    id: 'mod-10',
    title: '10. MITRE ATT&CK Framework Mapping',
    category: 'MITRE',
    description: 'All 14 tactics, techniques, sub-techniques, detection methods, and mitigations.',
    lessons: [
      'MITRE ATT&CK Matrix Navigation & 14 Enterprise Tactics',
      'Technique Mapping to Log Sources & Detection Rules',
      'Sub-Technique Granularity: T1059.001 vs T1059.003',
      'Emulation Planning vs Detection Gap Analysis'
    ],
    icon: BookOpen,
    lab: {
      title: 'Lab 10.1: MITRE Technique Mapping',
      question: 'Which MITRE technique ID corresponds to Password Spraying / Brute Force?',
      options: ['T1110', 'T1059', 'T1190', 'T1486'],
      correct: 0,
      explanation: 'T1110 represents Credential Access via Brute Force and Password Spraying.'
    }
  },
  {
    id: 'mod-11',
    title: '11. Detection Engineering & Sigma Rules',
    category: 'Detection Eng',
    description: 'Sigma YAML syntax, false-positive reduction, logsource mapping, detection logic.',
    lessons: [
      'Sigma Rule YAML Grammar & Required Fields',
      'Detecting Specific Event IDs, Process Names, and Payload Patterns',
      'False Positive Reduction with Field-Level Conditions',
      'Multi-Rule Correlation & Aggregation'
    ],
    icon: Layers,
    lab: {
      title: 'Lab 11.1: Sigma Rule Selection Syntax',
      question: 'In Sigma rule syntax, which section specifies the exact event matching logic?',
      options: ['detection:', 'logsource:', 'level:', 'author:'],
      correct: 0,
      explanation: 'The detection: section defines the selection criteria and condition boolean logic.'
    }
  },
  {
    id: 'mod-12',
    title: '12. Firewall & Network Defense',
    category: 'Network Defense',
    description: 'Stateful vs stateless firewalls, Suricata/Snort rules, IDS/IPS concepts.',
    lessons: [
      'Stateful vs Stateless Firewall Architecture',
      'Suricata IDS/IPS Rule Syntax & Protocol Detection',
      'Snort Rule Writing for Network Threats',
      'DMZ Architecture & Network Segmentation'
    ],
    icon: Shield,
    lab: {
      title: 'Lab 12.1: Suricata Rule Action Identification',
      question: 'Which Suricata rule action both detects AND actively blocks malicious traffic?',
      options: ['reject', 'alert', 'pass', 'log'],
      correct: 0,
      explanation: 'The reject action drops the packet AND sends a TCP RST/ICMP unreachable to the sender.'
    }
  },
  {
    id: 'mod-13',
    title: '13. Active Directory & Identity Security',
    category: 'AD Security',
    description: 'Kerberos, NTLM, Pass-the-Hash, Golden Ticket, Kerberoasting, AD delegation.',
    lessons: [
      'Kerberos Authentication Protocol Flow: AS-REQ, TGS-REQ, AP-REQ',
      'NTLM vs Kerberos: When and Why Each Is Used',
      'Pass-the-Hash (PtH) & Over-Pass-the-Hash Attacks',
      'Kerberos Golden Ticket & Silver Ticket Forgery'
    ],
    icon: Lock,
    lab: {
      title: 'Lab 13.1: Kerberos Attack Identification',
      question: 'Which Kerberos attack involves requesting TGS tickets for offline password cracking?',
      options: ['Kerberoasting', 'Golden Ticket', 'Pass-the-Hash', 'DCSync'],
      correct: 0,
      explanation: 'Kerberoasting requests TGS tickets for service accounts, then cracks them offline to recover plaintext passwords.'
    }
  },
  {
    id: 'mod-14',
    title: '14. Web Application Security (OWASP Top 10)',
    category: 'Web Security',
    description: 'SQLi, XSS, CSRF, SSRF, authentication bypasses, and API security.',
    lessons: [
      'OWASP Top 10: Injection, XSS, Broken Authentication, SSRF',
      'SQL Injection Types: In-band, Blind, Out-of-band',
      'Cross-Site Scripting: Reflected, Stored, DOM-based',
      'CSRF Token Bypass & SameSite Cookie Protection'
    ],
    icon: Webhook,
    lab: {
      title: 'Lab 14.1: SQL Injection Type Classification',
      question: 'An attacker sends a payload and sees database errors directly in the HTTP response. What SQLi type?',
      options: ['In-band (Error-based)', 'Blind Boolean', 'Blind Time-based', 'Out-of-band DNS'],
      correct: 0,
      explanation: 'In-band SQLi returns database errors directly in the application response payload.'
    }
  },
  {
    id: 'mod-15',
    title: '15. SOAR & Response Automation',
    category: 'SOAR',
    description: 'Playbook engineering, containment workflows, automated enrichment, orchestration.',
    lessons: [
      'SOAR Architecture: Playbooks, Connectors, Actions',
      'Playbook Engineering: Trigger → Enrich → Decide → Act',
      'Automated Containment: IP Blocking, Host Isolation, User Disable',
      'Metrics & Post-Action Review (MTTR Reduction)'
    ],
    icon: Terminal,
    lab: {
      title: 'Lab 15.1: SOAR Playbook Trigger Logic',
      question: 'In a SOAR workflow, what should happen FIRST when a critical alert fires?',
      options: ['Enrich alert with threat intelligence context', 'Isolate the affected host', 'Notify the SOC manager', 'Close the alert as false positive'],
      correct: 0,
      explanation: 'Enrichment provides context before taking containment actions, avoiding unnecessary disruptions.'
    }
  }
];

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [completedModules, setCompletedModules] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === selectedModule.lab.correct;
    if (isCorrect) {
      setFeedback({ type: 'success', message: `Correct! ${selectedModule.lab.explanation}` });
      setCompletedModules(prev => ({ ...prev, [selectedModule.id]: true }));
    } else {
      setFeedback({ type: 'error', message: 'Incorrect. Review the theory material and try again.' });
    }
    setShowExplanation(true);
  };

  const completedCount = Object.keys(completedModules).length;
  const progressPct = Math.round((completedCount / MODULES.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Left Column: Roadmap List */}
      <div className="soc-card p-5 lg:col-span-1 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 text-sky-600 mr-2" />
            SOC Cybersecurity Academy
          </h2>
          <p className="text-xs text-slate-500">15 Modules from Fundamentals to SOAR Automation</p>
        </div>

        {/* Progress Bar */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 font-semibold">Progress</span>
            <span className="font-bold text-sky-600">{completedCount}/{MODULES.length} modules</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {MODULES.map(m => {
            const isCompleted = completedModules[m.id];
            const isSelected = selectedModule.id === m.id;
            const Icon = m.icon || BookOpen;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m);
                  setSelectedOption(null);
                  setFeedback(null);
                  setShowExplanation(false);
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 font-semibold text-sky-900 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 pr-2 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <span className="block font-bold text-slate-900 truncate">{m.title}</span>
                    <span className="text-[11px] text-slate-500">{m.category}</span>
                  </div>
                </div>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Module Viewer & Lab Workspace */}
      <div className="soc-card p-6 lg:col-span-2 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full uppercase">
              {selectedModule.category}
            </span>
            {completedModules[selectedModule.id] && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <Award className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-2">{selectedModule.title}</h1>
          <p className="text-xs text-slate-600 mt-1">{selectedModule.description}</p>
        </div>

        {/* Theoretical Curriculum */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <Layers className="w-4 h-4 text-indigo-600 mr-2" />
            Curriculum Lessons & Theory
          </h4>
          <ul className="space-y-2">
            {selectedModule.lessons.map((lesson, i) => (
              <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center">
                <span className="w-5 h-5 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mr-3 shrink-0">
                  {i + 1}
                </span>
                {lesson}
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Lab Workspace */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <Terminal className="w-4 h-4 text-emerald-600 mr-2" />
              {selectedModule.lab.title}
            </h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Interactive Lab</span>
          </div>

          <p className="text-xs font-semibold text-slate-800 leading-relaxed">{selectedModule.lab.question}</p>

          <div className="space-y-2">
            {selectedModule.lab.options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedOption === idx
                    ? feedback
                      ? idx === selectedModule.lab.correct
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold'
                        : 'bg-red-100 border-red-400 text-red-900 font-semibold'
                      : 'bg-sky-100 border-sky-400 text-sky-900 font-semibold'
                    : feedback && idx === selectedModule.lab.correct
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="lab-opt"
                  checked={selectedOption === idx}
                  onChange={() => { setSelectedOption(idx); setFeedback(null); setShowExplanation(false); }}
                  disabled={!!feedback}
                  className="mr-3 text-sky-600 focus:ring-sky-500"
                />
                {opt}
              </label>
            ))}
          </div>

          <button
            onClick={handleCheckAnswer}
            disabled={selectedOption === null || !!feedback}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            Submit & Verify Lab Answer
          </button>

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-100 text-red-900 border border-red-300'
              }`}
            >
              <p className="font-bold mb-1">{feedback.type === 'success' ? 'Correct!' : 'Incorrect'}</p>
              <p>{feedback.type === 'success' ? selectedModule.lab.explanation : 'Review the theory material and try again.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
