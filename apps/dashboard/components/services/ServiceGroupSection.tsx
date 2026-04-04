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

  return (
    <SectionCard
      title={`${group.icon} ${group.title} (${healthyCount}/${group.services.length} healthy)`}
      subtitle={group.description}
    >
      <div className="space-y-2">
        {group.services.map((service) => (
          <ServiceCard key={service.serviceKey} service={service} checks={checksByService[service.serviceKey] ?? []} />
        ))}
      </div>
    </SectionCard>
  )
}
