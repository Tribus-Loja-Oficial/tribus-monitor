CREATE TABLE IF NOT EXISTS coverage_snapshots (
  repo_key TEXT PRIMARY KEY,
  repo_name TEXT NOT NULL,
  lines REAL NOT NULL,
  functions REAL NOT NULL,
  branches REAL NOT NULL,
  statements REAL NOT NULL,
  commit_sha TEXT,
  run_url TEXT,
  updated_at TEXT NOT NULL
);
