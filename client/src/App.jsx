import React, { useState } from 'react';
import {
  Shield, Activity, Radio, BookOpen, Flame,
  GitBranch, Wifi, ShieldCheck, Layers, FileText,
  Terminal
} from 'lucide-react';

import Dashboard from './pages/Dashboard.jsx';
import Telemetry from './pages/Telemetry.jsx';
import Academy from './pages/Academy.jsx';
import Attacks from './pages/Attacks.jsx';
import Investigation from './pages/Investigation.jsx';
import PacketAnalyzer from './pages/PacketAnalyzer.jsx';
import Playbooks from './pages/Playbooks.jsx';
import Detection from './pages/Detection.jsx';
import Reports from './pages/Reports.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'SIEM',        icon: Activity    },
  { id: 'telemetry',     label: 'Telemetry',   icon: Radio       },
  { id: 'attacks',       label: 'Cyber Range', icon: Flame       },
  { id: 'detection',     label: 'Detection',   icon: Layers      },
  { id: 'playbooks',     label: 'SOAR',        icon: ShieldCheck },
  { id: 'investigation', label: 'Investigate', icon: GitBranch   },
  { id: 'packets',       label: 'Packets',     icon: Wifi        },
  { id: 'academy',       label: 'Academy',     icon: BookOpen    },
  { id: 'reports',       label: 'Reports',     icon: FileText    },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard:     <Dashboard />,
    telemetry:     <Telemetry />,
    attacks:       <Attacks />,
    detection:     <Detection />,
    playbooks:     <Playbooks />,
    investigation: <Investigation />,
    packets:       <PacketAnalyzer />,
    academy:       <Academy />,
    reports:       <Reports />,
  };

  return (
    <div className="min-h-screen bg-mesh text-gray-100 font-sans flex flex-col">
      {/* ── Top Header ─────────────────────────────── */}
      <header
        style={{
          background: 'rgba(8,10,20,0.85)',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '7px',
                borderRadius: '10px',
                boxShadow: '0 0 18px -3px rgba(99,102,241,0.7)',
              }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-black tracking-tight text-white">SOCLab</p>
              <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.8)' }}>
                Offline · Enterprise
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`nav-btn ${page === id ? 'active' : ''}`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </nav>

          {/* Status pill */}
          <div
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#6ee7b7',
            }}
          >
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Operational
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-5 py-6 fade-up" key={page}>
        {pages[page]}
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer
        className="text-center py-3 text-[10px] font-mono uppercase tracking-widest"
        style={{
          color: 'rgba(75,85,99,0.7)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        SOCLab Platform · Offline Mode · All data local
      </footer>
    </div>
  );
}
