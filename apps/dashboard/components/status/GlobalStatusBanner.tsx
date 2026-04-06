import type { GlobalPlatformStatus } from '../../lib/status'

interface GlobalStatusBannerProps {
  status: GlobalPlatformStatus
  lastUpdatedLabel: string
  variant?: 'default' | 'compact'
}

export function GlobalStatusBanner({
  status,
  lastUpdatedLabel,
  variant = 'default',
}: GlobalStatusBannerProps) {
  const isCompact = variant === 'compact'
  const containerBase = isCompact ? 'rounded-2xl px-4 py-3' : 'rounded-2xl px-5 py-4'
  const titleClass = isCompact ? 'text-xs font-semibold' : 'text-sm font-semibold'
  const subtitleClass = isCompact ? 'mt-1 text-[11px]' : 'mt-1 text-xs'

  if (status === 'incident_active') {
    return (
      <div className={`${containerBase} border border-rose-200 bg-rose-50/70 text-rose-900`}>
        <div className="flex items-center gap-2">
          <span aria-hidden>🔴</span>
          <p className={titleClass}>Incidente ativo</p>
        </div>
        <p className={`${subtitleClass} text-rose-700`}>Ultima atualizacao: {lastUpdatedLabel}</p>
      </div>
    )
  }
  if (status === 'degraded') {
    return (
      <div className={`${containerBase} border border-amber-200 bg-amber-50/70 text-amber-900`}>
        <div className="flex items-center gap-2">
          <span aria-hidden>🟡</span>
          <p className={titleClass}>Sistema degradado</p>
        </div>
        <p className={`${subtitleClass} text-amber-700`}>Ultima atualizacao: {lastUpdatedLabel}</p>
      </div>
    )
  }
  return (
    <div className={`${containerBase} border border-emerald-200 bg-emerald-50/60 text-emerald-900`}>
      <div className="flex items-center gap-2">
        <span aria-hidden>🟢</span>
        <p className={titleClass}>Todos os sistemas operacionais</p>
      </div>
      <p className={`${subtitleClass} text-emerald-700`}>Ultima atualizacao: {lastUpdatedLabel}</p>
    </div>
  )
}
