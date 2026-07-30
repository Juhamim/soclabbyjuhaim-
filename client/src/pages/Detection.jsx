import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ToggleLeft, ToggleRight, Plus, Code } from 'lucide-react';

export default function Detection() {
  const [rules, setRules] = useState([]);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/sigma-rules');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id) => {
    try {
      await fetch(`/api/sigma-rules/${id}/toggle`, { method: 'PATCH' });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Layers className="w-6 h-6 text-indigo-600 mr-2" />
            Detection Engineering & Rule Studio (Sigma / YARA)
          </h2>
          <p className="text-xs text-slate-500">Manage active detection rule logic evaluated against real-time system logs</p>
        </div>
      </div>

      <div className="soc-card p-5">
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Rule ID</th>
                <th className="p-3">Rule Title</th>
                <th className="p-3">Level</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{r.id}</td>
                  <td className="p-3 font-semibold text-slate-800">
                    {r.title}
                    <span className="block text-[11px] font-normal text-slate-500">{r.description}</span>
                  </td>
                  <td className="p-3">
                    <span className={r.level === 'critical' ? 'soc-badge-critical' : 'soc-badge-high'}>
                      {r.level}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.author || 'SOCLab Team'}</td>
                  <td className="p-3 text-emerald-700 font-bold">{r.status}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggle(r.id)}
                      className="text-slate-700 hover:text-sky-600 p-1"
                    >
                      {r.enabled ? (
                        <ToggleRight className="w-7 h-7 text-sky-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
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
