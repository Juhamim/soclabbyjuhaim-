import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Sword, Clock, Target, Activity, Zap, CheckCircle, XCircle, Play, Pause } from 'lucide-react';

const OPERATIONS = {
  red: [
    {
      id: 'op-blackout',
      name: 'Operation Blackout',
      description: 'Coordinated credential theft and lateral movement across finance department',
      difficulty: 'Advanced',
      stages: [
        { name: 'Phishing Delivery', technique: 'T1566', redScore: 0, blueScore: 0 },
        { name: 'LSASS Dump', technique: 'T1003.001', redScore: 0, blueScore: 0 },
        { name: 'Lateral Movement', technique: 'T1021', redScore: 0, blueScore: 0 },
        { name: 'Data Exfiltration', technique: 'T1048', redScore: 0, blueScore: 0 },
      ]
    },
    {
      id: 'op-silentexfil',
      name: 'Operation SilentExfil',
      description: 'Covert DNS tunneling and C2 beaconing to exfiltrate sensitive documents',
      difficulty: 'Expert',
      stages: [
        { name: 'Reconnaissance', technique: 'T1046', redScore: 0, blueScore: 0 },
        { name: 'Initial Access', technique: 'T1190', redScore: 0, blueScore: 0 },
        { name: 'C2 Beacon', technique: 'T1071.004', redScore: 0, blueScore: 0 },
        { name: 'Exfiltration', technique: 'T1048', redScore: 0, blueScore: 0 },
      ]
    },
    {
      id: 'op-ransomlock',
      name: 'Operation RansomLock',
      description: 'Full ransomware kill chain from initial access to encryption and extortion',
      difficulty: 'Advanced',
      stages: [
        { name: 'Initial Access', technique: 'T1190', redScore: 0, blueScore: 0 },
        { name: 'Privilege Escalation', technique: 'T1558.001', redScore: 0, blueScore: 0 },
        { name: 'Shadow Copy Deletion', technique: 'T1486', redScore: 0, blueScore: 0 },
        { name: 'Encryption + Ransom Note', technique: 'T1486', redScore: 0, blueScore: 0 },
      ]
    }
  ],
  blue: [
    {
      id: 'bp-detect-brute',
      name: 'Brute Force Defense',
      description: 'Detect and block password spraying across domain controller',
      technique: 'T1110',
      actions: ['Enable account lockout', 'Block source IP', 'Alert SOC tier 1']
    },
    {
      id: 'bp-contain-ransom',
      name: 'Ransomware Containment',
      description: 'Isolate infected host and prevent lateral movement during encryption',
      technique: 'T1486',
      actions: ['Isolate host network', 'Kill ransomware process', 'Enable shadow copies']
    },
    {
      id: 'bp-intercept-exfil',
      name: 'Data Exfil Interception',
      description: 'Detect and block DNS tunneling and unauthorized data transfer',
      technique: 'T1048',
      actions: ['Block DNS TXT queries', 'Inspect outbound traffic', 'Alert on anomaly']
    },
    {
      id: 'bp-remediate-kerb',
      name: 'Kerberos Attack Remediation',
      description: 'Detect Kerberoasting and Golden Ticket attacks on domain',
      technique: 'T1558',
      actions: ['Rotate KRBTGT password', 'Audit SPN delegation', 'Monitor TGS requests']
    }
  ]
};

