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

function latencyTone(latencyMs: number) {
  if (latencyMs > 1500) return 'bg-rose-500'
  if (latencyMs >= 500) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function latencyTrack(latencyMs: number) {
  if (latencyMs > 1500) return 'bg-rose-100'
  if (latencyMs >= 500) return 'bg-amber-100'
  return 'bg-emerald-100'
}

function latencyWidth(latencyMs: number) {
  const capped = Math.min(2000, Math.max(0, latencyMs))
  return Math.max(8, Math.round((capped / 2000) * 100))
}

export function ServiceCard({ service, checks }: ServiceCardProps) {
  const recentChecks = [...checks]
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
    .slice(0, 5)
  const latencyValues = recentChecks.map((check) => check.latencyMs).reverse()
  const width = latencyWidth(service.lastLatencyMs)

  return (
    <details
      className={`group rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm open:bg-white ${getCardStyle(service.status)}`}
    >
      <summary className="grid cursor-pointer list-none items-center gap-3 md:grid-cols-[1.7fr_0.7fr_0.6fr]">
        <div>
          <p className="text-sm font-semibold text-slate-900">{service.serviceName}</p>
          <p className="text-[11px] text-slate-500">
            {service.serviceKey} · {service.niche} · ultimo check{' '}
            {formatTimeAgo(service.lastCheckAt)}
          </p>
          <div
            className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${latencyTrack(service.lastLatencyMs)}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${latencyTone(service.lastLatencyMs)}`}
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <LatencyIndicator latencyMs={service.lastLatencyMs} />
          <p className="mt-1 text-[11px] text-slate-500">latencia atual</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <StatusBadge status={service.status} />
          <span className="text-[10px] text-slate-400 transition group-open:rotate-180">▼</span>
        </div>
      </summary>

      <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-700">{getServiceDescription(service)}</p>
        <div className="grid gap-2 text-[11px] text-slate-600 md:grid-cols-3">
          <p>
            <span className="font-medium text-slate-700">Falhas consecutivas:</span>{' '}
            {service.consecutiveFailures}
          </p>
          <p>
            <span className="font-medium text-slate-700">Ultimo erro:</span>{' '}
            {service.lastError ?? 'nenhum'}
          </p>
          <p>
            <span className="font-medium text-slate-700">Ultimo check:</span> {service.lastCheckAt}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-medium text-slate-700">Latencia (ultimos checks)</p>
            <SparklineBars values={latencyValues} />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-slate-700">Status recente (5)</p>
            <div className="flex items-center gap-2">
              {recentChecks.map((check) => (
                <div key={check.id} className="flex flex-col items-center gap-1">
                  <span
                    className={`h-3 w-3 rounded-full ${check.ok ? 'bg-emerald-500' : 'bg-rose-500'} ${
                      !check.ok && check.latencyMs >= 500 ? 'ring-2 ring-amber-300' : ''
                    }`}
                    title={`${check.ok ? 'OK' : 'FAIL'} • ${check.latencyMs}ms`}
                  />
                  <span className="text-[10px] text-slate-500">{check.ok ? 'OK' : 'FAIL'}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
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
      </div>
    </details>
  )
}
