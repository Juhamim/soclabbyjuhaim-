import React, { useState } from 'react';
import { Flame, Play, CheckCircle, Zap, Target, Shield } from 'lucide-react';

const SCENARIOS = [
  {
    key: 'brute_force',
    title: 'Windows Password Spray & Brute Force',
    tactic: 'Credential Access',
    technique: 'T1110',
    description: 'Generates high-frequency Event ID 4625 failed logons targeting Domain Controller administrator accounts. Triggers SIG-WIN-4625 Sigma rule immediately.',
    severity: 'HIGH',
    color: '#f97316',
    icon: '🔑',
  },
  {
    key: 'powershell_enc',
    title: 'Encoded PowerShell Reverse Shell',
    tactic: 'Execution',
    technique: 'T1059.001',
    description: 'Executes Base64-encoded payload switch via powershell.exe -enc string, simulating post-exploitation C2 shell establishment.',
    severity: 'CRITICAL',
    color: '#a855f7',
    icon: '⚡',
  },
  {
    key: 'sqli',
    title: 'Web Application SQL Injection',
    tactic: 'Initial Access',
    technique: 'T1190',
    description: 'Sends automated SQL injection primitives (UNION SELECT) to web server endpoints. Triggers SIG-WEB-SQLI detection rule.',
    severity: 'HIGH',
    color: '#f43f5e',
    icon: '🗄️',
  },
  {
    key: 'dns_tunnel',
    title: 'DNS Data Exfiltration Tunneling',
    tactic: 'Command & Control',
    technique: 'T1071.004',
    description: 'Generates high-subdomain-length DNS TXT queries to attacker.com simulating data exfiltration over covert DNS channel.',
    severity: 'HIGH',
    color: '#22d3ee',
    icon: '🌐',
  },
  {
    key: 'ransomware',
    title: 'Ransomware Shadow Copy Deletion',
    tactic: 'Impact',
    technique: 'T1486',
    description: 'Executes vssadmin.exe delete shadows /all /quiet — classic ransomware pre-encryption behavior to disable backup restore.',
    severity: 'CRITICAL',
    color: '#ef4444',
    icon: '🔒',
  },
];

const SEVERITY_MAP = {
  CRITICAL: { cls: 'badge badge-critical', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  HIGH:     { cls: 'badge badge-high',     bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
};

export default function Attacks() {
  const [executing, setExecuting] = useState(null);
  const [history, setHistory] = useState([]);

  const handleLaunch = async (s) => {
    setExecuting(s.key);
    try {
      const rawPayload = {
        message: `Simulated attack: ${s.title}`,
        tactic: s.tactic,
        raw_payload:
          s.key === 'sqli'       ? 'UNION SELECT username,password FROM users--' :
          s.key === 'dns_tunnel' ? 'v8a9f8s9d8f.exfil.attacker.com TXT' :
          s.key === 'ransomware' ? 'vssadmin delete shadows /all /quiet' :
                                   '-enc JABjAGwAaQBlAG4AdAAgAD0A...',
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: s.key === 'sqli' ? 'apache' : s.key === 'dns_tunnel' ? 'zeek' : 'windows_event',
          host_name: 'WORKSTATION-01',
          severity: s.severity,
          event_id: s.key === 'brute_force' ? 4625 : 1,
          process_name: s.key === 'powershell_enc' ? 'powershell.exe' : s.key === 'ransomware' ? 'vssadmin.exe' : null,
          user_name: 'administrator',
          src_ip: '185.220.101.5',
          raw_payload: rawPayload,
          is_simulated: 1,
        }),
      });
      const data = await res.json();
      setHistory(prev => [{ ...s, time: new Date().toLocaleTimeString(), alerts: data.alertsGenerated || 1, ok: true }, ...prev]);
    } catch { setHistory(prev => [{ ...s, time: new Date().toLocaleTimeString(), alerts: 0, ok: false }, ...prev]); }
    finally { setExecuting(null); }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <h2 className="text-xl font-black text-white">Cyber Range — Attack Simulator</h2>
          <p className="text-xs" style={{ color: 'rgba(107,114,128,0.8)' }}>
            Safely launch real-world threat scenarios in a zero-risk environment to test SIEM & Sigma detection rules
          </p>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SCENARIOS.map(s => {
          const sev = SEVERITY_MAP[s.severity] || SEVERITY_MAP.HIGH;
          const isRunning = executing === s.key;
          return (
            <div
              key={s.key}
              className="glow-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden"
              style={{ borderColor: `${s.color}25` }}
            >
              {/* Ambient glow top-right */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${s.color}, transparent 70%)` }} />

              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={sev.cls}>{s.severity}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}40` }}>
                    {s.technique}
                  </span>
                  <span className="text-[9px]" style={{ color: 'rgba(107,114,128,0.7)' }}>{s.tactic}</span>
                </div>
                <h3 className="text-sm font-black text-white leading-tight mb-2">{s.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(107,114,128,0.9)' }}>{s.description}</p>
              </div>

              <button
                onClick={() => handleLaunch(s)}
                disabled={!!executing}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{
                  background: isRunning ? `${s.color}30` : `linear-gradient(135deg, ${s.color}cc, ${s.color}99)`,
                  border: `1px solid ${s.color}50`,
                  color: isRunning ? s.color : '#fff',
                  boxShadow: !executing ? `0 4px 18px -4px ${s.color}60` : 'none',
                }}
              >
                {isRunning
                  ? <><Zap className="w-3.5 h-3.5 animate-pulse" /> Executing…</>
                  : <><Play className="w-3.5 h-3.5" /> Launch Scenario</>
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* Execution Log */}
      <div className="glow-card p-5">
        <div className="section-title mb-4">
          <Target className="w-3.5 h-3.5" style={{ color: '#22d3ee' }} />
          Execution Audit Log
        </div>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Scenario</th>
                <th>Technique</th>
                <th>Severity</th>
                <th>Alerts Triggered</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-sm" style={{ color: 'rgba(107,114,128,0.4)' }}>
                  No attacks executed yet. Click Launch Scenario above.
                </td></tr>
              ) : history.map((h, i) => (
                <tr key={i}>
                  <td className="font-mono text-[10px]" style={{ color: 'rgba(107,114,128,0.7)' }}>{h.time}</td>
                  <td className="text-gray-200 text-xs font-semibold">{h.title}</td>
                  <td><span className="font-mono text-xs font-bold" style={{ color: '#a5b4fc' }}>{h.technique}</span></td>
                  <td><span className={SEVERITY_MAP[h.severity]?.cls || 'badge badge-high'}>{h.severity}</span></td>
                  <td>
                    <span className="font-bold" style={{ color: '#f43f5e' }}>+{h.alerts} Alerts</span>
                  </td>
                  <td>
                    <span className={`badge ${h.ok ? 'badge-stable' : 'badge-critical'}`}>
                      {h.ok ? '✓ SUCCESS' : '✕ FAILED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
