import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'
import { normalizeCoverageSnapshot, type CoverageSnapshot } from './coverage'

export interface DashboardData {
  services: ServiceState[]
  incidents: Incident[]
  historyCount: number
  checks: CheckResult[]
  coverage: CoverageSnapshot
}

function getMonitorApiBaseUrl() {
  return process.env.MONITOR_API_URL ?? 'http://localhost:8787'
}

export async function fetchDashboardDataFromBase(baseUrl: string): Promise<DashboardData> {
  const [statusRes, incidentsRes, historyRes, coverageRes] = await Promise.all([
    fetch(`${baseUrl}/status`, { cache: 'no-store' }),
    fetch(`${baseUrl}/incidents?limit=20`, { cache: 'no-store' }),
    fetch(`${baseUrl}/history?limit=200`, { cache: 'no-store' }),
    fetch(`${baseUrl}/coverage`, { cache: 'no-store' }),
  ])

  if (!statusRes.ok || !incidentsRes.ok || !historyRes.ok) {
    throw new Error('Dashboard data request failed.')
  }

  const [statusBody, incidentsBody, historyBody] = await Promise.all([
    statusRes.json() as Promise<{ services: ServiceState[] }>,
    incidentsRes.json() as Promise<{ incidents: Incident[] }>,
    historyRes.json() as Promise<{ checks: CheckResult[] }>,
  ])
  const coverageBody = coverageRes.ok
    ? ((await coverageRes.json()) as { repos?: unknown[] })
    : { repos: [] as unknown[] }

  return {
    services: statusBody.services,
    incidents: incidentsBody.incidents,
    historyCount: historyBody.checks.length,
    checks: historyBody.checks,
    coverage: normalizeCoverageSnapshot(coverageBody.repos),
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchDashboardDataFromBase(getMonitorApiBaseUrl())
}
