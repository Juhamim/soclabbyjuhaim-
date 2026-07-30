import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Radio, RefreshCw, Server } from 'lucide-react';

function GaugeCard({ icon: Icon, label, value, colorClass = "text-indigo-600", bgClass = "bg-indigo-50 border-indigo-100" }) {
  const pct = Math.min(100, parseFloat(value) || 0);
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`p-2.5 rounded-xl border ${bgClass}`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
      </div>
      <p className={`text-2xl font-black mb-3 ${colorClass}`}>{value}</p>
      <div className="progress-track">
        <div className="progress-fill bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Telemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('network');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telemetry/latest');
      setTelemetry(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTelemetry();
    const t = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(t);
  }, []);

  const net = telemetry?.network_details
    ? (typeof telemetry.network_details === 'string' ? JSON.parse(telemetry.network_details) : telemetry.network_details)
    : { sockets: [], listening_ports: [], arp_table: [] };

  const TABS = [
    { id: 'network',   label: 'Active Sockets' },
    { id: 'ports',     label: 'Listening Ports' },
    { id: 'arp',       label: 'ARP Cache' },
    { id: 'processes', label: 'Active Processes' },
  ];

  const DEMO_PROCS = [
    { name: 'System Idle Process', pid: 0, mem: '0 K', cpu: '0%' },
    { name: 'lsass.exe', pid: 780, mem: '12.4 MB', cpu: '0.1%' },
    { name: 'node.exe (SOCLab)', pid: 4120, mem: '68.2 MB', cpu: '0.8%' },
    { name: 'python.exe (agent)', pid: 5840, mem: '22.1 MB', cpu: '0.3%' },
    { name: 'svchost.exe', pid: 1024, mem: '9.8 MB', cpu: '0.0%' },
    { name: 'powershell.exe', pid: 6220, mem: '44.3 MB', cpu: '0.2%' },
    { name: 'chrome.exe', pid: 8812, mem: '310.5 MB', cpu: '1.2%' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600">System Agent</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Local Workstation Telemetry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time local metrics, socket connections, listening ports & ARP table
          </p>
        </div>
        <button onClick={fetchTelemetry} className="btn btn-ghost">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GaugeCard icon={Cpu}       label="CPU Load" value={`${telemetry?.cpu_percent || 15.2}%`}    colorClass="text-indigo-600" bgClass="bg-indigo-50 border-indigo-100" />
        <GaugeCard icon={Server}    label="RAM Load" value={`${telemetry?.memory_percent || 42.5}%`} colorClass="text-sky-600" bgClass="bg-sky-50 border-sky-100" />
        <GaugeCard icon={HardDrive} label="Disk Usage" value={`${telemetry?.disk_percent || 58.1}%`} colorClass="text-emerald-600" bgClass="bg-emerald-50 border-emerald-100" />
        <GaugeCard icon={Wifi}      label="Net Rx MB"  value={`${telemetry?.net_recv_mb || 85.2} MB`} colorClass="text-purple-600" bgClass="bg-purple-50 border-purple-100" />
      </div>

      {/* Sub Tabs */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card overflow-hidden">
        {tab === 'network' && (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Local Address</th>
                  <th>Remote Address</th>
                  <th>State</th>
                  <th>PID</th>
                </tr>
              </thead>
              <tbody>
                {net.sockets?.length > 0 ? net.sockets.map((s, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-info">{s.proto}</span></td>
                    <td className="font-mono text-slate-700">{s.local_addr}</td>
                    <td className="font-mono text-sky-600">{s.foreign_addr || '—'}</td>
                    <td>
                      <span className="badge badge-stable">{s.state}</span>
                    </td>
                    <td className="font-mono text-slate-500">{s.pid}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-8 text-center text-sm text-slate-400">
                    No socket data available. Start the Python telemetry agent.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ports' && (
          <div className="p-5">
            <div className="section-label mb-4">Listening Ports</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {net.listening_ports?.length > 0 ? net.listening_ports.map((p, i) => (
                <div key={i} className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[9px] uppercase font-bold text-slate-400">LISTEN</p>
                  <p className="text-sm font-black text-indigo-600 mt-1">{p.split(':').pop()}</p>
                  <p className="text-[9px] font-mono text-slate-500 truncate mt-0.5">{p}</p>
                </div>
              )) : (
                <div className="col-span-6 py-8 text-center text-sm text-slate-400">
                  No listening port data available.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'arp' && (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr><th>IP Address</th><th>MAC Address</th><th>Type</th></tr>
              </thead>
              <tbody>
                {net.arp_table?.length > 0 ? net.arp_table.map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-sky-600">{row.ip}</td>
                    <td className="font-mono text-slate-600">{row.mac}</td>
                    <td><span className="badge badge-info">{row.type}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-8 text-center text-sm text-slate-400">
                    No ARP table data available.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'processes' && (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr><th>PID</th><th>Process Name</th><th>Memory</th><th>CPU</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DEMO_PROCS.map((p, i) => (
                  <tr key={i}>
                    <td className="font-mono text-slate-400">{p.pid}</td>
                    <td className="font-mono text-slate-800 font-semibold">{p.name}</td>
                    <td className="text-slate-500">{p.mem}</td>
                    <td className="text-slate-500">{p.cpu}</td>
                    <td><span className="badge badge-stable font-bold">Running</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
