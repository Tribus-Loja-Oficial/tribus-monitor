import type { CheckResult } from '@tribus-monitor/core'
import type { ServiceGroup } from '../../lib/service-groups'
import { SectionCard } from '../ui/SectionCard'
import { ServiceCard } from './ServiceCard'

interface ServiceGroupSectionProps {
  group: ServiceGroup
  checksByService: Record<string, CheckResult[]>
}

export function ServiceGroupSection({ group, checksByService }: ServiceGroupSectionProps) {
  const healthyCount = group.services.filter((service) => service.status === 'healthy').length
  const accents: Record<ServiceGroup['key'], string> = {
    storefront: 'border-l-4 border-l-blue-400',
    ops: 'border-l-4 border-l-violet-400',
    be: 'border-l-4 border-l-slate-400',
    other: 'border-l-4 border-l-slate-300',
  }

  return (
    <div className={`rounded-2xl ${accents[group.key]}`}>
      <SectionCard
        title={`${group.icon} ${group.title} (${healthyCount}/${group.services.length} saudaveis)`}
        subtitle={group.description}
      >
        <div className="space-y-3">
          {group.services.map((service) => (
            <ServiceCard
              key={service.serviceKey}
              service={service}
              checks={checksByService[service.serviceKey] ?? []}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
