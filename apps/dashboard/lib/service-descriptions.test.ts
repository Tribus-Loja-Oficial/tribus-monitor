import { describe, expect, it } from 'vitest'
import { getServiceDescription } from './service-descriptions'

describe('getServiceDescription', () => {
  it('describes storefront woo health check', () => {
    const description = getServiceDescription({
      serviceKey: 'storefront-health-woo-corrida',
      serviceName: 'Storefront health woo (corrida)',
    })
    expect(description).toContain('WooCommerce')
  })

  it('describes ops health check', () => {
    const description = getServiceDescription({
      serviceKey: 'ops-health-corrida',
      serviceName: 'Ops health (corrida)',
    })
    expect(description).toContain('tribus-ops')
  })

  it('describes be catalog check', () => {
    const description = getServiceDescription({
      serviceKey: 'be-catalog-products-corrida',
      serviceName: 'BE catalog products (corrida)',
    })
    expect(description).toContain('catalogo')
  })

  it('describes storefront page checks', () => {
    const d = getServiceDescription({
      serviceKey: 'storefront-page-corrida',
      serviceName: 'Page',
    })
    expect(d).toContain('pagina publica')
  })

  it('describes Mercado Pago health', () => {
    const d = getServiceDescription({
      serviceKey: 'storefront-health-mp-corrida',
      serviceName: 'MP',
    })
    expect(d).toContain('Mercado Pago')
  })

  it('describes generic storefront health', () => {
    const d = getServiceDescription({
      serviceKey: 'storefront-health-corrida',
      serviceName: 'Health',
    })
    expect(d).toContain('BFF')
  })

  it('falls back to generic description', () => {
    const d = getServiceDescription({ serviceKey: 'unknown', serviceName: 'U' })
    expect(d).toContain('U')
  })
})
