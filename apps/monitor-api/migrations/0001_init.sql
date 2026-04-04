CREATE TABLE IF NOT EXISTS check_results (
  id TEXT PRIMARY KEY,
  service_key TEXT NOT NULL,
  service_name TEXT NOT NULL,
  kind TEXT NOT NULL,
  niche TEXT NOT NULL,
  url TEXT NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER NOT NULL,
  ok INTEGER NOT NULL,
  error TEXT,
  checked_at TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_states (
  service_key TEXT PRIMARY KEY,
  service_name TEXT NOT NULL,
  kind TEXT NOT NULL,
  niche TEXT NOT NULL,
  status TEXT NOT NULL,
  consecutive_failures INTEGER NOT NULL,
  last_latency_ms INTEGER NOT NULL,
  last_check_at TEXT NOT NULL,
  last_ok_at TEXT,
  last_error TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  service_key TEXT NOT NULL,
  service_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  started_at TEXT NOT NULL,
  resolved_at TEXT,
  status_at_open TEXT NOT NULL,
  status_at_close TEXT,
  open_reason TEXT,
  close_reason TEXT
);
