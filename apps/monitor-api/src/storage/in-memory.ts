import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'
import type { StorageRepositories } from '../types'

const checkResults = new Map<string, CheckResult>()
const serviceStates = new Map<string, ServiceState>()
const incidents = new Map<string, Incident>()

export function createInMemoryRepositories(): StorageRepositories {
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
        return Array.from(serviceStates.values()).sort((a, b) => a.serviceKey.localeCompare(b.serviceKey))
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
  }
}
