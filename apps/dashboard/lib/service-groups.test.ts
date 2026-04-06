import { describe, expect, it } from 'vitest'
import { groupServicesByDomain } from './service-groups'
import type { ServiceState } from '@tribus-monitor/core'

const base: Omit<ServiceState, 'serviceKey' | 'serviceName' | 'kind'> = {
  niche: 'corrida',
  status: 'healthy',
  consecutiveFailures: 0,
  lastLatencyMs: 120,
  lastCheckAt: '2026-01-01T00:00:00.000Z',
  lastOkAt: '2026-01-01T00:00:00.000Z',
  lastError: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('groupServicesByDomain', () => {
  it('groups services by domain prefixes', () => {
    const groups = groupServicesByDomain([
      {
        ...base,
        serviceKey: 'storefront-health-corrida',
        serviceName: 'a',
        kind: 'storefront-api',
      },
      { ...base, serviceKey: 'ops-health-corrida', serviceName: 'b', kind: 'ops-api' },
      { ...base, serviceKey: 'be-catalog-products-corrida', serviceName: 'c', kind: 'be-api' },
    ])

    expect(groups.find((g) => g.key === 'storefront')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'ops')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'be')?.services.length).toBe(1)
  })
})
