import express from 'express';
import db from '../config/database.js';
import { detectionEngine } from '../services/detectionEngine.js';

import { soarEngine } from '../services/soarEngine.js';
import { generateMarkdownReport } from '../services/reportService.js';
import { broadcastLog, broadcastAlert, broadcastTelemetry } from '../websocket/wsServer.js';
import crypto from 'crypto';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || password !== 'admin123') { // Offline demo auth fallback
    return res.status(401).json({ error: 'Invalid credentials. Default admin username: admin, password: admin123' });
  }
  res.json({
    user: { id: user.id, username: user.username, role: user.role },
    token: 'offline-jwt-token-demo-' + user.id
  });
});

// --- Logs Routes ---
router.get('/logs', (req, res) => {
  const { query, source_type, severity, limit = 100 } = req.query;
  try {
    let rows;
    if (query) {
      const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9\s:_*.-]/g, '')}%`;
      rows = db.prepare(`
        SELECT * FROM logs
        WHERE source_type LIKE ? OR process_name LIKE ? OR user_name LIKE ? OR raw_payload LIKE ?
        ORDER BY timestamp DESC LIMIT ?
      `).all(sanitizedQuery, sanitizedQuery, sanitizedQuery, sanitizedQuery, Number(limit));
    } else if (source_type) {
      rows = db.prepare('SELECT * FROM logs WHERE source_type = ? ORDER BY timestamp DESC LIMIT ?')
        .all(source_type, Number(limit));
    } else if (severity) {
      rows = db.prepare('SELECT * FROM logs WHERE severity = ? ORDER BY timestamp DESC LIMIT ?')
        .all(severity, Number(limit));
    } else {
      rows = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?').all(Number(limit));
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post log endpoint
router.post('/logs', (req, res) => {
  const logData = req.body;
  const id = logData.id || 'LOG-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = logData.timestamp || new Date().toISOString();
  const payloadStr = typeof logData.raw_payload === 'string' ? logData.raw_payload : JSON.stringify(logData.raw_payload || logData);

  try {
    const stmt = db.prepare(`
      INSERT INTO logs (id, timestamp, source_type, host_name, severity, event_id, process_name, user_name, src_ip, dest_ip, raw_payload, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      timestamp,
      logData.source_type || 'custom',
      logData.host_name || 'LOCAL-PC',
      logData.severity || 'INFO',
      logData.event_id || null,
      logData.process_name || null,
      logData.user_name || null,
      logData.src_ip || null,
      logData.dest_ip || null,
      payloadStr,
      logData.is_simulated ? 1 : 0
    );

    const fullLog = { ...logData, id, timestamp, raw_payload: payloadStr };
    broadcastLog(fullLog);
    const alerts = detectionEngine.evaluateLog(fullLog);

    res.json({ success: true, logId: id, alertsGenerated: alerts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Alerts Routes ---
router.get('/alerts', (req, res) => {
  const { limit = 50, status } = req.query;
  try {
    let stmt;
    if (status) {
      stmt = db.prepare('SELECT * FROM alerts WHERE status = ? ORDER BY timestamp DESC LIMIT ?');
      res.json(stmt.all(status, Number(limit)));
    } else {
      stmt = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?');
      res.json(stmt.all(Number(limit)));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/alerts/:id', (req, res) => {
  const { status, assigned_to } = req.body;
  try {
    db.prepare('UPDATE alerts SET status = COALESCE(?, status), assigned_to = COALESCE(?, assigned_to) WHERE id = ?')
      .run(status, assigned_to, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Incidents Routes ---
router.get('/incidents', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM incidents ORDER BY timestamp DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Sigma Rules Routes ---
router.get('/sigma-rules', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sigma_rules').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/sigma-rules/:id/toggle', (req, res) => {
  try {
    const rule = db.prepare('SELECT enabled FROM sigma_rules WHERE id = ?').get(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    const newStatus = rule.enabled ? 0 : 1;
    db.prepare('UPDATE sigma_rules SET enabled = ? WHERE id = ?').run(newStatus, req.params.id);
    detectionEngine.reloadRules();
    res.json({ success: true, enabled: newStatus === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Telemetry Routes ---
router.post('/telemetry', (req, res) => {
  const telemetry = req.body;
  const id = 'TEL-' + Date.now();
  try {
    db.prepare(`
      INSERT INTO system_telemetry (id, timestamp, cpu_percent, memory_percent, disk_percent, net_sent_mb, net_recv_mb, active_connections, listening_ports, active_processes, logged_users, network_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      new Date().toISOString(),
      telemetry.cpu_percent || 0,
      telemetry.memory_percent || 0,
      telemetry.disk_percent || 0,
      telemetry.net_sent_mb || 0,
      telemetry.net_recv_mb || 0,
      telemetry.active_connections || 0,
      telemetry.listening_ports || 0,
      telemetry.active_processes || 0,
      telemetry.logged_users || 1,
      JSON.stringify(telemetry.network_details || {})
    );

    broadcastTelemetry(telemetry);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/telemetry/latest', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM system_telemetry ORDER BY timestamp DESC LIMIT 1').get();
    res.json(row || { cpu_percent: 15.2, memory_percent: 42.5, disk_percent: 58.1, net_sent_mb: 124.5, net_recv_mb: 852.1, active_connections: 28, listening_ports: 14, active_processes: 184, logged_users: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Red/Blue Team Simulation Routes ---
router.post('/simulation/launch', (req, res) => {
  const { operationId, team, stage } = req.body;
  const id = 'SIM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  try {
    db.prepare(`
      INSERT INTO logs (id, timestamp, source_type, host_name, severity, process_name, user_name, raw_payload, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, new Date().toISOString(), 'SIMULATION', 'SIM-CONTROLLER', 'INFO', 'simEngine', 'SOCLab Simulator',
      JSON.stringify({ operationId, team, stage, event: 'campaign_launch' })
    );
    res.json({ success: true, simulationId: id, status: 'launched' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/simulation/score', (req, res) => {
  res.json({
    redScore: Math.floor(Math.random() * 40) + 30,
    blueScore: Math.floor(Math.random() * 40) + 30,
    mttd: Math.floor(Math.random() * 180) + 30,
    round: 1,
    status: 'active'
  });
});

// --- SOAR Playbooks ---
router.post('/soar/execute', (req, res) => {
  const { playbookId, params } = req.body;
  const result = soarEngine.executePlaybook(playbookId, params);
  res.json(result);
});



// --- Report Generator ---
router.get('/reports/generate', (req, res) => {
  const { type = 'executive' } = req.query;
  const content = generateMarkdownReport(type);
  res.json({ type, markdown: content });
});

// --- Academy Progress ---
router.get('/academy/progress', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM lab_progress').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/academy/complete-lab', (req, res) => {
  const { user_id = 'usr-admin', module_id, lab_id, score = 100 } = req.body;
  const id = `LAB-${module_id}-${lab_id}`;
  try {
    db.prepare(`
      INSERT INTO lab_progress (id, user_id, module_id, lab_id, status, score, completed_at)
      VALUES (?, ?, ?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET status='COMPLETED', score=excluded.score, completed_at=CURRENT_TIMESTAMP
    `).run(id, user_id, module_id, lab_id, score);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
