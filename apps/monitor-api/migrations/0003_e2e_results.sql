CREATE TABLE IF NOT EXISTS e2e_runs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  runner TEXT NOT NULL,
  environment TEXT NOT NULL,
  emitted_at TEXT NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  skipped INTEGER NOT NULL,
  pass_rate REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS e2e_runs_emitted_at ON e2e_runs(emitted_at DESC);

CREATE TABLE IF NOT EXISTS e2e_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  suite_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  criticality TEXT NOT NULL,
  failure_type TEXT,
  duration_ms INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES e2e_runs(id)
);

CREATE INDEX IF NOT EXISTS e2e_results_run_id ON e2e_results(run_id);
