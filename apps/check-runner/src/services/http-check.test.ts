import { afterEach, describe, expect, it, vi } from 'vitest'
import { runHttpCheck } from './http-check'

describe('runHttpCheck', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('marks failure on non-ok HTTP without running catalog validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })
    )
    const check = await runHttpCheck({
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api',
      niche: 'corrida',
      url: 'https://example.com',
    })
    expect(check.ok).toBe(false)
    expect(check.error).toContain('503')
  })

  it('passes catalog-products when payload is valid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: 1, name: 'P', permalink: 'https://x' }],
      })
    )
    const check = await runHttpCheck({
      serviceKey: 'be-catalog-products-corrida',
      serviceName: 'BE',
      kind: 'be-api',
      niche: 'corrida',
      url: 'https://be.example/corrida/wp-json/wc/store/v1/products?per_page=1&page=1',
      checkType: 'catalog-products',
    })
    expect(check.ok).toBe(true)
  })

  it('fails catalog-products when product fields are incomplete', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: 'bad', name: 'P', permalink: 'x' }],
      })
    )
    const check = await runHttpCheck({
      serviceKey: 'be-catalog-products-corrida',
      serviceName: 'BE',
      kind: 'be-api',
      niche: 'corrida',
      url: 'https://be.example/corrida/wp-json/wc/store/v1/products?per_page=1&page=1',
      checkType: 'catalog-products',
    })
    expect(check.ok).toBe(false)
    expect(check.error).toContain('missing required fields')
  })

  it('stringifies non-Error failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('boom'))
    const check = await runHttpCheck({
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api',
      niche: 'corrida',
      url: 'https://example.com',
    })
    expect(check.error).toBe('boom')
  })
})
