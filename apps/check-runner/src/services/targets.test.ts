import { describe, expect, it } from 'vitest'
import { buildTargets } from './targets'

describe('buildTargets', () => {
  it('builds storefront and ops targets per niche', () => {
    const targets = buildTargets({
      storefrontBaseUrl: 'https://storefront.example',
      opsBaseUrl: 'https://ops.example',
      beBaseUrl: 'https://be.example',
      niches: ['corrida'],
    })
    expect(targets.length).toBe(6)
    expect(targets.some((t) => t.serviceKey.includes('storefront-health-woo'))).toBe(true)
    expect(targets.some((t) => t.serviceKey.includes('ops-health'))).toBe(true)
    expect(targets.some((t) => t.serviceKey.includes('be-catalog-products'))).toBe(true)
  })
})
