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
    data: {
      services: ServiceState[]
      incidents: Incident[]
      checks: CheckResult[]
      repos: unknown[]
      e2eRuns: E2ERun[]
      e2eLatestResults: E2EScenarioResult[]
    }
  }
  const d = body.data

  return {
    services: d.services,
    incidents: d.incidents,
    historyCount: d.checks.length,
    checks: d.checks,
    coverage: normalizeCoverageSnapshot(d.repos),
    e2e: { runs: d.e2eRuns, latestResults: d.e2eLatestResults },
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchDashboardDataFromBase(getMonitorApiBaseUrl())
}
