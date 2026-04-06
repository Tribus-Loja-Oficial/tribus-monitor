import type { ServiceState } from '@tribus-monitor/core'
import { getServiceStatusPriority } from './status'

export interface ServiceGroup {
  key: 'storefront' | 'ops' | 'be' | 'other'
  title: string
  description: string
  icon: string
  services: ServiceState[]
}

function getDomainGroup(service: ServiceState): ServiceGroup['key'] {
  if (service.serviceKey.startsWith('ops-')) return 'ops'
  if (service.serviceKey.startsWith('be-')) return 'be'
  if (service.serviceKey.startsWith('storefront-')) return 'storefront'
  return 'other'
}

export function groupServicesByDomain(services: ServiceState[]): ServiceGroup[] {
  const grouped: Record<ServiceGroup['key'], ServiceState[]> = {
    storefront: [],
    ops: [],
    be: [],
    other: [],
  }

  for (const service of services) {
    grouped[getDomainGroup(service)].push(service)
  }

  const groups: ServiceGroup[] = [
    {
      key: 'storefront',
      title: 'Componente Storefront',
      description: 'Checks de pagina publica e APIs do storefront/BFF.',
      icon: '🌐',
      services: grouped.storefront,
    },
    {
      key: 'ops',
      title: 'Componente Tribus Ops',
      description: 'Checks da API operacional do tribus-ops por nicho.',
      icon: '⚙️',
      services: grouped.ops,
    },
    {
      key: 'be',
      title: 'Componente BE (WordPress/Woo)',
      description:
        'Checks diretos do backend https://be.tribusloja.com.br e integridade do catalogo.',
      icon: '🗄️',
      services: grouped.be,
    },
    {
      key: 'other',
      title: 'Outros componentes',
      description: 'Checks que nao se encaixam nos grupos principais.',
      icon: '🧩',
      services: grouped.other,
    },
  ]

  return groups
    .map((group) => ({
      ...group,
      services: [...group.services].sort((a, b) => {
        const p = getServiceStatusPriority(a.status) - getServiceStatusPriority(b.status)
        if (p !== 0) return p
        return a.serviceKey.localeCompare(b.serviceKey)
      }),
    }))
    .filter((group) => group.services.length > 0)
}
