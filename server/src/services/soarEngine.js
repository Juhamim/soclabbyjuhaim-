import db from '../config/database.js';
import crypto from 'crypto';

export class SOAREngine {
  executePlaybook(playbookId, params = {}) {
    const actionMap = {
      'PB-BLOCK-IP': this.blockIP,
      'PB-KILL-PROC': this.killProcess,
      'PB-DISABLE-USER': this.disableUser,
      'PB-ISOLATE-HOST': this.isolateHost,
      'PB-COLLECT-EVIDENCE': this.collectEvidence,
      'PB-GENERATE-REPORT': this.generateReport
    };

    const handler = actionMap[playbookId];
    if (!handler) {
      return { success: false, message: `Playbook ${playbookId} not found.` };
    }

    const result = handler(params);
    this.logAuditTrail(playbookId, params, result);
    return result;
  }

  blockIP({ ipAddress }) {
    if (!ipAddress) return { success: false, message: 'Missing target IP address.' };
    return {
      success: true,
      playbook: 'Block IP Address',
      target: ipAddress,
      actions: [
        `Added firewall rule: BLOCK INBOUND/OUTBOUND for ${ipAddress}`,
        `Updated SIEM IP Blacklist database`,
        `Terminated active TCP connections associated with ${ipAddress}`
      ],
      timestamp: new Date().toISOString()
    };
  }

  killProcess({ processName, pid }) {
    if (!processName && !pid) return { success: false, message: 'Missing process name or PID.' };
    return {
      success: true,
      playbook: 'Kill Process',
      target: processName || `PID ${pid}`,
      actions: [
        `Sent SIGKILL / taskkill /F to process ${processName || pid}`,
        `Audited parent process tree`,
        `Flushed memory buffer for process`
      ],
      timestamp: new Date().toISOString()
    };
  }

  disableUser({ username }) {
    if (!username) return { success: false, message: 'Missing target username.' };
    return {
      success: true,
      playbook: 'Disable User Account',
      target: username,
      actions: [
        `Disabled Active Directory / Local User account: ${username}`,
        `Revoked active Kerberos / OAuth session tokens`,
        `Flagged account for security audit`
      ],
      timestamp: new Date().toISOString()
    };
  }

  isolateHost({ hostName }) {
    if (!hostName) return { success: false, message: 'Missing host name.' };
    return {
      success: true,
      playbook: 'Isolate Host',
      target: hostName,
      actions: [
        `Enabled host isolation firewall policy on ${hostName}`,
        `Allowed outbound management traffic to SOC platform only`,
        `Created RAM & Disk forensic snapshot task`
      ],
      timestamp: new Date().toISOString()
    };
  }

  collectEvidence({ incidentId, hostName }) {
    return {
      success: true,
      playbook: 'Collect Forensics Evidence',
      target: incidentId || hostName,
      actions: [
        `Captured running process tree dump`,
        `Exported recent Windows Event Logs (Security, System, Sysmon)`,
        `Saved network socket state snapshot`,
        `Generated SHA-256 evidence chain-of-custody hash`
      ],
      timestamp: new Date().toISOString()
    };
  }

  generateReport({ incidentId }) {
    return {
      success: true,
      playbook: 'Generate Executive Report',
      target: incidentId,
      actions: [
        `Synthesized incident metrics and attack timeline`,
        `Mapped detected alerts to MITRE ATT&CK matrix`,
        `Exported PDF & Markdown forensic report artifact`
      ],
      timestamp: new Date().toISOString()
    };
  }

  logAuditTrail(playbookId, params, result) {
    try {
      const logId = 'SOAR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const rawPayload = JSON.stringify({ playbookId, params, result });
      db.prepare(`
        INSERT INTO logs (id, timestamp, source_type, host_name, severity, process_name, user_name, raw_payload, is_simulated)
        VALUES (?, ?, 'SOAR_AUDIT', 'SOC-CONTROLLER', 'INFO', 'soarEngine', 'SOAR Automation', ?, 1)
      `).run(logId, new Date().toISOString(), rawPayload);
    } catch (err) {
      console.error('SOAR Audit logging failed:', err.message);
    }
  }
}

export const soarEngine = new SOAREngine();
