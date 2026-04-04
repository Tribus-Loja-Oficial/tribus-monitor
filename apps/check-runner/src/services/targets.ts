import type { CheckTarget } from './http-check'

export function buildTargets(input: {
  storefrontBaseUrl: string
  opsBaseUrl: string
  beBaseUrl: string
  niches: string[]
}): CheckTarget[] {
  const targets: CheckTarget[] = []
  for (const niche of input.niches) {
    targets.push(
      {
        serviceKey: `storefront-page-${niche}`,
        serviceName: `Storefront page (${niche})`,
        kind: 'storefront-page',
        niche,
        url: `${input.storefrontBaseUrl}/${niche}`,
      },
      {
        serviceKey: `storefront-health-${niche}`,
        serviceName: `Storefront API health (${niche})`,
        kind: 'storefront-api',
        niche,
        url: `${input.storefrontBaseUrl}/api/health`,
      },
      {
        serviceKey: `storefront-health-woo-${niche}`,
        serviceName: `Storefront health woo (${niche})`,
        kind: 'storefront-api',
        niche,
        url: `${input.storefrontBaseUrl}/api/health/woo?niche=${encodeURIComponent(niche)}`,
      },
      {
        serviceKey: `storefront-health-mp-${niche}`,
        serviceName: `Storefront health mp (${niche})`,
        kind: 'storefront-api',
        niche,
        url: `${input.storefrontBaseUrl}/api/health/mp?niche=${encodeURIComponent(niche)}`,
      },
      {
        serviceKey: `ops-health-${niche}`,
        serviceName: `Ops health (${niche})`,
        kind: 'ops-api',
        niche,
        url: `${input.opsBaseUrl}/health/${encodeURIComponent(niche)}`,
      },
      {
        serviceKey: `be-catalog-products-${niche}`,
        serviceName: `BE catalog products (${niche})`,
        kind: 'be-api',
        niche,
        url: `${input.beBaseUrl}/${niche}/wp-json/wc/store/v1/products?per_page=1&page=1`,
        checkType: 'catalog-products',
      }
    )
  }
  return targets
}
