import React, { useState } from 'react';
import { ShieldCheck, Play, CheckCircle, Zap, User, Server, Ban } from 'lucide-react';

const PLAYBOOKS = [
  { id: 'PB-BLOCK-IP',     title: 'Block IP Address',     desc: 'Applies firewall block rule for inbound/outbound traffic and updates SIEM blocklist.', paramName: 'ipAddress',    default: '185.220.101.5',  icon: Ban },
  { id: 'PB-KILL-PROC',   title: 'Kill Process',         desc: 'Terminates suspicious process by name or PID. Audits process tree.',                  paramName: 'processName', default: 'powershell.exe', icon: Zap },
  { id: 'PB-DISABLE-USER', title: 'Disable User Account', desc: 'Disables user credentials and revokes all active session tokens.',                   paramName: 'username',    default: 'administrator',  icon: User },
  { id: 'PB-ISOLATE-HOST', title: 'Isolate Host',         desc: 'Enables strict network isolation firewall policies on target host.',                  paramName: 'hostName',    default: 'DC-PRIMARY-01',  icon: Server },
];

export default function Playbooks() {
  const [params, setParams] = useState({ ipAddress: '185.220.101.5', processName: 'powershell.exe', username: 'administrator', hostName: 'DC-PRIMARY-01' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(null);

  const handleExecute = async (pb) => {
    setLoading(pb.id);
    try {
      const res = await fetch('/api/soar/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookId: pb.id, params: { [pb.paramName]: params[pb.paramName] } }),
      });
      const data = await res.json();
      setLogs(prev => [{ ...data, time: new Date().toLocaleTimeString() }, ...prev]);
    } catch { /* silent */ }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">SOAR Automated Playbooks</h2>
        </div>
        <p className="text-xs text-slate-500">
          Execute automated response playbooks to neutralize active security threats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLAYBOOKS.map(pb => {
          const Icon = pb.icon;
          const isRunning = loading === pb.id;
          return (
            <div key={pb.id} className="card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">{pb.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{pb.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pb.desc}</p>

                <div className="mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target ({pb.paramName})
                  </label>
                  <input
                    type="text"
                    value={params[pb.paramName]}
                    onChange={e => setParams({ ...params, [pb.paramName]: e.target.value })}
                    className="soc-input font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => handleExecute(pb)}
                disabled={!!loading}
                className="btn btn-primary w-full justify-center py-2.5"
              >
                {isRunning ? <><Zap className="w-4 h-4 animate-pulse" /> Executing...</> : <><Play className="w-4 h-4" /> Run Playbook</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Execution Audit */}
      <div className="card p-5">
        <div className="section-label mb-4">Playbook Execution Audit</div>
        {logs.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">No playbooks executed yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((l, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">{l.playbook} (Target: {l.target})</span>
                  <span className="badge badge-stable">STATUS: EXECUTED</span>
                </div>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                  {l.actions?.map((act, j) => <li key={j}>{act}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
