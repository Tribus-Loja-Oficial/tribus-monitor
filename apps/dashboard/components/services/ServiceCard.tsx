import type { CheckResult, ServiceState } from '@tribus-monitor/core'
import { formatTimeAgo } from '../../lib/time'
import { getServiceDescription } from '../../lib/service-descriptions'
import { StatusBadge } from '../status/StatusBadge'
import { LatencyIndicator } from './LatencyIndicator'
import { SparklineBars } from '../charts/SparklineBars'

interface ServiceCardProps {
  service: ServiceState
  checks: CheckResult[]
}

function getCardStyle(status: ServiceState['status']) {
  if (status === 'down') return 'border-rose-200 bg-rose-50/70'
  if (status === 'degraded') return 'border-amber-200 bg-amber-50/70'
  return 'border-slate-200 bg-slate-50/70'
}

export function ServiceCard({ service, checks }: ServiceCardProps) {
  const recentChecks = [...checks]
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
    .slice(0, 5)
  const latencyValues = recentChecks.map((check) => check.latencyMs).reverse()

  return (
    <details className={`group rounded-lg border px-3 py-2 open:bg-white ${getCardStyle(service.status)}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-900">{service.serviceName}</p>
          <p className="text-[11px] text-slate-500">
            {service.serviceKey} · {service.niche} · ultimo check {formatTimeAgo(service.lastCheckAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LatencyIndicator latencyMs={service.lastLatencyMs} />
          <StatusBadge status={service.status} />
          <span className="text-[10px] text-slate-400 transition group-open:rotate-180">▼</span>
        </div>
      </summary>

      <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
        <p className="text-xs text-slate-700">
          <span className="font-medium text-slate-900">O que este check valida:</span>{' '}
          {getServiceDescription(service)}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-medium text-slate-700">Latencia (ultimos checks)</p>
            <SparklineBars values={latencyValues} />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-slate-700">Status recente (5)</p>
            <div className="flex flex-wrap gap-1.5">
              {recentChecks.map((check) => (
                <span
                  key={check.id}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    check.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {check.ok ? 'OK' : 'FAIL'} · {check.latencyMs}ms
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-1 text-[11px] text-slate-600 md:grid-cols-3">
          <p>
            <span className="font-medium text-slate-700">Falhas consecutivas:</span> {service.consecutiveFailures}
          </p>
          <p>
            <span className="font-medium text-slate-700">Ultimo erro:</span> {service.lastError ?? 'nenhum'}
          </p>
          <p>
            <span className="font-medium text-slate-700">Ultimo check:</span> {service.lastCheckAt}
          </p>
        </div>
      </div>
    </details>
  )
}
