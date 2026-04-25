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
      { ...base, niche: 'platform', serviceKey: 'cds-health', serviceName: 'd', kind: 'cds-api' },
      {
        ...base,
        niche: 'platform',
        serviceKey: 'hub-api-health',
        serviceName: 'e',
        kind: 'hub-api',
      },
    ])

    expect(groups.find((g) => g.key === 'storefront')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'ops')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'be')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'cds')?.services.length).toBe(1)
    expect(groups.find((g) => g.key === 'hub')?.services.length).toBe(1)
  })

  it('places unknown keys in other and sorts by status then key', () => {
    const groups = groupServicesByDomain([
      {
        ...base,
        serviceKey: 'custom-thing',
        serviceName: 'x',
        kind: 'storefront-api',
        status: 'healthy',
      },
      {
        ...base,
        serviceKey: 'zzz-other',
        serviceName: 'z',
        kind: 'storefront-api',
        status: 'down',
      },
    ])
    const other = groups.find((g) => g.key === 'other')
    expect(other?.services.length).toBe(2)
    expect(other?.services[0]?.status).toBe('down')
  })

  it('sorts same-status services alphabetically by serviceKey', () => {
    const groups = groupServicesByDomain([
      {
        ...base,
        serviceKey: 'zebra',
        serviceName: 'z',
        kind: 'storefront-api',
        status: 'healthy',
      },
      {
        ...base,
        serviceKey: 'alpha',
        serviceName: 'a',
        kind: 'storefront-api',
        status: 'healthy',
      },
    ])
    const other = groups.find((g) => g.key === 'other')
    expect(other?.services.map((s) => s.serviceKey)).toEqual(['alpha', 'zebra'])
  })
})
