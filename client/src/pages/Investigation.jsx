import React, { useState } from 'react';
import { GitBranch, ShieldAlert, Cpu, User, Network, FileText, CheckCircle } from 'lucide-react';

export default function Investigation() {
  const [selectedNode, setSelectedNode] = useState('ALERT-001');

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <GitBranch className="w-6 h-6 text-indigo-600 mr-2" />
          Incident Investigation & Node Correlation Graph
        </h2>
        <p className="text-xs text-slate-500">Trace root cause relationships between Host, User, Process, IP, and MITRE Alerts</p>
      </div>

      {/* Graph Visualizer Canvas */}
      <div className="soc-card p-6 bg-slate-900 text-white rounded-xl min-h-[340px] flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
          <span className="text-sky-400 font-mono font-semibold">INCIDENT #INC-2026-0882 (ACTIVE INVESTIGATION)</span>
          <span className="bg-red-900/60 text-red-300 px-2.5 py-0.5 rounded border border-red-700/50 uppercase font-bold">Severity: CRITICAL</span>
        </div>

        {/* Node Graph Flow Representation */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 my-8 relative z-10 text-center font-mono">
          <div
            onClick={() => setSelectedNode('IP-185.220.101.5')}
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-sky-400 cursor-pointer transition-all shadow-lg"
          >
            <Network className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">External IP</span>
            <p className="text-xs font-bold text-white mt-1">185.220.101.5</p>
          </div>

          <div
            onClick={() => setSelectedNode('HOST-DC-01')}
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-400 cursor-pointer transition-all shadow-lg"
          >
            <Cpu className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Target Host</span>
            <p className="text-xs font-bold text-white mt-1">DC-PRIMARY-01</p>
          </div>

          <div
            onClick={() => setSelectedNode('PROC-POWERSHELL')}
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-400 cursor-pointer transition-all shadow-lg"
          >
            <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Spawned Process</span>
            <p className="text-xs font-bold text-white mt-1">powershell.exe</p>
          </div>

          <div
            onClick={() => setSelectedNode('USER-ADMIN')}
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-amber-400 cursor-pointer transition-all shadow-lg"
          >
            <User className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Target Account</span>
            <p className="text-xs font-bold text-white mt-1">administrator</p>
          </div>

          <div
            onClick={() => setSelectedNode('ALERT-001')}
            className="p-4 bg-red-950/80 border border-red-600 rounded-xl hover:border-red-400 cursor-pointer transition-all shadow-lg"
          >
            <ShieldAlert className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <span className="text-xs text-red-300">Triggered Alert</span>
            <p className="text-xs font-bold text-white mt-1">T1110 Brute Force</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center font-mono">
          Click any node above to inspect forensic evidence details
        </div>
      </div>

      {/* Node Evidence Inspection Panel */}
      <div className="soc-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Node Forensic Details: {selectedNode}</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-800 space-y-2">
          <p><strong>First Seen:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Associated MITRE Technique:</strong> T1110 Credential Access</p>
          <p><strong>Parent PID:</strong> 1420 (services.exe)</p>
          <p><strong>Evidence Hash (SHA-256):</strong> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
        </div>
      </div>
    </div>
  );
}
