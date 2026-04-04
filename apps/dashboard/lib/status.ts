import type { ServiceState } from '@tribus-monitor/core'

export type GlobalPlatformStatus = 'all_operational' | 'degraded' | 'incident_active'

export function getGlobalPlatformStatus(services: ServiceState[]): GlobalPlatformStatus {
  if (services.some((service) => service.status === 'down')) return 'incident_active'
  if (services.some((service) => service.status === 'degraded')) return 'degraded'
  return 'all_operational'
}

export function getServiceStatusPriority(status: ServiceState['status']): number {
  if (status === 'down') return 0
  if (status === 'degraded') return 1
  return 2
}
