import type { GlobalPlatformStatus } from '../../lib/status'

interface GlobalStatusBannerProps {
  status: GlobalPlatformStatus
  lastUpdatedLabel: string
}

export function GlobalStatusBanner({ status, lastUpdatedLabel }: GlobalStatusBannerProps) {
  if (status === 'incident_active') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 shadow-sm">
        <p className="text-lg font-bold">🔴 Incidente ativo</p>
        <p className="mt-1 text-xs font-medium text-rose-700">
          Ultima atualizacao: {lastUpdatedLabel}
        </p>
      </div>
    )
  }
  if (status === 'degraded') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 shadow-sm">
        <p className="text-lg font-bold">🟡 Sistema degradado</p>
        <p className="mt-1 text-xs font-medium text-amber-700">
          Ultima atualizacao: {lastUpdatedLabel}
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm">
      <p className="text-lg font-bold">🟢 Todos os sistemas operacionais</p>
      <p className="mt-1 text-xs font-medium text-emerald-700">
        Ultima atualizacao: {lastUpdatedLabel}
      </p>
    </div>
  )
}
