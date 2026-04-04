import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'

export interface DashboardData {
  services: ServiceState[]
  incidents: Incident[]
  historyCount: number
  checks: CheckResult[]
}

function getMonitorApiBaseUrl() {
  return process.env.MONITOR_API_URL ?? 'http://localhost:8787'
}

export async function fetchDashboardDataFromBase(baseUrl: string): Promise<DashboardData> {
  const [statusRes, incidentsRes, historyRes] = await Promise.all([
    fetch(`${baseUrl}/status`, { cache: 'no-store' }),
    fetch(`${baseUrl}/incidents?limit=20`, { cache: 'no-store' }),
    fetch(`${baseUrl}/history?limit=200`, { cache: 'no-store' }),
  ])

  if (!statusRes.ok || !incidentsRes.ok || !historyRes.ok) {
    throw new Error('Dashboard data request failed.')
  }

  const [statusBody, incidentsBody, historyBody] = await Promise.all([
    statusRes.json() as Promise<{ services: ServiceState[] }>,
    incidentsRes.json() as Promise<{ incidents: Incident[] }>,
    historyRes.json() as Promise<{ checks: CheckResult[] }>,
  ])

  return {
    services: statusBody.services,
    incidents: incidentsBody.incidents,
    historyCount: historyBody.checks.length,
    checks: historyBody.checks,
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchDashboardDataFromBase(getMonitorApiBaseUrl())
}
