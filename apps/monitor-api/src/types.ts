import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'

export type CoverageRepoKey = 'tribus-storefront' | 'tribus-ops' | 'tribus-monitor' | 'real-state'

export interface CoverageSnapshot {
  repoKey: CoverageRepoKey
  repoName: string
  lines: number
  functions: number
  branches: number
  statements: number
  commitSha: string | null
  runUrl: string | null
  updatedAt: string
}

export interface StorageRepositories {
  checkResults: {
    insertMany(rows: CheckResult[]): Promise<void>
    list(limit?: number): Promise<CheckResult[]>
  }
  serviceStates: {
    get(serviceKey: string): Promise<ServiceState | null>
    upsert(state: ServiceState): Promise<void>
    list(): Promise<ServiceState[]>
  }
  incidents: {
    open(incident: Incident): Promise<void>
    getOpenByService(serviceKey: string): Promise<Incident | null>
    close(serviceKey: string, resolvedAt: string, reason: string | null): Promise<void>
    list(limit?: number): Promise<Incident[]>
  }
  coverage: {
    upsert(snapshot: CoverageSnapshot): Promise<void>
    list(): Promise<CoverageSnapshot[]>
  }
}

export interface MonitorEnv {
  MONITOR_CHECKS_TOKEN?: string
  MONITOR_COVERAGE_TOKEN?: string
  DB?: unknown
  SERVICES_KV?: unknown
}
