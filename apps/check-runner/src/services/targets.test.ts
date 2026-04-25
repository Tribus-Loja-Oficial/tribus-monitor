import { describe, expect, it } from 'vitest'
import { buildTargets } from './targets'

describe('buildTargets', () => {
  const baseInput = {
    storefrontBaseUrl: 'https://storefront.example',
    opsBaseUrl: 'https://ops.example',
    beBaseUrl: 'https://be.example',
    cdsBaseUrl: 'https://cds.example',
    hubApiBaseUrl: 'https://hub-api.example',
    hubWebBaseUrl: 'https://hub.example',
  }

  it('builds storefront, ops, be, cds, and hub targets for one niche', () => {
    const targets = buildTargets({ ...baseInput, niches: ['corrida'] })
    expect(targets.length).toBe(9)
    expect(targets.some((t) => t.serviceKey.includes('storefront-health-woo'))).toBe(true)
    expect(targets.some((t) => t.serviceKey.includes('ops-health'))).toBe(true)
    expect(targets.some((t) => t.serviceKey.includes('be-catalog-products'))).toBe(true)
    expect(targets.some((t) => t.serviceKey === 'cds-health')).toBe(true)
    expect(targets.some((t) => t.serviceKey === 'hub-api-health')).toBe(true)
    expect(targets.some((t) => t.serviceKey === 'hub-web-health')).toBe(true)
  })

  it('duplicates per-niche targets but keeps platform targets as single entries', () => {
    const targets = buildTargets({ ...baseInput, niches: ['a', 'b'] })
    expect(targets.length).toBe(15)
    expect(targets.filter((t) => t.serviceKey === 'cds-health').length).toBe(1)
    expect(targets.filter((t) => t.serviceKey === 'hub-api-health').length).toBe(1)
    expect(targets.filter((t) => t.serviceKey === 'hub-web-health').length).toBe(1)
  })
})
