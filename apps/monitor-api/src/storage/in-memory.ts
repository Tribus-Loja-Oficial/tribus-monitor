import type {
  CheckResult,
  E2ERun,
  E2EScenarioResult,
  Incident,
  ServiceState,
} from '@tribus-monitor/core'
import type { CoverageSnapshot, StorageRepositories } from '../types'

export function createInMemoryRepositories(): StorageRepositories {
  const checkResults = new Map<string, CheckResult>()
  const serviceStates = new Map<string, ServiceState>()
  const incidents = new Map<string, Incident>()
  const coverage = new Map<string, CoverageSnapshot>()
  const e2eRuns = new Map<string, E2ERun>()
  const e2eResults = new Map<string, E2EScenarioResult>()

  return {
    checkResults: {
      async insertMany(rows) {
        for (const row of rows) checkResults.set(row.id, row)
      },
      async list(limit = 200) {
        return Array.from(checkResults.values())
          .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
          .slice(0, limit)
      },
    },
    serviceStates: {
      async get(serviceKey) {
        return serviceStates.get(serviceKey) ?? null
      },
      async upsert(state) {
        serviceStates.set(state.serviceKey, state)
      },
      async list() {
        return Array.from(serviceStates.values()).sort((a, b) =>
          a.serviceKey.localeCompare(b.serviceKey)
        )
      },
    },
    incidents: {
      async open(incident) {
        incidents.set(incident.id, incident)
      },
      async getOpenByService(serviceKey) {
        const open = Array.from(incidents.values()).find(
          (i) => i.serviceKey === serviceKey && i.resolvedAt === null
        )
        return open ?? null
      },
      async close(serviceKey, resolvedAt, reason) {
        const open = Array.from(incidents.values()).find(
          (i) => i.serviceKey === serviceKey && i.resolvedAt === null
        )
        if (!open) return
        incidents.set(open.id, {
          ...open,
          resolvedAt,
          closeReason: reason,
          statusAtClose: 'healthy',
        })
      },
      async list(limit = 200) {
        return Array.from(incidents.values())
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
          .slice(0, limit)
      },
    },
    coverage: {
      async upsert(snapshot) {
        coverage.set(snapshot.repoKey, snapshot)
      },
      async list() {
        return Array.from(coverage.values()).sort((a, b) => a.repoKey.localeCompare(b.repoKey))
      },
    },
    e2e: {
      async insertRun(run, results) {
        e2eRuns.set(run.id, run)
        for (const r of results) e2eResults.set(r.id, r)
      },
      async listRuns(limit = 30) {
        return Array.from(e2eRuns.values())
          .sort((a, b) => b.emittedAt.localeCompare(a.emittedAt))
          .slice(0, limit)
      },
      async listResultsByRun(runId) {
        return Array.from(e2eResults.values())
          .filter((r) => r.runId === runId)
          .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      },
      async deleteRun(runId) {
        e2eRuns.delete(runId)
        for (const id of [...e2eResults.keys()]) {
          const row = e2eResults.get(id)
          if (row?.runId === runId) e2eResults.delete(id)
        }
      },
    },
  }
}
