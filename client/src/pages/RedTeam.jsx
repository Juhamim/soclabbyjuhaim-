import React, { useState } from 'react';
import { ShieldAlert, Play, Terminal, Flame, Zap, CheckCircle, Crosshair, Award } from 'lucide-react';

const RED_CAMPAIGN_SCENARIOS = [
  {
    key: 'dark_spray',
    title: 'Operation DarkSpray (Password Spray & AD Breach)',
    tactic: 'Credential Access (T1110)',
    description: 'Executes automated password spraying against Domain Controller accounts, followed by privilege escalation.',
    stages: [
      { name: 'Stage 1: Nmap Recon & Port Scan', payload: 'nmap -sS -p 135,445,389 10.0.4.0/24' },
      { name: 'Stage 2: Event 4625 Password Spraying', payload: '500 failed logon attempts targeting administrator' },
      { name: 'Stage 3: Domain Controller Logon Success', payload: 'Event 4624 successful logon as NT AUTHORITY\\SYSTEM' }
    ],
    severity: 'HIGH',
    impact: 'Domain Admin Credential Compromise'
  },
  {
    key: 'shadow_ransom',
    title: 'Operation ShadowRansom (Ransomware Execution)',
    tactic: 'Impact (T1486)',
    description: 'Executes macro payload, disables system shadow copy backups via vssadmin, and initiates file encryption.',
    stages: [
      { name: 'Stage 1: Phishing Document Macro Trigger', payload: 'winword.exe spawning powershell.exe -enc ...' },
      { name: 'Stage 2: Backup Destruction', payload: 'vssadmin.exe delete shadows /all /quiet' },
      { name: 'Stage 3: File System Encryption', payload: 'Encrypting C:\\Users\\...\\.locked extension appended' }
    ],
    severity: 'CRITICAL',
    impact: 'Complete System Backup & Data Loss'
  },
  {
    key: 'covert_exfil',
    title: 'Operation CovertExfil (DNS Data Exfiltration)',
    tactic: 'Command & Control (T1071.004)',
    description: 'Establishes covert DNS tunneling channel to exfiltrate confidential corporate files to attacker infrastructure.',
    stages: [
      { name: 'Stage 1: Memory LSASS Dumping', payload: 'rundll32.exe comsvcs.dll MiniDump lsass.exe' },
      { name: 'Stage 2: Encoded DNS TXT Chunk Queries', payload: 'v8a9f8s9d8f.exfil.attacker.com TXT' },
      { name: 'Stage 3: HTTP POST C2 Beaconing', payload: 'POST /c2/upload 128 bytes every 30 seconds' }
    ],
    severity: 'HIGH',
    impact: 'Sensitive Data Exfiltration'
  }
];

export default function RedTeam() {
  const [executing, setExecuting] = useState(null);
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [redScore, setRedScore] = useState({ campaignsRun: 0, payloadsDelivered: 0, breachSuccess: 0 });

  const handleRunCampaign = async (campaign) => {
    setExecuting(campaign.key);
    try {
      for (const stage of campaign.stages) {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_type: campaign.key === 'covert_exfil' ? 'zeek' : 'windows_event',
            host_name: 'DC-PRIMARY-01',
            severity: campaign.severity,
            event_id: campaign.key === 'dark_spray' ? 4625 : 1,
            process_name: campaign.key === 'shadow_ransom' ? 'vssadmin.exe' : 'powershell.exe',
            user_name: 'administrator',
            src_ip: '185.220.101.5',
            raw_payload: { campaign: campaign.title, stage: stage.name, payload: stage.payload },
            is_simulated: 1
          })
        });
        await new Promise(r => setTimeout(r, 600));
      }

      setCampaignLogs(prev => [
        { title: campaign.title, time: new Date().toLocaleTimeString(), status: 'COMPLETED', stages: campaign.stages.length },
        ...prev
      ]);

      setRedScore(prev => ({
        campaignsRun: prev.campaignsRun + 1,
        payloadsDelivered: prev.payloadsDelivered + campaign.stages.length,
        breachSuccess: Math.min(100, Math.round(((prev.campaignsRun + 1) * 35)))
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">Offensive Operations</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Red Team Campaign Console</h2>
          <p className="text-xs text-slate-500">Launch multi-stage offensive cyber campaigns to evaluate defensive detection coverage</p>
        </div>
      </div>

      {/* Red Team Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Campaigns Launched</p>
          <p className="text-2xl font-black text-red-600 mt-2">{redScore.campaignsRun}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payloads Delivered</p>
          <p className="text-2xl font-black text-amber-600 mt-2">{redScore.payloadsDelivered}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Breach Success Rate</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{redScore.breachSuccess}%</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {RED_CAMPAIGN_SCENARIOS.map(c => (
          <div key={c.key} className="card p-5 flex flex-col justify-between space-y-4 border-l-4 border-l-red-500">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600">{c.tactic}</span>
                <span className={c.severity === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                  {c.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{c.title}</h3>
              <p className="text-xs text-slate-600 mb-3">{c.description}</p>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Execution Stages:</p>
                {c.stages.map((st, i) => (
                  <div key={i} className="text-[11px] text-slate-700 font-mono">
                    <span className="text-red-600 font-bold">▸</span> {st.name}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRunCampaign(c)}
              disabled={!!executing}
              className="btn btn-danger w-full justify-center py-2.5"
            >
              {executing === c.key ? (
                <><Zap className="w-4 h-4 animate-pulse" /> Launching Campaign...</>
              ) : (
                <><Crosshair className="w-4 h-4" /> Execute Red Campaign</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Campaign Audit Logs */}
      <div className="card p-5">
        <div className="section-label mb-4">Red Team Campaign Audit History</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Campaign Title</th>
                <th>Stages Executed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaignLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm text-slate-400">
                    No Red Team campaigns launched yet. Click 'Execute Red Campaign' above.
                  </td>
                </tr>
              ) : (
                campaignLogs.map((log, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-slate-400">{log.time}</td>
                    <td className="font-bold text-slate-800">{log.title}</td>
                    <td className="font-mono text-indigo-600 font-bold">{log.stages} Attack Stages</td>
                    <td><span className="badge badge-critical">EXECUTED</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
