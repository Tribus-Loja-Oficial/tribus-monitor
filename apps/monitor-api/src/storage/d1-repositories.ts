import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'
import type { StorageRepositories } from '../types'
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

export function createD1Repositories(dbBinding: unknown): StorageRepositories {
  const db = asD1Database(dbBinding)
  if (!db) return createInMemoryRepositories()

  return {
    checkResults: {
      async insertMany(rows) {
        for (const row of rows) {
          await db
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
            .run()
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
  }
}
