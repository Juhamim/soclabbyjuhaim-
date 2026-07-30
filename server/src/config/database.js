import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'soclab.db');
const db = new DatabaseSync(dbPath);

export function initSchema() {
  db.exec(`
    -- Users & RBAC
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Logs Table
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME NOT NULL,
      source_type TEXT NOT NULL,
      host_name TEXT NOT NULL,
      severity TEXT DEFAULT 'INFO',
      event_id INTEGER,
      process_name TEXT,
      user_name TEXT,
      src_ip TEXT,
      dest_ip TEXT,
      raw_payload TEXT NOT NULL,
      is_simulated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Alerts Table
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      mitre_tactic TEXT,
      mitre_technique TEXT,
      description TEXT,
      source_log_id TEXT,
      status TEXT DEFAULT 'NEW',
      assigned_to TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Incidents Table
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      mitre_techniques TEXT,
      evidence_items TEXT,
      assigned_to TEXT,
      summary TEXT,
      root_cause TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Sigma Rules Table
    CREATE TABLE IF NOT EXISTS sigma_rules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'stable',
      description TEXT,
      author TEXT,
      logsource TEXT NOT NULL,
      detection TEXT NOT NULL,
      level TEXT NOT NULL,
      tags TEXT,
      is_custom INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1
    );

    -- Academy Lab Progress
    CREATE TABLE IF NOT EXISTS lab_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      lab_id TEXT NOT NULL,
      status TEXT DEFAULT 'NOT_STARTED',
      score INTEGER DEFAULT 0,
      completed_at DATETIME
    );

    -- System Telemetry Snapshots
    CREATE TABLE IF NOT EXISTS system_telemetry (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      cpu_percent REAL,
      memory_percent REAL,
      disk_percent REAL,
      net_sent_mb REAL,
      net_recv_mb REAL,
      active_connections INTEGER,
      listening_ports INTEGER,
      active_processes INTEGER,
      logged_users INTEGER,
      network_details TEXT
    );
  `);
}

export default db;
