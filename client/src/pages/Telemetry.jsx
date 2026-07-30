import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Network, Radio, RefreshCw, Server, Globe, Shield } from 'lucide-react';

function GaugeCard({ icon: Icon, label, value, color, iconColor }) {
  const pct = Math.min(100, parseFloat(value) || 0);
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(107,114,128,0.9)' }}>{label}</p>
        <div className="p-2 rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color: iconColor || color }} />
        </div>
      </div>
      <p className="text-2xl font-black mb-3" style={{ color, textShadow: `0 0 20px ${color}55` }}>{value}</p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px]" style={{ color: 'rgba(107,114,128,0.5)' }}>0%</span>
        <span className="text-[9px]" style={{ color: 'rgba(107,114,128,0.5)' }}>100%</span>
      </div>
    </div>
  );
}

const STATE_COLORS = {
  ESTABLISHED: '#10b981',
  LISTENING:   '#6366f1',
  TIME_WAIT:   '#f59e0b',
  CLOSE_WAIT:  '#f43f5e',
};

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
    { id: 'processes', label: 'Processes' },
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
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22d3ee' }}>System Telemetry</span>
          </div>
          <h2 className="text-xl font-black text-white">Local Workstation Monitor</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(107,114,128,0.8)' }}>
            Real-time hardware metrics, network sockets, ports & ARP — refreshing every 3s
          </p>
        </div>
        <button onClick={fetchTelemetry} className="btn-ghost">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: '#22d3ee' }} />
          Refresh
        </button>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GaugeCard icon={Cpu}       label="CPU Utilization" value={`${telemetry?.cpu_percent || 15.2}%`}    color="#6366f1" />
        <GaugeCard icon={Server}    label="RAM Utilization" value={`${telemetry?.memory_percent || 42.5}%`} color="#22d3ee" />
        <GaugeCard icon={HardDrive} label="Disk Utilization" value={`${telemetry?.disk_percent || 58.1}%`} color="#10b981" />
        <GaugeCard icon={Wifi}      label="Net Rx MB"       value={`${telemetry?.net_recv_mb || 85.2} MB`} color="#f59e0b" />
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glow-card overflow-hidden">
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
                    <td className="font-mono text-[11px] text-gray-300">{s.local_addr}</td>
                    <td className="font-mono text-[11px]" style={{ color: '#67e8f9' }}>{s.foreign_addr || '—'}</td>
                    <td>
                      <span className="badge" style={{
                        background: `${STATE_COLORS[s.state] || '#6b7280'}18`,
                        color: STATE_COLORS[s.state] || '#9ca3af',
                        borderColor: `${STATE_COLORS[s.state] || '#6b7280'}40`,
                      }}>{s.state}</span>
                    </td>
                    <td className="font-mono text-[11px]" style={{ color: 'rgba(107,114,128,0.8)' }}>{s.pid}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-12 text-center text-sm" style={{ color: 'rgba(107,114,128,0.5)' }}>
                    Start the Python telemetry agent to capture live network sockets.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ports' && (
          <div className="p-5">
            <div className="section-title mb-4">Listening Network Services</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {net.listening_ports?.length > 0 ? net.listening_ports.map((p, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <p className="text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(99,102,241,0.7)' }}>LISTEN</p>
                  <p className="text-sm font-black" style={{ color: '#a5b4fc' }}>{p.split(':').pop()}</p>
                  <p className="text-[8px] mt-0.5 font-mono truncate" style={{ color: 'rgba(107,114,128,0.6)' }}>{p}</p>
                </div>
              )) : (
                <div className="col-span-6 py-10 text-center text-sm" style={{ color: 'rgba(107,114,128,0.5)' }}>
                  No listening port data. Start Python telemetry agent.
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
                    <td className="font-mono text-[11px]" style={{ color: '#67e8f9' }}>{row.ip}</td>
                    <td className="font-mono text-[11px] text-gray-400">{row.mac}</td>
                    <td><span className={`badge ${row.type === 'dynamic' ? 'badge-info' : 'badge-stable'}`}>{row.type}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-12 text-center text-sm" style={{ color: 'rgba(107,114,128,0.5)' }}>
                    No ARP data. Start Python telemetry agent.
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
                <tr><th>PID</th><th>Process Name</th><th>Memory</th><th>CPU</th><th>Risk</th></tr>
              </thead>
              <tbody>
                {DEMO_PROCS.map((p, i) => {
                  const risk = p.name.includes('powershell') ? 'high' : p.name.includes('python') ? 'medium' : 'low';
                  return (
                    <tr key={i}>
                      <td className="font-mono text-xs" style={{ color: 'rgba(107,114,128,0.8)' }}>{p.pid}</td>
                      <td className="font-mono text-xs text-gray-200 font-semibold">{p.name}</td>
                      <td className="text-xs text-gray-400">{p.mem}</td>
                      <td className="text-xs text-gray-400">{p.cpu}</td>
                      <td>
                        <span className={`badge ${risk === 'high' ? 'badge-high' : risk === 'medium' ? 'badge-medium' : 'badge-stable'}`}>
                          {risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
