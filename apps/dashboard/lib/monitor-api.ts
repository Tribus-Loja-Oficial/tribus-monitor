import type {
  CheckResult,
  E2ERun,
  E2EScenarioResult,
  Incident,
  ServiceState,
} from '@tribus-monitor/core'
import { normalizeCoverageSnapshot, type CoverageSnapshot } from './coverage'

export interface E2EData {
  runs: E2ERun[]
  latestResults: E2EScenarioResult[]
}

export interface DashboardData {
  services: ServiceState[]
  incidents: Incident[]
  historyCount: number
  checks: CheckResult[]
  coverage: CoverageSnapshot
  e2e: E2EData
}

function getMonitorApiBaseUrl() {
  return process.env.MONITOR_API_URL ?? 'http://localhost:8787'
}

export async function fetchDashboardDataFromBase(baseUrl: string): Promise<DashboardData> {
  const res = await fetch(`${baseUrl}/dashboard`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Dashboard data request failed.')

  const body = (await res.json()) as {
    services: ServiceState[]
    incidents: Incident[]
    checks: CheckResult[]
    repos: unknown[]
    e2eRuns: E2ERun[]
    e2eLatestResults: E2EScenarioResult[]
  }

  return {
    services: body.services,
    incidents: body.incidents,
    historyCount: body.checks.length,
    checks: body.checks,
    coverage: normalizeCoverageSnapshot(body.repos),
    e2e: { runs: body.e2eRuns, latestResults: body.e2eLatestResults },
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchDashboardDataFromBase(getMonitorApiBaseUrl())
}
