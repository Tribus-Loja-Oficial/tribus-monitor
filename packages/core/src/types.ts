export type SourceType = 'check-runner' | 'future'

export type ServiceStatus = 'healthy' | 'degraded' | 'down'

export type ServiceKind = 'storefront-page' | 'storefront-api' | 'ops-api' | 'be-api'

export interface ServiceDefinition {
  serviceKey: string
  serviceName: string
  kind: ServiceKind
  niche: string
  url: string
}

export interface CheckResultInput {
  serviceKey: string
  serviceName: string
  kind: ServiceKind
  niche: string
  url: string
  statusCode: number | null
  latencyMs: number
  ok: boolean
  error: string | null
  checkedAt: string
  source: SourceType
}

export interface CheckResult extends CheckResultInput {
  id: string
  createdAt: string
}

export interface ServiceState {
  serviceKey: string
  serviceName: string
  kind: ServiceKind
  niche: string
  status: ServiceStatus
  consecutiveFailures: number
  lastLatencyMs: number
  lastCheckAt: string
  lastOkAt: string | null
  lastError: string | null
  updatedAt: string
}

export type E2EScenarioStatus = 'passed' | 'failed' | 'skipped' | 'timedout'

export interface E2ERun {
  id: string
  source: string
  runner: string
  environment: string
  emittedAt: string
  total: number
  passed: number
  failed: number
  skipped: number
  passRate: number
  createdAt: string
}

export interface E2EScenarioResult {
  id: string
  runId: string
  suiteId: string
  scenarioId: string
  scenarioName: string
  niche: string
  environment: string
  status: E2EScenarioStatus
  criticality: string
  failureType: string | null
  durationMs: number
  startedAt: string
  finishedAt: string
}

export interface Incident {
  id: string
  serviceKey: string
  serviceName: string
  niche: string
  startedAt: string
  resolvedAt: string | null
  statusAtOpen: ServiceStatus
  statusAtClose: ServiceStatus | null
  openReason: string | null
  closeReason: string | null
}
