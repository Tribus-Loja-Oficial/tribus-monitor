import type { GlobalPlatformStatus } from '../../lib/status'

interface GlobalStatusBannerProps {
  status: GlobalPlatformStatus
  lastUpdatedLabel: string
}

export function GlobalStatusBanner({ status, lastUpdatedLabel }: GlobalStatusBannerProps) {
  if (status === 'incident_active') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-5 py-4 text-rose-900">
        <div className="flex items-center gap-2">
          <span aria-hidden>🔴</span>
          <p className="text-sm font-semibold">Incidente ativo</p>
        </div>
        <p className="mt-1 text-xs text-rose-700">Ultima atualizacao: {lastUpdatedLabel}</p>
      </div>
    )
  }
  if (status === 'degraded') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-amber-900">
        <div className="flex items-center gap-2">
          <span aria-hidden>🟡</span>
          <p className="text-sm font-semibold">Sistema degradado</p>
        </div>
        <p className="mt-1 text-xs text-amber-700">Ultima atualizacao: {lastUpdatedLabel}</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-emerald-900">
      <div className="flex items-center gap-2">
        <span aria-hidden>🟢</span>
        <p className="text-sm font-semibold">Todos os sistemas operacionais</p>
      </div>
      <p className="mt-1 text-xs text-emerald-700">Ultima atualizacao: {lastUpdatedLabel}</p>
    </div>
  )
}
