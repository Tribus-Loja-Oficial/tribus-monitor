import type { CheckResult } from '@tribus-monitor/core'

interface RecentEventsTimelineProps {
  checks: CheckResult[]
}

export function RecentEventsTimeline({ checks }: RecentEventsTimelineProps) {
  const events = [...checks].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt)).slice(0, 12)

  if (events.length === 0) return <p className="text-xs text-slate-500">Sem eventos recentes.</p>

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-2 text-xs">
          <span className={`mt-1 h-2 w-2 rounded-full ${event.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <div>
            <p className="text-slate-800">
              <span className="font-medium">{event.serviceName}</span> · {event.ok ? 'OK' : 'FAIL'} ·{' '}
              {event.latencyMs}ms
            </p>
            <p className="text-[11px] text-slate-500">{event.checkedAt}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
