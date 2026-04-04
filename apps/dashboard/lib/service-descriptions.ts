import type { ServiceState } from '@tribus-monitor/core'

export function getServiceDescription(service: Pick<ServiceState, 'serviceKey' | 'serviceName'>): string {
  if (service.serviceKey.startsWith('storefront-page-')) {
    return 'Valida se a pagina publica do nicho responde com sucesso para usuarios finais.'
  }
  if (service.serviceKey.startsWith('storefront-health-woo-')) {
    return 'Valida conectividade do storefront com a API do WooCommerce para o nicho.'
  }
  if (service.serviceKey.startsWith('storefront-health-mp-')) {
    return 'Valida conectividade do storefront com a API do Mercado Pago para o nicho.'
  }
  if (service.serviceKey.startsWith('storefront-health-')) {
    return 'Valida o health geral do BFF/storefront.'
  }
  if (service.serviceKey.startsWith('ops-health-')) {
    return 'Valida o health do tribus-ops para o nicho, incluindo dependencias WP/WC.'
  }
  if (service.serviceKey.startsWith('be-catalog-products-')) {
    return 'Consulta o backend https://be.tribusloja.com.br e valida se o catalogo retorna produtos com campos essenciais.'
  }
  return `Check de observabilidade para ${service.serviceName}.`
}
