import { describe, expect, it, vi } from 'vitest'
import { runHttpCheck } from './http-check'

describe('runHttpCheck', () => {
  it('returns ok result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
    )
    const check = await runHttpCheck({
      serviceKey: 'k',
      serviceName: 'name',
      kind: 'storefront-api',
      niche: 'corrida',
      url: 'https://example.com',
    })
    expect(check.ok).toBe(true)
    expect(check.statusCode).toBe(200)
  })

  it('returns error result when request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    const check = await runHttpCheck({
      serviceKey: 'k',
      serviceName: 'name',
      kind: 'storefront-api',
      niche: 'corrida',
      url: 'https://example.com',
    })
    expect(check.ok).toBe(false)
    expect(check.statusCode).toBeNull()
    expect(check.error).toContain('timeout')
  })

  it('fails catalog-products check when response has no products', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      })
    )
    const check = await runHttpCheck({
      serviceKey: 'be-catalog-products-corrida',
      serviceName: 'BE catalog products (corrida)',
      kind: 'be-api',
      niche: 'corrida',
      url: 'https://be.example/corrida/wp-json/wc/store/v1/products?per_page=1&page=1',
      checkType: 'catalog-products',
    })
    expect(check.ok).toBe(false)
    expect(check.error).toContain('No products')
  })
})
