import { describe, expect, it } from 'vitest'
import type { ServiceState } from '@tribus-monitor/core'
import { getGlobalPlatformStatus, getServiceStatusPriority } from './status'

const base: Omit<ServiceState, 'serviceKey' | 'serviceName' | 'kind'> = {
  niche: 'c',
  consecutiveFailures: 0,
  lastLatencyMs: 1,
  lastCheckAt: 'x',
  lastOkAt: null,
  lastError: null,
  updatedAt: 'x',
}

describe('status helpers', () => {
  it('classifies global platform status', () => {
    expect(
      getGlobalPlatformStatus([
        { ...base, serviceKey: 'a', serviceName: 'a', kind: 'storefront-api', status: 'healthy' },
      ])
    ).toBe('all_operational')
    expect(
      getGlobalPlatformStatus([
        { ...base, serviceKey: 'a', serviceName: 'a', kind: 'storefront-api', status: 'degraded' },
      ])
    ).toBe('degraded')
    expect(
      getGlobalPlatformStatus([
        { ...base, serviceKey: 'a', serviceName: 'a', kind: 'storefront-api', status: 'down' },
      ])
    ).toBe('incident_active')
  })

  it('orders status priority', () => {
    expect(getServiceStatusPriority('down')).toBeLessThan(getServiceStatusPriority('degraded'))
    expect(getServiceStatusPriority('degraded')).toBeLessThan(getServiceStatusPriority('healthy'))
  })
})
