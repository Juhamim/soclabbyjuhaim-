import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock, AlertTriangle, RefreshCw, FileText, Check, Shield } from 'lucide-react';

const EVALUATION_TASKS = [
  {
    id: 'task-1',
    name: 'Task 1: Suspicious Process & Base64 Payload Identification',
    category: 'Malware & Log Analysis',
    description: 'Analyze the recent Sysmon log stream to identify the parameter flag used to execute Base64-encoded PowerShell strings.',
    question: 'Which PowerShell parameter flag indicates Base64 payload execution?',
    options: ['-EncodedCommand (-enc)', '-ExecutionPolicy Bypass', '-NoProfile', '-WindowStyle Hidden'],
    correct: 0,
    explanation: '-EncodedCommand (or -enc) allows execution of Base64 encoded Unicode command strings in PowerShell.'
  },
  {
    id: 'task-2',
    name: 'Task 2: Brute Force Attack Containment Protocol',
    category: 'SOC Triage & SOAR',
    description: 'An external IP (185.220.101.5) is generating Event ID 4625 failed logons against Domain Controller accounts. What is the immediate primary containment action?',
    question: 'What is the primary containment action for an active password spray attack?',
    options: ['Execute PB-BLOCK-IP to drop inbound traffic from attacker IP', 'Reboot the Domain Controller', 'Delete Windows Event Logs', 'Ignore until 10,000 attempts'],
    correct: 0,
    explanation: 'Blocking the attacker IP address at the firewall boundary immediately halts ongoing password spraying.'
  },
  {
    id: 'task-3',
    name: 'Task 3: Emergency Ransomware Mitigation',
    category: 'Incident Response',
    description: 'You detect vssadmin.exe delete shadows /all /quiet running on WORKSTATION-01. What is the very first Incident Response action?',
    question: 'What is the immediate first action upon detecting active ransomware shadow copy deletion?',
    options: ['Execute PB-ISOLATE-HOST to isolate the host interface immediately', 'Email executive management', 'Wait for encryption to finish', 'Restart the workstation'],
    correct: 0,
    explanation: 'Host network isolation stops ransomware from spreading laterally to other servers on the network.'
  },
  {
    id: 'task-4',
    name: 'Task 4: Subnet Range & Network Protocol Calculation',
    category: 'Networking Fundamentals',
    description: 'Host 192.168.1.135 resides on a /26 subnet (subnet mask 255.255.255.192). Calculate the network ID.',
    question: 'What is the network address for host 192.168.1.135/26?',
    options: ['192.168.1.128', '192.168.1.0', '192.168.1.64', '192.168.1.192'],
    correct: 0,
    explanation: 'A /26 mask has a block size of 64. Network subnets: .0, .64, .128, .192. Host .135 falls inside .128.'
  },
  {
    id: 'task-5',
    name: 'Task 5: Sigma Detection Rule Syntax Verification',
    category: 'Detection Engineering',
    description: 'Which section of a standard Sigma rule YAML file defines the log matching criteria and boolean selection logic?',
    question: 'Which Sigma YAML block contains the event selection keys and matching conditions?',
    options: ['detection:', 'logsource:', 'title:', 'level:'],
    correct: 0,
    explanation: 'The detection: section specifies the selection key-value pairs and condition matching logic.'
  }
];

export default function Evaluation() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  const handleSelectOption = (taskId, idx) => {
    setAnswers(prev => ({ ...prev, [taskId]: idx }));
  };

  const handleVerifyTask = (task) => {
    const isCorrect = answers[task.id] === task.correct;
    setSubmitted(prev => ({ ...prev, [task.id]: { isCorrect, explanation: task.explanation } }));

    if (isCorrect) {
      setCompletedCount(prev => prev + 1);
      fetch('/api/academy/complete-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: 'EVAL', lab_id: task.id, score: 100 })
      }).catch(console.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Skill Certification</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Knowledge & Practical Skill Evaluation</h2>
        <p className="text-xs text-slate-500">Test your practical SOC analysis, threat hunting, networking, and incident response knowledge</p>
      </div>

      {/* Progress Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Evaluation Tasks</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{EVALUATION_TASKS.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tasks Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{completedCount} / {EVALUATION_TASKS.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skill Score Percentage</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{Math.round((completedCount / EVALUATION_TASKS.length) * 100)}%</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {EVALUATION_TASKS.map(t => {
          const res = submitted[t.id];
          return (
            <div key={t.id} className="card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="badge badge-indigo">{t.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{t.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                </div>
                {res?.isCorrect && (
                  <span className="badge badge-stable"><CheckCircle className="w-3 h-3" /> PASSED</span>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800">{t.question}</p>
                <div className="space-y-2">
                  {t.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="radio"
                        name={t.id}
                        checked={answers[t.id] === idx}
                        onChange={() => handleSelectOption(t.id, idx)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyTask(t)}
                  disabled={answers[t.id] === undefined}
                  className="btn btn-primary btn-sm mt-2"
                >
                  Verify Task Submission
                </button>

                {res && (
                  <div className={`p-3 rounded-lg text-xs ${res.isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <p className="font-bold">{res.isCorrect ? '✓ Task Passed!' : '✕ Incorrect Answer'}</p>
                    <p className="mt-1">{res.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
