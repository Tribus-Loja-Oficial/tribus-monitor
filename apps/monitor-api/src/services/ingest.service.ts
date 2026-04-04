import {
  buildIncidentOpen,
  computeNextServiceState,
  shouldCloseIncident,
  shouldOpenIncident,
  type CheckResultInput,
} from '@tribus-monitor/core'
import type { StorageRepositories } from '../types'

export async function ingestChecks(
  repositories: StorageRepositories,
  checks: CheckResultInput[],
  nowIso: string
) {
  const enriched = checks.map((check) => ({
    ...check,
    id: crypto.randomUUID(),
    createdAt: nowIso,
  }))

  await repositories.checkResults.insertMany(enriched)

  for (const check of checks) {
    const prev = await repositories.serviceStates.get(check.serviceKey)
    const next = computeNextServiceState(prev, check, nowIso)
    await repositories.serviceStates.upsert(next)

    const openIncident = await repositories.incidents.getOpenByService(check.serviceKey)
    if (shouldOpenIncident(prev, next) && !openIncident) {
      await repositories.incidents.open(buildIncidentOpen(next, next.lastError, nowIso))
      continue
    }
    if (shouldCloseIncident(prev, next, openIncident !== null)) {
      await repositories.incidents.close(check.serviceKey, nowIso, 'service recovered')
    }
  }

  return {
    ingested: checks.length,
  }
}
