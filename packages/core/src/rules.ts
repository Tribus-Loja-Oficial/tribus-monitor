import type { CheckResultInput, Incident, ServiceState, ServiceStatus } from './types.js'

export function getStatusFromFailures(consecutiveFailures: number): ServiceStatus {
  if (consecutiveFailures <= 0) return 'healthy'
  if (consecutiveFailures <= 2) return 'degraded'
  return 'down'
}

export function computeNextServiceState(
  previous: ServiceState | null,
  check: CheckResultInput,
  nowIso: string
): ServiceState {
  const prevFailures = previous?.consecutiveFailures ?? 0
  const nextFailures = check.ok ? 0 : prevFailures + 1
  const nextStatus = getStatusFromFailures(nextFailures)

  return {
    serviceKey: check.serviceKey,
    serviceName: check.serviceName,
    kind: check.kind,
    niche: check.niche,
    status: nextStatus,
    consecutiveFailures: nextFailures,
    lastLatencyMs: check.latencyMs,
    lastCheckAt: check.checkedAt,
    lastOkAt: check.ok ? check.checkedAt : (previous?.lastOkAt ?? null),
    lastError: check.ok ? null : (check.error ?? `HTTP ${check.statusCode ?? 0}`),
    updatedAt: nowIso,
  }
}

export function shouldOpenIncident(previous: ServiceState | null, next: ServiceState): boolean {
  return previous?.status !== 'down' && next.status === 'down'
}

export function shouldCloseIncident(
  previous: ServiceState | null,
  next: ServiceState,
  hasOpenIncident: boolean
): boolean {
  if (!hasOpenIncident) return false
  if (!previous) return false
  return previous.status === 'down' && next.status === 'healthy'
}

export function buildIncidentOpen(service: ServiceState, reason: string | null, nowIso: string): Incident {
  return {
    id: crypto.randomUUID(),
    serviceKey: service.serviceKey,
    serviceName: service.serviceName,
    niche: service.niche,
    startedAt: nowIso,
    resolvedAt: null,
    statusAtOpen: service.status,
    statusAtClose: null,
    openReason: reason,
    closeReason: null,
  }
}
