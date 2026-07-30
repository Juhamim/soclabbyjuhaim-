import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Activity, Search, RefreshCw, AlertTriangle,
  CheckCircle, Flame, Layers, Cpu, MemoryStick, Database,
  TrendingUp, Wifi, X, ChevronRight
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
  nginx:         'badge src-apache',
  zeek:          'badge src-zeek',
  suricata:      'badge src-suricata',
  dns:           'badge src-dns',
  wazuh:         'badge src-wazuh',
};

function MetricCard({ icon: Icon, label, value, sub, color = '#6366f1', iconBg }) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(107,114,128,0.9)' }}>{label}</p>
        <div className="p-2 rounded-xl" style={{ background: iconBg || 'rgba(99,102,241,0.15)' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color, textShadow: `0 0 20px ${color}55` }}>{value}</p>
      {sub && <p className="text-[10px] mt-1.5" style={{ color: 'rgba(107,114,128,0.8)' }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,18,32,0.95)', border: '1px solid rgba(99,102,241,0.3)', color: '#c7d2fe' }}>
        {payload.map(p => (
          <div key={p.name}><span style={{ color: p.color }}>■</span> {p.name}: <strong>{p.value}%</strong></div>
        ))}
      </div>
    );
  }
  return null;
};

const MITRE_ITEMS = [
  { tactic: 'Initial Access',    technique: 'T1190',   name: 'Exploit Public App', col: '#f97316' },
  { tactic: 'Execution',         technique: 'T1059.001', name: 'PowerShell',       col: '#a855f7' },
  { tactic: 'Credential Access', technique: 'T1110',   name: 'Brute Force',        col: '#ef4444' },
  { tactic: 'C2',                technique: 'T1071.004', name: 'DNS Tunneling',    col: '#22d3ee' },
  { tactic: 'Impact',            technique: 'T1486',   name: 'Ransomware',         col: '#f43f5e' },
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
  const scoreColor = newAlerts > 5 ? '#f43f5e' : newAlerts > 0 ? '#fb923c' : '#10b981';

  return (
    <div className="space-y-5 pb-10">
      {/* ── Metric Strip ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={ShieldAlert} label="Active Alerts" value={newAlerts} sub="NEW status" color="#f43f5e" iconBg="rgba(244,63,94,0.15)" />
        <MetricCard icon={Flame}       label="Threat Level"  value={newAlerts > 3 ? 'CRITICAL' : newAlerts > 0 ? 'ELEVATED' : 'NORMAL'}
          color={scoreColor} iconBg={`${scoreColor}22`} sub="SOC posture" />
        <MetricCard icon={Database}    label="Indexed Logs"  value="50,420" sub="Last 7 days" color="#22d3ee" iconBg="rgba(34,211,238,0.12)" />
        <MetricCard icon={CheckCircle} label="Sec. Score"    value="84/100" sub="Host posture" color="#10b981" iconBg="rgba(16,185,129,0.15)" />
        <MetricCard icon={Cpu}         label="CPU Load"      value={`${telemetry.cpu_percent}%`} sub="Live" color="#a855f7" iconBg="rgba(168,85,247,0.15)" />
        <MetricCard icon={MemoryStick || Cpu} label="RAM Load" value={`${telemetry.memory_percent}%`} sub="Live" color="#6366f1" iconBg="rgba(99,102,241,0.15)" />
      </div>

      {/* ── Chart + MITRE ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="glow-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title m-0">Real-Time System Load</div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,211,238,0.12)', color: '#67e8f9', border: '1px solid rgba(34,211,238,0.2)' }}>
              LIVE · 4s
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" fill="url(#gCpu)" strokeWidth={2} name="CPU %" dot={false} />
                <Area type="monotone" dataKey="mem" stroke="#22d3ee" fill="url(#gMem)" strokeWidth={2} name="RAM %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'CPU', val: `${telemetry.cpu_percent}%`, col: '#6366f1' },
              { label: 'RAM', val: `${telemetry.memory_percent}%`, col: '#22d3ee' },
              { label: 'Sockets', val: telemetry.active_connections || 28, col: '#10b981' },
            ].map(m => (
              <div key={m.label} className="flex-1 text-center">
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'rgba(107,114,128,0.8)' }}>{m.label}</p>
                <p className="text-sm font-black" style={{ color: m.col }}>{m.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MITRE Heatmap */}
        <div className="glow-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title m-0">MITRE ATT&amp;CK® Live Coverage</div>
            <span className="text-[10px]" style={{ color: 'rgba(107,114,128,0.7)' }}>5 Techniques Mapped</span>
          </div>
          <div className="grid grid-cols-5 gap-2 h-44">
            {MITRE_ITEMS.map((item) => {
              const count = mitreCounts[item.technique] || 0;
              const active = count > 0;
              return (
                <div
                  key={item.technique}
                  className="relative rounded-xl p-3 flex flex-col justify-between overflow-hidden transition-all"
                  style={{
                    background: active ? `${item.col}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? item.col + '50' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: active ? `0 0 20px -4px ${item.col}55` : 'none',
                  }}
                >
                  {active && (
                    <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top right, ${item.col}, transparent 70%)` }} />
                  )}
                  <div>
                    <p className="text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: active ? item.col : 'rgba(107,114,128,0.6)' }}>
                      {item.tactic}
                    </p>
                    <p className="text-sm font-black font-mono" style={{ color: active ? item.col : 'rgba(75,85,99,0.8)' }}>
                      {item.technique}
                    </p>
                    <p className="text-[9px] mt-0.5 leading-tight" style={{ color: 'rgba(107,114,128,0.8)' }}>{item.name}</p>
                  </div>
                  {active && (
                    <div className="mt-2 self-end px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: `${item.col}25`, color: item.col }}>
                      ×{count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alerts Table ──────────────────────────── */}
      <div className="glow-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="section-title m-0">Live Security Alerts</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(107,114,128,0.7)' }} />
              <input
                type="text"
                placeholder="Search alerts or logs…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="soc-input pl-8 py-1.5 text-xs w-52"
              />
            </div>
            <button onClick={fetchDashboardData} className="btn-ghost py-1.5 px-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Technique</th>
                <th>Tactic</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10" style={{ color: 'rgba(107,114,128,0.5)' }}>No active alerts. System running clean.</td></tr>
              ) : alerts.map(a => (
                <tr key={a.id}>
                  <td><span className="font-mono text-[10px]" style={{ color: 'rgba(107,114,128,0.7)' }}>{a.id?.slice(-8)}</span></td>
                  <td>
                    <p className="font-semibold text-gray-200 text-xs">{a.title}</p>
                    {a.description && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(107,114,128,0.7)' }}>{a.description?.slice(0, 60)}</p>}
                  </td>
                  <td><span className={SEVERITY_CLASS[a.severity] || 'badge badge-info'}>{a.severity}</span></td>
                  <td><span className="font-mono text-xs font-bold" style={{ color: '#a5b4fc' }}>{a.mitre_technique || '—'}</span></td>
                  <td><span className="text-[10px]" style={{ color: 'rgba(107,114,128,0.8)' }}>{a.mitre_tactic || '—'}</span></td>
                  <td>
                    <span className={`badge ${a.status === 'NEW' ? 'badge-critical' : 'badge-stable'}`}>{a.status}</span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => handleResolve(a.id)} className="btn-ghost py-1 px-2.5 text-[10px]">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Log Stream ────────────────────────────── */}
      <div className="glow-card p-5">
        <div className="section-title mb-4">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Live Log Ingestion Stream
        </div>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', maxHeight: '280px' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Host</th>
                <th>User</th>
                <th>Src IP</th>
                <th>Payload Preview</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 20).map(l => (
                <tr key={l.id} onClick={() => setSelectedLog(l)}>
                  <td className="whitespace-nowrap font-mono text-[10px]" style={{ color: 'rgba(107,114,128,0.7)' }}>
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td><span className={SRC_CLASS[l.source_type] || 'badge src-default'}>{l.source_type}</span></td>
                  <td className="text-gray-300 font-mono text-[11px]">{l.host_name}</td>
                  <td className="text-gray-400 text-[11px]">{l.user_name || '—'}</td>
                  <td className="font-mono text-[11px]" style={{ color: '#67e8f9' }}>{l.src_ip || '127.0.0.1'}</td>
                  <td className="text-[11px] truncate max-w-xs" style={{ color: 'rgba(107,114,128,0.8)' }}>
                    {String(l.raw_payload).slice(0, 80)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Log Modal ─────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="glow-card p-6 max-w-2xl w-full space-y-4" style={{ background: 'rgba(10,13,24,0.98)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.7)' }}>Raw Log Payload</p>
                <p className="text-sm font-bold text-white mt-0.5">{selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre
              className="rounded-xl p-4 text-xs font-mono overflow-auto max-h-80 leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(99,102,241,0.2)', color: '#6ee7b7' }}
            >
              {JSON.stringify(JSON.parse(selectedLog.raw_payload || '{}'), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
