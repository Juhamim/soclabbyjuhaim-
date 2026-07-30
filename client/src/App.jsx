import React, { useState } from 'react';
import {
  Shield, Activity, Radio, BookOpen, Flame,
  GitBranch, Wifi, ShieldCheck, Layers, FileText, Sword
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
import RedBlueTeam from './pages/RedBlueTeam.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'SIEM Dashboard', icon: Activity    },
  { id: 'telemetry',     label: 'Host Telemetry', icon: Radio       },
  { id: 'redblue',       label: 'Red vs Blue',    icon: Sword       },
  { id: 'attacks',       label: 'Cyber Range',    icon: Flame       },
  { id: 'detection',     label: 'Detection',      icon: Layers      },
  { id: 'playbooks',     label: 'SOAR',           icon: ShieldCheck },
  { id: 'investigation', label: 'Investigate',    icon: GitBranch   },
  { id: 'packets',       label: 'Packets',        icon: Wifi        },
  { id: 'academy',       label: 'Academy',        icon: BookOpen    },
  { id: 'reports',       label: 'Reports',        icon: FileText    },
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
    redblue:       <RedBlueTeam />,
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
              <Shield className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <p className="text-base font-black tracking-tight text-slate-900">SOCLab <span className="text-indigo-600">AI</span></p>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Offline Enterprise SOC
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`nav-btn ${page === id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Status Badge */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <span className="status-dot online"></span>
            <span className="hidden sm:inline uppercase text-[10px] tracking-wider">System Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-6 py-6 fade-up" key={page}>
        {pages[page]}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        SOCLab Platform · 100% Offline Mode · All Telemetry Local
      </footer>
    </div>
  );
}
