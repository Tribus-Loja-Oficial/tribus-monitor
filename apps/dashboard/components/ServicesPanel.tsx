import type { ServiceState } from '@tribus-monitor/core'
import { getServiceDescription } from '../lib/service-descriptions'
import { StatusBadge } from './StatusBadge'

interface ServicesPanelProps {
  services: ServiceState[]
}

export function ServicesPanel({ services }: ServicesPanelProps) {
  if (services.length === 0) {
    return <p className="text-xs text-slate-500">Sem dados ainda.</p>
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <details
          key={service.serviceKey}
          className="group rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 open:bg-white"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{service.serviceName}</p>
              <p className="text-[11px] text-slate-500">
                {service.serviceKey} · {service.niche}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 transition group-open:rotate-180">▼</span>
              <StatusBadge status={service.status} />
            </div>
          </summary>

          <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
            <p className="text-xs text-slate-700">
              <span className="font-medium text-slate-900">O que este check valida:</span>{' '}
              {getServiceDescription(service)}
            </p>
            <div className="grid gap-1 text-[11px] text-slate-500 md:grid-cols-3">
              <p>
                <span className="font-medium text-slate-700">Falhas consecutivas:</span>{' '}
                {service.consecutiveFailures}
              </p>
              <p>
                <span className="font-medium text-slate-700">Ultimo check:</span>{' '}
                {service.lastCheckAt}
              </p>
              <p>
                <span className="font-medium text-slate-700">Ultimo erro:</span>{' '}
                {service.lastError ?? 'nenhum'}
              </p>
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}
