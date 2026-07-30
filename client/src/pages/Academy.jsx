import React, { useState } from 'react';
import { BookOpen, CheckCircle, Award, Terminal, Play, HelpCircle, ChevronRight, Layers, ShieldCheck } from 'lucide-react';

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
      explanation: '/26 mask has block size of 64. Ranges: 0-63, 64-127, 128-191. Host .135 falls in .128 network.'
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
    description: 'Log Parsing Regex, Field Extraction, Normalization, Correlation Rule Writing.',
    lessons: ['Log Aggregation Pipelines', 'FTS5 Indexing & Search Primitives', 'Building Correlation Logic'],
    lab: {
      title: 'Lab 4.1: Identify Windows Event ID for Failed Login',
      question: 'Which Windows Security Event ID corresponds to a failed logon attempt?',
      options: ['4625', '4624', '4672', '1102'],
      correct: 0,
      explanation: 'Event ID 4625 records failed logons. Event ID 4624 records successful logons.'
    }
  },
  {
    id: 'mod-5',
    title: '5. Digital Forensics (DFIR)',
    category: 'Forensics',
    description: 'Memory Dump Analysis, Registry Hive Timelines, MFT Analysis, Hash Verification.',
    lessons: ['RAM Artifact Extraction', 'Windows Registry Hive Analysis', 'MFT Master File Table Forensics'],
    lab: {
      title: 'Lab 5.1: Memory Analysis Artifact Identification',
      question: 'Which tool is standard for analyzing raw physical RAM dumps (.raw / .vmem)?',
      options: ['Volatility Framework', 'Wireshark', 'Nmap', 'Burp Suite'],
      correct: 0,
      explanation: 'Volatility Framework is the premier open-source tool for memory forensics.'
    }
  },
  {
    id: 'mod-6',
    title: '6. Malware Analysis',
    category: 'Malware',
    description: 'Static PE Header Inspection, String Extraction, Dynamic Sandbox Monitoring, YARA.',
    lessons: ['Portable Executable (PE) File Headers', 'String Extraction & Deobfuscation', 'YARA Rule Scanning'],
    lab: {
      title: 'Lab 6.1: Identify Obfuscated PowerShell Switch',
      question: 'Which PowerShell flag allows executing Base64 encoded payload strings directly?',
      options: ['-EncodedCommand (-enc)', '-NoProfile', '-ExecutionPolicy', '-WindowStyle'],
      correct: 0,
      explanation: '-EncodedCommand (-enc) accepts a base64-encoded string parameter.'
    }
  },
  {
    id: 'mod-7',
    title: '7. Threat Hunting',
    category: 'Threat Hunting',
    description: 'Hypothesis-driven hunting, IOC sweeping, behavioral baselining, MITRE mapping.',
    lessons: ['Hypothesis Formulation', 'Least-Frequency-of-Occurrence Analysis', 'IOC Sweeping'],
    lab: {
      title: 'Lab 7.1: Behavioral Anomaly Identification',
      question: 'A workstation connects to an external IP on port 443 every 5 minutes sending exactly 128 bytes. What is this?',
      options: ['C2 Beaconing Traffic', 'Normal Web Browsing', 'DNS Resolution', 'DHCP Lease'],
      correct: 0,
      explanation: 'Regular periodic fixed-size outbound SSL traffic is characteristic of C2 beaconing.'
    }
  },
  {
    id: 'mod-8',
    title: '8. Incident Response (PICERL)',
    category: 'Incident Response',
    description: 'Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.',
    lessons: ['PICERL Framework Steps', 'Host Isolation Strategies', 'Post-Incident Root Cause Analysis'],
    lab: {
      title: 'Lab 8.1: Immediate Containment Procedure',
      question: 'What is the first containment action upon confirming an active ransomware infection on a host?',
      options: ['Isolate host network interface immediately', 'Reboot the system', 'Delete infected files', 'Format disk'],
      correct: 0,
      explanation: 'Network isolation stops lateral movement to network shares and secondary domain hosts.'
    }
  },
  {
    id: 'mod-9',
    title: '9. MITRE ATT&CK Framework',
    category: 'MITRE',
    description: 'Master all 14 tactics and techniques, log signatures, mitigations, and detection rules.',
    lessons: ['ATT&CK Matrix Navigation', 'Technique Mapping to Logs', 'Emulation vs Detection'],
    lab: {
      title: 'Lab 9.1: Technique Mapping',
      question: 'Which MITRE technique ID corresponds to Password Spraying / Brute Force?',
      options: ['T1110', 'T1059', 'T1190', 'T1486'],
      correct: 0,
      explanation: 'T1110 represents Credential Access via Brute Force and Password Spraying.'
    }
  },
  {
    id: 'mod-10',
    title: '10. Detection Engineering',
    category: 'Detection Eng',
    description: 'Write, test, and tune Sigma rules and YARA signatures to eliminate false positives.',
    lessons: ['Sigma YAML Rule Grammar', 'Testing Rules Against Event Telemetry', 'False Positive Reduction'],
    lab: {
      title: 'Lab 10.1: Sigma Rule Selection Syntax',
      question: 'In Sigma rule syntax, which section specifies the exact event matching logic?',
      options: ['detection:', 'logsource:', 'level:', 'author:'],
      correct: 0,
      explanation: 'The detection: section defines the selection criteria and condition boolean logic.'
    }
  }
];

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [completedModules, setCompletedModules] = useState({});

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === selectedModule.lab.correct;
    if (isCorrect) {
      setFeedback({ type: 'success', message: `Correct! ${selectedModule.lab.explanation}` });
      setCompletedModules(prev => ({ ...prev, [selectedModule.id]: true }));
    } else {
      setFeedback({ type: 'error', message: 'Incorrect. Review the theory material and try again.' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Left Column: Roadmap List */}
      <div className="soc-card p-5 lg:col-span-1 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 text-sky-600 mr-2" />
            SOC Cybersecurity Academy
          </h2>
          <p className="text-xs text-slate-500">10 Guided Modules from Fundamentals to Detection Engineering</p>
        </div>

        <div className="space-y-2">
          {MODULES.map(m => {
            const isCompleted = completedModules[m.id];
            const isSelected = selectedModule.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m);
                  setSelectedOption(null);
                  setFeedback(null);
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 font-semibold text-sky-900 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="pr-2 truncate">
                  <span className="block font-bold text-slate-900 truncate">{m.title}</span>
                  <span className="text-[11px] text-slate-500">{m.category}</span>
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
          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full uppercase">
            {selectedModule.category}
          </span>
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
                <span className="w-5 h-5 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mr-3">
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
                    ? 'bg-sky-100 border-sky-400 text-sky-900 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="lab-opt"
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="mr-3 text-sky-600 focus:ring-sky-500"
                />
                {opt}
              </label>
            ))}
          </div>

          <button
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
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
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
