import type {
  CheckResult,
  E2ERun,
  E2EScenarioResult,
  Incident,
  ServiceState,
} from '@tribus-monitor/core'
import type { CoverageSnapshot, StorageRepositories } from '../types'
import { createInMemoryRepositories } from './in-memory'

type D1Prepared = {
  bind: (...values: unknown[]) => D1Prepared
  run: () => Promise<unknown>
  first: <T>() => Promise<T | null>
  all: <T>() => Promise<{ results: T[] }>
}

type D1DatabaseLike = {
  prepare: (query: string) => D1Prepared
}

type CheckResultRow = {
  id: string
  service_key: string
  service_name: string
  kind: CheckResult['kind']
  niche: string
  url: string
  status_code: number | null
  latency_ms: number
  ok: number
  error: string | null
  checked_at: string
  source: CheckResult['source']
  created_at: string
}

type ServiceStateRow = {
  service_key: string
  service_name: string
  kind: ServiceState['kind']
  niche: string
  status: ServiceState['status']
  consecutive_failures: number
  last_latency_ms: number
  last_check_at: string
  last_ok_at: string | null
  last_error: string | null
  updated_at: string
}

type IncidentRow = {
  id: string
  service_key: string
  service_name: string
  niche: string
  started_at: string
  resolved_at: string | null
  status_at_open: Incident['statusAtOpen']
  status_at_close: Incident['statusAtClose']
  open_reason: string | null
  close_reason: string | null
}

type CoverageRow = {
  repo_key: CoverageSnapshot['repoKey']
  repo_name: string
  lines: number
  functions: number
  branches: number
  statements: number
  commit_sha: string | null
  run_url: string | null
  updated_at: string
}

type E2ERunRow = {
  id: string
  source: string
  runner: string
  environment: string
  emitted_at: string
  total: number
  passed: number
  failed: number
  skipped: number
  pass_rate: number
  created_at: string
}

type E2EResultRow = {
  id: string
  run_id: string
  suite_id: string
  scenario_id: string
  scenario_name: string
  niche: string
  environment: string
  status: string
  criticality: string
  failure_type: string | null
  error_message: string | null
  duration_ms: number
  started_at: string
  finished_at: string
}

function mapE2ERun(row: E2ERunRow): E2ERun {
  return {
    id: row.id,
    source: row.source,
    runner: row.runner,
    environment: row.environment,
    emittedAt: row.emitted_at,
    total: row.total,
    passed: row.passed,
    failed: row.failed,
    skipped: row.skipped,
    passRate: row.pass_rate,
    createdAt: row.created_at,
  }
}

function mapE2EResult(row: E2EResultRow): E2EScenarioResult {
  return {
    id: row.id,
    runId: row.run_id,
    suiteId: row.suite_id,
    scenarioId: row.scenario_id,
    scenarioName: row.scenario_name,
    niche: row.niche,
    environment: row.environment,
    status: row.status as E2EScenarioResult['status'],
    criticality: row.criticality,
    failureType: row.failure_type,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  }
}

function asD1Database(binding: unknown): D1DatabaseLike | null {
  if (!binding || typeof binding !== 'object') return null
  if (!('prepare' in binding) || typeof binding.prepare !== 'function') return null
  return binding as D1DatabaseLike
}

function mapCheckResult(row: CheckResultRow): CheckResult {
  return {
    id: row.id,
    serviceKey: row.service_key,
    serviceName: row.service_name,
    kind: row.kind,
    niche: row.niche,
    url: row.url,
    statusCode: row.status_code,
    latencyMs: row.latency_ms,
    ok: row.ok === 1,
    error: row.error,
    checkedAt: row.checked_at,
    source: row.source,
    createdAt: row.created_at,
  }
}

function mapServiceState(row: ServiceStateRow): ServiceState {
  return {
    serviceKey: row.service_key,
    serviceName: row.service_name,
    kind: row.kind,
    niche: row.niche,
    status: row.status,
    consecutiveFailures: row.consecutive_failures,
    lastLatencyMs: row.last_latency_ms,
    lastCheckAt: row.last_check_at,
    lastOkAt: row.last_ok_at,
    lastError: row.last_error,
    updatedAt: row.updated_at,
  }
}

function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    serviceKey: row.service_key,
    serviceName: row.service_name,
    niche: row.niche,
    startedAt: row.started_at,
    resolvedAt: row.resolved_at,
    statusAtOpen: row.status_at_open,
    statusAtClose: row.status_at_close,
    openReason: row.open_reason,
    closeReason: row.close_reason,
  }
}

