import db, { initSchema } from './database.js';
import crypto from 'crypto';

console.log('Initializing SOCLab AI Database & Seed Data...');
initSchema();

// 1. Seed Users
const userStmt = db.prepare(`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(username) DO NOTHING
`);

userStmt.run('usr-admin', 'admin', 'admin123', 'admin');
userStmt.run('usr-tier1', 'analyst1', 'analyst123', 'tier1');
userStmt.run('usr-hunter', 'hunter1', 'hunter123', 'threat_hunter');
console.log('Seeded users.');

// 2. Seed Sigma Rules
const ruleStmt = db.prepare(`
  INSERT INTO sigma_rules (id, title, status, description, author, logsource, detection, level, tags, enabled)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(id) DO NOTHING
`);

const defaultRules = [
  {
    id: 'SIG-WIN-4625',
    title: 'Windows Brute Force Failed Authentication',
    status: 'stable',
    description: 'Detects high volume of failed logon attempts (Event ID 4625)',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'authentication', product: 'windows' }),
    detection: JSON.stringify({ selection: { event_id: 4625 } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1110'])
  },
  {
    id: 'SIG-WIN-PS-ENC',
    title: 'Encoded PowerShell Command Execution',
    status: 'stable',
    description: 'Detects execution of PowerShell with Base64 encoded payload command line switches',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'process_creation', product: 'windows' }),
    detection: JSON.stringify({ selection: { process_name: 'powershell.exe', raw_payload: '-enc' } }),
    level: 'critical',
    tags: JSON.stringify(['attack.t1059.001'])
  },
  {
    id: 'SIG-WEB-SQLI',
    title: 'Web Application SQL Injection Payload Attack',
    status: 'stable',
    description: 'Detects common SQL injection primitives in HTTP query strings and headers',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'web', product: 'apache' }),
    detection: JSON.stringify({ selection: { raw_payload: 'UNION SELECT' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1190'])
  },
  {
    id: 'SIG-NET-DNS-TUNNEL',
    title: 'DNS Tunneling High Subdomain Length Anomaly',
    status: 'stable',
    description: 'Detects DNS queries with unusually long subdomain prefixes indicative of data exfiltration',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'dns', product: 'zeek' }),
    detection: JSON.stringify({ selection: { raw_payload: '.attacker.com' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1071.004'])
  },
  {
    id: 'SIG-WIN-RANSOM',
    title: 'Ransomware VSSAdmin Shadow Copy Deletion',
    status: 'stable',
    description: 'Detects execution of vssadmin delete shadows used by ransomware before encryption',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'process_creation', product: 'windows' }),
    detection: JSON.stringify({ selection: { process_name: 'vssadmin.exe', raw_payload: 'delete shadows' } }),
    level: 'critical',
    tags: JSON.stringify(['attack.t1486'])
  }
];

for (const rule of defaultRules) {
  ruleStmt.run(rule.id, rule.title, rule.status, rule.description, rule.author, rule.logsource, rule.detection, rule.level, rule.tags);
}
console.log('Seeded default Sigma rules.');

console.log('Database initialization complete.');
