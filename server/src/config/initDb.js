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
  },
  {
    id: 'SIG-WIN-LSASS-DUMP',
    title: 'LSASS Process Memory Access (Mimikatz)',
    status: 'stable',
    description: 'Detects process access requests to LSASS with suspicious granted access masks',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'process_access', product: 'windows' }),
    detection: JSON.stringify({ selection: { process_name: 'lsass.exe', raw_payload: 'lsass.dmp' } }),
    level: 'critical',
    tags: JSON.stringify(['attack.t1003.001'])
  },
  {
    id: 'SIG-WIN-KERBEROAST',
    title: 'Kerberoasting TGS Request Anomaly',
    status: 'stable',
    description: 'Detects TGS ticket requests with RC4 encryption type indicating Kerberoasting',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'authentication', product: 'windows' }),
    detection: JSON.stringify({ selection: { event_id: 4769, raw_payload: '0x17' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1558.003'])
  },
  {
    id: 'SIG-WIN-SCHTASK',
    title: 'Scheduled Task Persistence via Schtasks',
    status: 'stable',
    description: 'Detects creation of scheduled tasks with suspicious task paths and PowerShell command lines',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'process_creation', product: 'windows' }),
    detection: JSON.stringify({ selection: { event_id: 4698, raw_payload: 'powershell' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1053.005'])
  },
  {
    id: 'SIG-WIN-GOLDEN',
    title: 'Kerberos Golden Ticket Anomalous Logon',
    status: 'stable',
    description: 'Detects anomalous Kerberos logons with zero key length indicating forged ticket',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'authentication', product: 'windows' }),
    detection: JSON.stringify({ selection: { event_id: 4624, raw_payload: 'KeyLength' } }),
    level: 'critical',
    tags: JSON.stringify(['attack.t1558.001'])
  },
  {
    id: 'SIG-NET-ARP-SPOOF',
    title: 'ARP Spoofing Detection',
    status: 'stable',
    description: 'Detects ARP cache poisoning events from network monitoring',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'network', product: 'suricata' }),
    detection: JSON.stringify({ selection: { raw_payload: 'ARP Spoofing' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1557.002'])
  },
  {
    id: 'SIG-WEB-XSS',
    title: 'Stored XSS Payload Injection',
    status: 'stable',
    description: 'Detects script tags in web request bodies indicating cross-site scripting attempts',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'web', product: 'nginx' }),
    detection: JSON.stringify({ selection: { raw_payload: '<script>' } }),
    level: 'high',
    tags: JSON.stringify(['attack.t1189'])
  },
  {
    id: 'SIG-NET-PORTSCAN',
    title: 'Nmap Reconnaissance Port Scan',
    status: 'stable',
    description: 'Detects high-volume SYN packets across multiple ports characteristic of port scanning',
    author: 'SOCLab Detection Team',
    logsource: JSON.stringify({ category: 'firewall', product: 'firewall' }),
    detection: JSON.stringify({ selection: { raw_payload: 'Nmap SYN Scan' } }),
    level: 'medium',
    tags: JSON.stringify(['attack.t1046'])
  }
];

for (const rule of defaultRules) {
  ruleStmt.run(rule.id, rule.title, rule.status, rule.description, rule.author, rule.logsource, rule.detection, rule.level, rule.tags);
}
console.log('Seeded default Sigma rules.');

console.log('Database initialization complete.');
