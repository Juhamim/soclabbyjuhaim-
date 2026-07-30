import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Activity, Search, RefreshCw, AlertTriangle,
  CheckCircle, Flame, Layers, Cpu, Database, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SEVERITY_CLASS = {
  CRITICAL: 'badge badge-critical',
  HIGH:     'badge badge-high',
  MEDIUM:   'badge badge-medium',
  LOW:      'badge badge-low',
  INFO:     'badge badge-info',
};

const SRC_CLASS = {
  windows_event: 'badge src-windows',
  sysmon:        'badge src-sysmon',
  apache:        'badge src-apache',
  nginx:         'badge src-nginx',
  zeek:          'badge src-zeek',
  suricata:      'badge src-suricata',
  dns:           'badge src-dns',
  wazuh:         'badge src-wazuh',
};

function MetricCard({ icon: Icon, label, value, sub, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50 border-indigo-100' }) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`p-2.5 rounded-xl border ${bgClass}`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
      </div>
      <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

const MITRE_ITEMS = [
  { tactic: 'Initial Access',    technique: 'T1190',   name: 'Exploit Public App' },
  { tactic: 'Execution',         technique: 'T1059.001', name: 'PowerShell' },
  { tactic: 'Credential Access', technique: 'T1110',   name: 'Brute Force' },
  { tactic: 'C2',                technique: 'T1071.004', name: 'DNS Tunneling' },
  { tactic: 'Impact',            technique: 'T1486',   name: 'Ransomware' },
];

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [telemetry, setTelemetry] = useState({ cpu_percent: 14.5, memory_percent: 42.1, disk_percent: 58.0, active_connections: 28 });
  const [chartData, setChartData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [logsRes, alertsRes, telRes] = await Promise.all([
        fetch(`/api/logs?limit=50${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''}`),
        fetch('/api/alerts?limit=20'),
        fetch('/api/telemetry/latest')
      ]);
      const logsData = await logsRes.json();
      const alertsData = await alertsRes.json();
      const telData = await telRes.json();
      setLogs(Array.isArray(logsData) ? logsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      if (telData) setTelemetry(telData);
      setChartData(prev => [
        ...prev.slice(-20),
        { time: new Date().toLocaleTimeString(), cpu: telData?.cpu_percent || 15, mem: telData?.memory_percent || 40 }
      ]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    const t = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(t);
  }, [searchQuery]);

  const mitreCounts = alerts.reduce((acc, a) => {
    if (a.mitre_technique) acc[a.mitre_technique] = (acc[a.mitre_technique] || 0) + 1;
    return acc;
  }, {});

  const handleResolve = async (id) => {
    await fetch(`/api/alerts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RESOLVED' }) });
    fetchDashboardData();
  };

  const newAlerts = alerts.filter(a => a.status === 'NEW').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={ShieldAlert} label="Active Alerts" value={newAlerts} sub="NEW Status" colorClass="text-red-600" bgClass="bg-red-50 border-red-100" />
        <MetricCard icon={Flame} label="Threat Level" value={newAlerts > 3 ? 'CRITICAL' : newAlerts > 0 ? 'ELEVATED' : 'NORMAL'} sub="SIEM Posture" colorClass={newAlerts > 0 ? "text-amber-600" : "text-emerald-600"} bgClass={newAlerts > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"} />
        <MetricCard icon={Database} label="Indexed Logs" value="50,420" sub="SQLite FTS5" colorClass="text-sky-600" bgClass="bg-sky-50 border-sky-100" />
        <MetricCard icon={CheckCircle} label="Security Score" value="84/100" sub="Host Posture" colorClass="text-emerald-600" bgClass="bg-emerald-50 border-emerald-100" />
        <MetricCard icon={Cpu} label="CPU Load" value={`${telemetry.cpu_percent}%`} sub="Real-time" colorClass="text-indigo-600" bgClass="bg-indigo-50 border-indigo-100" />
        <MetricCard icon={Activity} label="RAM Load" value={`${telemetry.memory_percent}%`} sub="Real-time" colorClass="text-purple-600" bgClass="bg-purple-50 border-purple-100" />
      </div>

      {/* Charts & MITRE Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Load Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">Real-Time Workstation Load</div>
            <span className="badge badge-info">Live 4s</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stroke="#4f46e5" fill="#eef2ff" strokeWidth={2} name="CPU %" />
                <Area type="monotone" dataKey="mem" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2} name="RAM %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-3 mt-2 border-t border-slate-100">
            <span>CPU: <strong className="text-slate-800">{telemetry.cpu_percent}%</strong></span>
            <span>RAM: <strong className="text-slate-800">{telemetry.memory_percent}%</strong></span>
            <span>Sockets: <strong className="text-slate-800">{telemetry.active_connections || 28}</strong></span>
          </div>
        </div>

        {/* MITRE Matrix Heatmap */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">MITRE ATT&amp;CK® Live Heatmap</div>
            <span className="text-xs text-slate-400">Real-Time Detections</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MITRE_ITEMS.map((item) => {
              const count = mitreCounts[item.technique] || 0;
              const active = count > 0;
              return (
                <div
                  key={item.technique}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'bg-red-50 border-red-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{item.tactic}</span>
                    {active && (
                      <span className="badge badge-critical font-bold text-[9px] px-1.5 py-0.2">
                        {count}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 mt-1">{item.technique}</h5>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Live Security Alerts Feed
            </h3>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs or alert title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="soc-input pl-9"
              />
            </div>
            <button onClick={fetchDashboardData} className="btn btn-ghost py-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Title / Rule</th>
                <th>Severity</th>
                <th>MITRE</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No active security alerts found.
                  </td>
                </tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs text-slate-500">{a.id?.slice(-8)}</td>
                    <td>
                      <p className="font-semibold text-slate-800">{a.title}</p>
                      <span className="text-[11px] text-slate-400 block">{a.description}</span>
                    </td>
                    <td>
                      <span className={SEVERITY_CLASS[a.severity] || 'badge badge-info'}>{a.severity}</span>
                    </td>
                    <td className="font-mono font-semibold text-indigo-600">{a.mitre_technique || '—'}</td>
                    <td>
                      <span className={`badge ${a.status === 'NEW' ? 'badge-new' : 'badge-resolved'}`}>{a.status}</span>
                    </td>
                    <td className="text-right">
                      <button onClick={() => handleResolve(a.id)} className="btn btn-ghost btn-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolve</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Stream */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          Real-Time Log Ingestion Stream
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>Host</th>
                <th>User</th>
                <th>Src IP</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 15).map(l => (
                <tr key={l.id} onClick={() => setSelectedLog(l)}>
                  <td className="font-mono text-xs text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                  <td><span className={SRC_CLASS[l.source_type] || 'badge src-default'}>{l.source_type}</span></td>
                  <td className="font-mono text-slate-700">{l.host_name}</td>
                  <td className="text-slate-600">{l.user_name || '-'}</td>
                  <td className="font-mono text-sky-600">{l.src_ip || '127.0.0.1'}</td>
                  <td className="text-slate-500 truncate max-w-xs">{String(l.raw_payload)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Log Payload ({selectedLog.id})</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="code-block max-h-80">
              {JSON.stringify(JSON.parse(selectedLog.raw_payload || '{}'), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