export default function RedBlueTeam() {
  const [team, setTeam] = useState('red');
  const [activeOperation, setActiveOperation] = useState(null);
  const [campaignState, setCampaignState] = useState('idle');
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [mttd, setMttd] = useState(0);
  const [log, setLog] = useState([]);
  const [blueActions, setBlueActions] = useState({});
  const [campaignTimer, setCampaignTimer] = useState(null);
  const [round, setRound] = useState(1);
  const [activeResponse, setActiveResponse] = useState(null);

  useEffect(() => {
    return () => { if (campaignTimer) clearInterval(campaignTimer); };
  }, [campaignTimer]);

  const startCampaign = (op) => {
    setActiveOperation(op);
    setCampaignState('running');
    setCurrentStageIdx(0);
    setLog([]);
    setBlueActions({});
    setActiveResponse(null);
    setMttd(0);
    if (team === 'red') {
      setScores({ red: 0, blue: 0 });
      executeRedStage(op, 0);
    }
    const timer = setInterval(() => {
      setMttd(prev => prev + 1);
    }, 1000);
    setCampaignTimer(timer);
  };

  const executeRedStage = async (op, stageIdx) => {
    if (stageIdx >= op.stages.length) {
      setCampaignState('complete');
      clearInterval(campaignTimer);
      setCampaignTimer(null);
      return;
    }
    const stage = op.stages[stageIdx];
    setCurrentStageIdx(stageIdx);
    addLog(`[RED] Executing: ${stage.name} (${stage.technique})`);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'windows_event',
          host_name: 'DC-PRIMARY-01',
          severity: 'CRITICAL',
          event_id: 4625,
          process_name: null,
          user_name: 'administrator',
          src_ip: '185.220.101.5',
          raw_payload: { attack_type: stage.name, mitre_technique: stage.technique, operation: op.id, stage: stageIdx },
          is_simulated: 1,
        }),
      });
      const data = await res.json();
      const redDelta = Math.floor(Math.random() * 15) + 10;
      const blueDelta = blueActions[stageIdx] ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 5);
      setScores(prev => ({ red: prev.red + redDelta, blue: prev.blue + blueDelta }));
      addLog(`[RESULT] Red gains +${redDelta} | Blue mitigates +${blueDelta}`);
      addLog(`[SCORE] Red: ${scores.red + redDelta}% | Blue: ${scores.blue + blueDelta}%`);
      stage.redScore = redDelta;
      stage.blueScore = blueDelta;
      setTimeout(() => executeRedStage(op, stageIdx + 1), 1500);
    } catch {
      addLog(`[ERROR] Stage ${stage.name} failed`);
      setTimeout(() => executeRedStage(op, stageIdx + 1), 1000);
    }
  };

  const executeBlueAction = (action, stageIdx) => {
    setActiveResponse(action);
    addLog(`[BLUE] Executing countermeasure: ${action}`);
    setBlueActions(prev => ({ ...prev, [stageIdx]: true }));
    setTimeout(() => setActiveResponse(null), 1500);
  };

  const addLog = (msg) => {
    setLog(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev]);
  };

  const resetCampaign = () => {
    setActiveOperation(null);
    setCampaignState('idle');
    setCurrentStageIdx(0);
    setScores({ red: 0, blue: 0 });
    setMttd(0);
    setLog([]);
    setBlueActions({});
    setActiveResponse(null);
    setRound(prev => prev + 1);
    if (campaignTimer) clearInterval(campaignTimer);
    setCampaignTimer(null);
  };

  const totalScore = scores.red + scores.blue || 1;
  const redPct = Math.round((scores.red / totalScore) * 100);
  const bluePct = Math.round((scores.blue / totalScore) * 100);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sword className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-900">Red vs Blue Team Simulation</h2>
          </div>
          <p className="text-xs text-slate-500">Multi-stage adversary emulation with live blue team defense scoring</p>
        </div>
        {/* Team Selector */}
        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setTeam('red')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${team === 'red' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-red-600'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5 inline mr-1.5" />Red Team
          </button>
          <button
            onClick={() => setTeam('blue')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${team === 'blue' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-blue-600'}`}
          >
            <Shield className="w-3.5 h-3.5 inline mr-1.5" />Blue Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Operation Selection / Blue Playbooks */}
        <div className="lg:col-span-1 space-y-4">
          {team === 'red' ? (
            <>
              <div className="card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Red Team Operations</h3>
                <div className="space-y-3">
                  {OPERATIONS.red.map(op => (
                    <div key={op.id} className={`p-4 rounded-xl border text-xs space-y-2 ${
                      activeOperation?.id === op.id ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 hover:border-red-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-900">{op.name}</h4>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">{op.difficulty}</span>
                      </div>
                      <p className="text-slate-600">{op.description}</p>
                      <div className="flex gap-1.5 text-[10px] text-slate-500">
                        {op.stages.map((s, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded ${
                            i < currentStageIdx && activeOperation?.id === op.id
                              ? 'bg-emerald-100 text-emerald-700'
                              : i === currentStageIdx && activeOperation?.id === op.id
                              ? 'bg-red-100 text-red-700 animate-pulse'
                              : 'bg-slate-100'
                          }`}>{s.name}</span>
                        ))}
                      </div>
                      {campaignState === 'idle' && (
                        <button onClick={() => startCampaign(op)} className="btn btn-danger w-full justify-center py-2 text-xs">
                          <Play className="w-3 h-3 mr-1" /> Launch Campaign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Score Card */}
              {campaignState !== 'idle' && (
                <div className="card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Campaign Score</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-600 font-bold">Red Attack Success</span>
                        <span className="font-bold">{redPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${redPct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-600 font-bold">Blue Mitigation Rate</span>
                        <span className="font-bold">{bluePct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${bluePct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">MTTD Clock</span>
                    <span className="font-mono font-bold text-slate-900">{mttd}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Round</span>
                    <span className="font-bold text-slate-900">{round}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Blue Team Playbooks</h3>
                <div className="space-y-3">
                  {OPERATIONS.blue.map(bp => (
                    <div key={bp.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2 hover:border-blue-200">
                      <h4 className="text-sm font-bold text-slate-900">{bp.name}</h4>
                      <p className="text-slate-600">{bp.description}</p>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{bp.technique}</span>
                      <div className="space-y-1 mt-2">
                        {bp.actions.map((a, i) => (
                          <button
                            key={i}
                            onClick={() => executeBlueAction(a, currentStageIdx)}
                            disabled={campaignState !== 'running' || activeResponse !== null}
                            className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs text-slate-700 border border-slate-200 disabled:opacity-50"
                          >
                            <Play className="w-3 h-3 inline mr-1.5 text-blue-500" />{a}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Real-Time Scorecard</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-600">{redPct}%</div>
                    <div className="text-[10px] text-slate-500">Red Success</div>
                  </div>
                  <div className="text-2xl text-slate-300">vs</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-600">{bluePct}%</div>
                    <div className="text-[10px] text-slate-500">Blue Mitigation</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold text-slate-900">{mttd}s</span>
                  <span>MTTD</span>
                </div>
              </div>
            </>
          )}
          {campaignState !== 'idle' && (
            <button onClick={resetCampaign} className="btn btn-outline w-full justify-center py-2 text-xs">
              <XCircle className="w-3.5 h-3.5 mr-1" /> Reset Campaign
            </button>
          )}
        </div>

        {/* Right: Timeline / Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Operation Status */}
          {activeOperation && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  <Activity className="w-4 h-4 inline mr-2 text-indigo-600" />
                  {activeOperation.name}
                </h3>
                {campaignState === 'running' && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <Zap className="w-3.5 h-3.5 animate-pulse" /> Active
                  </span>
                )}
                {campaignState === 'complete' && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Complete
                  </span>
                )}
              </div>
              {/* Stage Timeline */}
              {team === 'red' && (
                <div className="space-y-3">
                  {activeOperation.stages.map((stage, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                      i === currentStageIdx && campaignState === 'running'
                        ? 'bg-red-50 border-red-300 animate-pulse'
                        : i < currentStageIdx
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < currentStageIdx ? 'bg-emerald-500 text-white' : i === currentStageIdx && campaignState === 'running' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {i < currentStageIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">{stage.name}</span>
                          <span className="font-mono text-indigo-600">{stage.technique}</span>
                        </div>
                        {i < currentStageIdx && (
                          <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                            <span>Red Score: <strong className="text-red-600">+{stage.redScore}</strong></span>
                            <span>Blue Mitigation: <strong className="text-blue-600">+{stage.blueScore}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Campaign Result */}
              {campaignState === 'complete' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Campaign Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="text-2xl font-black text-red-600">{redPct}%</div>
                      <div className="text-xs text-slate-500">Red Attack Success</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="text-2xl font-black text-blue-600">{bluePct}%</div>
                      <div className="text-xs text-slate-500">Blue Mitigation Rate</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-xs text-slate-600">
                    Mean Time to Detect: <span className="font-bold font-mono text-slate-900">{mttd}s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                <Target className="w-4 h-4 inline mr-2 text-slate-600" />
                Activity Feed
              </h3>
              {activeResponse && (
                <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                  <Zap className="w-3.5 h-3.5" /> {activeResponse}
                </span>
              )}
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {log.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No activity yet. Launch a campaign to begin.</p>
              ) : log.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 text-xs border-b border-slate-100 last:border-0">
                  <span className="font-mono text-slate-400 shrink-0 w-16">{entry.time}</span>
                  <span className="text-slate-800">{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
