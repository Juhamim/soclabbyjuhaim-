import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, AlertTriangle, CheckCircle, ShieldAlert, Zap, Clock, Terminal } from 'lucide-react';

export default function BlueTeam() {
  const [alerts, setAlerts] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [metrics, setMetrics] = useState({ mttd: 14, mttr: 42, containmentSuccess: 100, blueScore: 92 });
  const [remediationLog, setRemediationLog] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts?limit=10');
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const t = setInterval(fetchAlerts, 4000);
    return () => clearInterval(t);
  }, []);

  const handleStepAction = async (stepNumber, actionName, playbookId, targetParam) => {
    try {
      if (playbookId) {
        await fetch('/api/soar/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playbookId,
            params: targetParam
          })
        });
      }
      setRemediationLog(prev => [
        { step: `Step ${stepNumber}: ${actionName}`, time: new Date().toLocaleTimeString(), status: 'SUCCESS' },
        ...prev
      ]);
      setActiveStep(Math.min(4, stepNumber + 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Defensive Operations</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Blue Team Command Center</h2>
        <p className="text-xs text-slate-500">Monitor incoming threats in real-time and execute step-by-step incident response containment</p>
      </div>

      {/* Blue Team Performance Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mean Time to Detect (MTTD)</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{metrics.mttd}s</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mean Time to Respond (MTTR)</p>
          <p className="text-2xl font-black text-sky-600 mt-2">{metrics.mttr}s</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Containment Success</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{metrics.containmentSuccess}%</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Blue Defense Score</p>
          <p className="text-2xl font-black text-purple-600 mt-2">{metrics.blueScore}/100</p>
        </div>
      </div>

      {/* 4-Step Incident Response Console */}
      <div className="card p-6 space-y-4 border-l-4 border-l-indigo-600">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            Guided 4-Step Incident Response & Remediation Console
          </h3>
          <span className="badge badge-indigo">Active Incident Console</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className={`p-4 rounded-xl border ${activeStep === 1 ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}>
            <p className="font-bold text-slate-900 mb-1">Step 1: Identify</p>
            <p className="text-[11px] text-slate-600 mb-3">Analyze incoming log Event IDs and locate attacker source IP.</p>
            <button
              onClick={() => handleStepAction(1, 'Log Identification Verified', null, null)}
              className="btn btn-primary btn-sm w-full justify-center"
            >
              Verify Identification
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${activeStep === 2 ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}>
            <p className="font-bold text-slate-900 mb-1">Step 2: Contain</p>
            <p className="text-[11px] text-slate-600 mb-3">Block malicious source IP and isolate host interface.</p>
            <button
              onClick={() => handleStepAction(2, 'Host Network Isolated & IP Blocked', 'PB-BLOCK-IP', { ipAddress: '185.220.101.5' })}
              className="btn btn-primary btn-sm w-full justify-center"
            >
              Execute Containment
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${activeStep === 3 ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}>
            <p className="font-bold text-slate-900 mb-1">Step 3: Eradicate</p>
            <p className="text-[11px] text-slate-600 mb-3">Terminate malicious process tree and disable credentials.</p>
            <button
              onClick={() => handleStepAction(3, 'Process Terminated & User Account Disabled', 'PB-KILL-PROC', { processName: 'powershell.exe' })}
              className="btn btn-primary btn-sm w-full justify-center"
            >
              Execute Eradication
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${activeStep === 4 ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}>
            <p className="font-bold text-slate-900 mb-1">Step 4: Recover</p>
            <p className="text-[11px] text-slate-600 mb-3">Verify clean system state and restore network access.</p>
            <button
              onClick={() => handleStepAction(4, 'System Clean State Verified & Restored', null, null)}
              className="btn btn-success btn-sm w-full justify-center"
            >
              Complete Recovery
            </button>
          </div>
        </div>
      </div>

      {/* Remediation Audit Logs */}
      <div className="card p-5">
        <div className="section-label mb-4">Blue Team Remediation Audit Stream</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Remediation Action Executed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {remediationLog.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-sm text-slate-400">
                    No remediation steps executed yet. Follow the 4-Step Response Console above.
                  </td>
                </tr>
              ) : (
                remediationLog.map((log, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-slate-400">{log.time}</td>
                    <td className="font-bold text-slate-800">{log.step}</td>
                    <td><span className="badge badge-stable">EXECUTED</span></td>
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
