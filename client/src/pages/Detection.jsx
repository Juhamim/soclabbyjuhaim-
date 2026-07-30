import React, { useState, useEffect } from 'react';
import { Layers, ToggleRight, ToggleLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const LEVEL_CLASS = {
  critical:      'badge badge-critical',
  high:          'badge badge-high',
  medium:        'badge badge-medium',
  low:           'badge badge-low',
  informational: 'badge badge-info',
};

export default function Detection() {
  const [rules, setRules] = useState([]);

  const fetch_ = async () => {
    try {
      const r = await fetch('/api/sigma-rules');
      const d = await r.json();
      setRules(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetch_(); }, []);

  const toggle = async (id) => {
    await fetch(`/api/sigma-rules/${id}/toggle`, { method: 'PATCH' });
    fetch_();
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Detection Engineering Studio</h2>
        </div>
        <p className="text-xs text-slate-500">
          Manage Sigma detection rules evaluated in real-time against incoming log telemetry
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Rules</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{rules.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Rules</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{rules.filter(r => r.enabled).length}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Disabled Rules</p>
          <p className="text-2xl font-black text-red-600 mt-2">{rules.filter(r => !r.enabled).length}</p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card p-5">
        <div className="section-label mb-4">Sigma Rule Registry</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Title / Description</th>
                <th>Level</th>
                <th>Author</th>
                <th>Status</th>
                <th className="text-right">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td className="font-mono text-xs font-bold text-indigo-600">{r.id}</td>
                  <td>
                    <p className="font-semibold text-slate-800">{r.title}</p>
                    <span className="text-[11px] text-slate-400 block">{r.description}</span>
                  </td>
                  <td><span className={LEVEL_CLASS[r.level] || 'badge badge-info'}>{r.level}</span></td>
                  <td className="text-slate-500 text-xs">{r.author || 'SOCLab Team'}</td>
                  <td><span className={`badge ${r.status === 'stable' ? 'badge-stable' : 'badge-experimental'}`}>{r.status}</span></td>
                  <td className="text-right">
                    <button onClick={() => toggle(r.id)} className="p-1 hover:opacity-80">
                      {r.enabled ? (
                        <ToggleRight className="w-8 h-8 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
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
