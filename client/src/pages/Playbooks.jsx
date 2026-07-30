import React, { useState } from 'react';
import { Play, CheckCircle, Shield, AlertOctagon, Terminal } from 'lucide-react';

const PLAYBOOKS = [
  { id: 'PB-BLOCK-IP', title: 'Block IP Address', description: 'Applies firewall block rule & updates SIEM IP blocklist.', paramName: 'ipAddress', defaultVal: '185.220.101.5' },
  { id: 'PB-KILL-PROC', title: 'Kill Process', description: 'Terminates process by PID or executable name.', paramName: 'processName', defaultVal: 'powershell.exe' },
  { id: 'PB-DISABLE-USER', title: 'Disable User Account', description: 'Disables user credentials & revokes session tokens.', paramName: 'username', defaultVal: 'administrator' },
  { id: 'PB-ISOLATE-HOST', title: 'Isolate Host', description: 'Enables strict host isolation firewall policies.', paramName: 'hostName', defaultVal: 'DC-PRIMARY-01' }
];

export default function Playbooks() {
  const [params, setParams] = useState({
    ipAddress: '185.220.101.5',
    processName: 'powershell.exe',
    username: 'administrator',
    hostName: 'DC-PRIMARY-01'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(null);

  const handleExecute = async (pb) => {
    setLoading(pb.id);
    try {
      const res = await fetch('/api/soar/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookId: pb.id,
          params: { [pb.paramName]: params[pb.paramName] }
        })
      });
      const data = await res.json();
      setLogs(prev => [data, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Shield className="w-6 h-6 text-sky-600 mr-2" />
          SOAR Automated Containment Playbooks
        </h2>
        <p className="text-xs text-slate-500">Execute automated response actions to neutralize active security threats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLAYBOOKS.map(pb => (
          <div key={pb.id} className="soc-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-sky-700 uppercase">{pb.id}</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{pb.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{pb.description}</p>

              <div className="mt-3">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">Target Value ({pb.paramName}):</label>
                <input
                  type="text"
                  value={params[pb.paramName]}
                  onChange={e => setParams({ ...params, [pb.paramName]: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleExecute(pb)}
              disabled={loading === pb.id}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${loading === pb.id ? 'animate-spin' : ''}`} />
              <span>{loading === pb.id ? 'Executing...' : 'Run Playbook'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Execution Results Audit */}
      <div className="soc-card p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
          <Terminal className="w-4 h-4 text-emerald-600 mr-2" />
          Playbook Execution Audit Log
        </h3>
        <div className="space-y-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No playbooks executed yet. Select a playbook above.</p>
          ) : (
            logs.map((l, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-slate-900 font-bold border-b border-slate-200 pb-2">
                  <span>{l.playbook} (Target: {l.target})</span>
                  <span className="text-emerald-700 text-[11px]">STATUS: EXECUTED</span>
                </div>
                <ul className="space-y-1 text-slate-700 pl-4 list-disc">
                  {l.actions?.map((act, i) => <li key={i}>{act}</li>)}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
