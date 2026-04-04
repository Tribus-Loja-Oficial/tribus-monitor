import type { GlobalPlatformStatus } from '../../lib/status'

interface GlobalStatusBannerProps {
  status: GlobalPlatformStatus
}

export function GlobalStatusBanner({ status }: GlobalStatusBannerProps) {
  if (status === 'incident_active') {
    return (
      <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800">
        🔴 INCIDENT ACTIVE
      </div>
    )
  }
  if (status === 'degraded') {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
        🟡 DEGRADED
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
      🟢 ALL SYSTEMS OPERATIONAL
    </div>
  )
}