function mapCoverage(row: CoverageRow): CoverageSnapshot {
  return {
    repoKey: row.repo_key,
    repoName: row.repo_name,
    lines: row.lines,
    functions: row.functions,
    branches: row.branches,
    statements: row.statements,
    commitSha: row.commit_sha,
    runUrl: row.run_url,
    updatedAt: row.updated_at,
  }
}

export function createD1Repositories(dbBinding: unknown): StorageRepositories {
  const db = asD1Database(dbBinding)
  if (!db) return createInMemoryRepositories()

  return {
    checkResults: {
      async insertMany(rows) {
        if (rows.length === 0) return

        const statements: D1Prepared[] = []
        for (const row of rows) {
          statements.push(
            db
              .prepare(
                `
              INSERT INTO check_results (
                id, service_key, service_name, kind, niche, url, status_code, latency_ms, ok, error, checked_at, source, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `
              )
              .bind(
                row.id,
                row.serviceKey,
                row.serviceName,
                row.kind,
                row.niche,
                row.url,
                row.statusCode,
                row.latencyMs,
                row.ok ? 1 : 0,
                row.error,
                row.checkedAt,
                row.source,
                row.createdAt
              )
          )
        }

        if ('batch' in db) {
          await (db as unknown as { batch: (stmts: D1Prepared[]) => Promise<unknown> }).batch(
            statements
          )
        } else {
          for (const stmt of statements) {
            await stmt.run()
          }
        }
      },
      async list(limit = 200) {
        const result = await db
          .prepare(
            `
            SELECT
              id, service_key, service_name, kind, niche, url, status_code, latency_ms, ok, error, checked_at, source, created_at
            FROM check_results
            ORDER BY checked_at DESC
            LIMIT ?
            `
          )
          .bind(limit)
          .all<CheckResultRow>()

        return result.results.map(mapCheckResult)
      },
    },
    serviceStates: {
      async get(serviceKey) {
        const row = await db
          .prepare(
            `
            SELECT
              service_key, service_name, kind, niche, status, consecutive_failures, last_latency_ms, last_check_at, last_ok_at, last_error, updated_at
            FROM service_states
            WHERE service_key = ?
            LIMIT 1
            `
          )
          .bind(serviceKey)
          .first<ServiceStateRow>()

        return row ? mapServiceState(row) : null
      },
      async upsert(state) {
        await db
          .prepare(
            `
            INSERT INTO service_states (
              service_key, service_name, kind, niche, status, consecutive_failures, last_latency_ms, last_check_at, last_ok_at, last_error, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(service_key) DO UPDATE SET
              service_name = excluded.service_name,
              kind = excluded.kind,
              niche = excluded.niche,
              status = excluded.status,
              consecutive_failures = excluded.consecutive_failures,
              last_latency_ms = excluded.last_latency_ms,
              last_check_at = excluded.last_check_at,
              last_ok_at = excluded.last_ok_at,
              last_error = excluded.last_error,
              updated_at = excluded.updated_at
            `
          )
          .bind(
            state.serviceKey,
            state.serviceName,
            state.kind,
            state.niche,
            state.status,
            state.consecutiveFailures,
            state.lastLatencyMs,
            state.lastCheckAt,
            state.lastOkAt,
            state.lastError,
            state.updatedAt
          )
          .run()
      },
      async list() {
        const result = await db
          .prepare(
            `
            SELECT
              service_key, service_name, kind, niche, status, consecutive_failures, last_latency_ms, last_check_at, last_ok_at, last_error, updated_at
            FROM service_states
            ORDER BY service_key ASC
            `
          )
          .all<ServiceStateRow>()

        return result.results.map(mapServiceState)
      },
    },
    incidents: {
      async open(incident) {
        await db
          .prepare(
            `
            INSERT INTO incidents (
              id, service_key, service_name, niche, started_at, resolved_at, status_at_open, status_at_close, open_reason, close_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `
          )
          .bind(
            incident.id,
            incident.serviceKey,
            incident.serviceName,
            incident.niche,
            incident.startedAt,
            incident.resolvedAt,
            incident.statusAtOpen,
            incident.statusAtClose,
            incident.openReason,
            incident.closeReason
          )
          .run()
      },
      async getOpenByService(serviceKey) {
        const row = await db
          .prepare(
            `
            SELECT
              id, service_key, service_name, niche, started_at, resolved_at, status_at_open, status_at_close, open_reason, close_reason
            FROM incidents
            WHERE service_key = ? AND resolved_at IS NULL
            ORDER BY started_at DESC
            LIMIT 1
            `
          )
          .bind(serviceKey)
          .first<IncidentRow>()

        return row ? mapIncident(row) : null
      },
      async close(serviceKey, resolvedAt, reason) {
        await db
          .prepare(
            `
            UPDATE incidents
            SET resolved_at = ?, close_reason = ?, status_at_close = 'healthy'
            WHERE id = (
              SELECT id
              FROM incidents
              WHERE service_key = ? AND resolved_at IS NULL
              ORDER BY started_at DESC
              LIMIT 1
            )
            `
          )
          .bind(resolvedAt, reason, serviceKey)
          .run()
      },
      async list(limit = 200) {
        const result = await db
          .prepare(
            `
            SELECT
              id, service_key, service_name, niche, started_at, resolved_at, status_at_open, status_at_close, open_reason, close_reason
            FROM incidents
            ORDER BY started_at DESC
            LIMIT ?
            `
          )
          .bind(limit)
          .all<IncidentRow>()

        return result.results.map(mapIncident)
      },
    },
    coverage: {
      async upsert(snapshot) {
        await db
          .prepare(
            `
            INSERT INTO coverage_snapshots (
              repo_key, repo_name, lines, functions, branches, statements, commit_sha, run_url, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(repo_key) DO UPDATE SET
              repo_name = excluded.repo_name,
              lines = excluded.lines,
              functions = excluded.functions,
              branches = excluded.branches,
              statements = excluded.statements,
              commit_sha = excluded.commit_sha,
              run_url = excluded.run_url,
              updated_at = excluded.updated_at
            `
          )
          .bind(
            snapshot.repoKey,
            snapshot.repoName,
            snapshot.lines,
            snapshot.functions,
            snapshot.branches,
            snapshot.statements,
            snapshot.commitSha,
            snapshot.runUrl,
            snapshot.updatedAt
          )
          .run()
      },
      async list() {
        const result = await db
          .prepare(
            `
            SELECT
              repo_key, repo_name, lines, functions, branches, statements, commit_sha, run_url, updated_at
            FROM coverage_snapshots
            ORDER BY repo_key ASC
            `
          )
          .all<CoverageRow>()

        return result.results.map(mapCoverage)
      },
    },
    e2e: {
      async insertRun(run, results) {
        const statements: D1Prepared[] = [
          db
            .prepare(
              `INSERT INTO e2e_runs (id, source, runner, environment, emitted_at, total, passed, failed, skipped, pass_rate, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              run.id,
              run.source,
              run.runner,
              run.environment,
              run.emittedAt,
              run.total,
              run.passed,
              run.failed,
              run.skipped,
              run.passRate,
              run.createdAt
            ),
        ]

        for (const r of results) {
          statements.push(
            db
              .prepare(
                `INSERT INTO e2e_results (id, run_id, suite_id, scenario_id, scenario_name, niche, environment, status, criticality, failure_type, error_message, duration_ms, started_at, finished_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .bind(
                r.id,
                r.runId,
                r.suiteId,
                r.scenarioId,
                r.scenarioName,
                r.niche,
                r.environment,
                r.status,
                r.criticality,
                r.failureType,
                r.errorMessage,
                r.durationMs,
                r.startedAt,
                r.finishedAt
              )
          )
        }

        if ('batch' in db) {
          await (db as unknown as { batch: (stmts: D1Prepared[]) => Promise<unknown> }).batch(
            statements
          )
        } else {
          for (const stmt of statements) {
            await stmt.run()
          }
        }
      },
      async listRuns(limit = 30) {
        const result = await db
          .prepare(`SELECT * FROM e2e_runs ORDER BY emitted_at DESC LIMIT ?`)
          .bind(limit)
          .all<E2ERunRow>()
        return result.results.map(mapE2ERun)
      },
      async listResultsByRun(runId) {
        const result = await db
          .prepare(`SELECT * FROM e2e_results WHERE run_id = ? ORDER BY started_at ASC`)
          .bind(runId)
          .all<E2EResultRow>()
        return result.results.map(mapE2EResult)
      },
    },
  }
}
