import db from '../config/database.js';
import { broadcastAlert } from '../websocket/wsServer.js';
import crypto from 'crypto';

export class DetectionEngine {
  constructor() {
    this.rules = [];
    this.reloadRules();
  }

  reloadRules() {
    try {
      const rows = db.prepare('SELECT * FROM sigma_rules WHERE enabled = 1').all();
      this.rules = rows.map(r => ({
        ...r,
        logsource: JSON.parse(r.logsource || '{}'),
        detection: JSON.parse(r.detection || '{}'),
        tags: JSON.parse(r.tags || '[]')
      }));
    } catch (err) {
      console.error('Failed to load Sigma rules:', err.message);
    }
  }

  evaluateLog(log) {
    if (!this.rules.length) this.reloadRules();

    const alertsGenerated = [];
    const payload = typeof log.raw_payload === 'string' ? JSON.parse(log.raw_payload) : log.raw_payload;

    for (const rule of this.rules) {
      if (this.matchRule(log, payload, rule)) {
        const alertId = 'ALT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const mitreTag = rule.tags.find(t => t.startsWith('attack.t')) || 'attack.t1059';
        const technique = mitreTag.replace('attack.', '').toUpperCase();
        const tactic = this.mapTactic(technique);

        const alert = {
          id: alertId,
          rule_id: rule.id,
          title: rule.title,
          severity: rule.level.toUpperCase(),
          mitre_tactic: tactic,
          mitre_technique: technique,
          description: rule.description || `Sigma rule hit on ${log.source_type}`,
          source_log_id: log.id,
          status: 'NEW',
          assigned_to: 'Tier 1 Analyst',
          timestamp: new Date().toISOString()
        };

        try {
          db.prepare(`
            INSERT INTO alerts (id, rule_id, title, severity, mitre_tactic, mitre_technique, description, source_log_id, status, assigned_to, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            alert.id,
            alert.rule_id,
            alert.title,
            alert.severity,
            alert.mitre_tactic,
            alert.mitre_technique,
            alert.description,
            alert.source_log_id,
            alert.status,
            alert.assigned_to,
            alert.timestamp
          );

          alertsGenerated.push(alert);
          broadcastAlert(alert);
        } catch (err) {
          console.error('Error inserting alert:', err.message);
        }
      }
    }

    return alertsGenerated;
  }

  matchRule(log, payload, rule) {
    const { detection } = rule;
    if (!detection || !detection.selection) return false;

    const selection = detection.selection;
    for (const [key, value] of Object.entries(selection)) {
      let fieldValue = log[key] ?? payload[key];
      if (fieldValue === undefined || fieldValue === null) return false;

      const strVal = String(fieldValue).toLowerCase();

      if (Array.isArray(value)) {
        const match = value.some(v => strVal.includes(String(v).toLowerCase()));
        if (!match) return false;
      } else {
        const targetVal = String(value).toLowerCase();
        if (!strVal.includes(targetVal)) return false;
      }
    }

    return true;
  }

  mapTactic(technique) {
    const tacticMap = {
      'T1110': 'Credential Access',
      'T1003.001': 'Credential Access',
      'T1558.003': 'Credential Access',
      'T1557.002': 'Credential Access',
      'T1059': 'Execution',
      'T1059.001': 'Execution',
      'T1190': 'Initial Access',
      'T1189': 'Initial Access',
      'T1071.004': 'Command and Control',
      'T1486': 'Impact',
      'T1547': 'Persistence',
      'T1053.005': 'Persistence',
      'T1068': 'Privilege Escalation',
      'T1558.001': 'Privilege Escalation',
      'T1021': 'Lateral Movement',
      'T1048': 'Exfiltration',
      'T1046': 'Discovery',
      'T1566': 'Initial Access'
    };
    return tacticMap[technique] || 'Defense Evasion';
  }
}

export const detectionEngine = new DetectionEngine();
