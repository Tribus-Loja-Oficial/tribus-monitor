import type { CheckResult } from '@tribus-monitor/core'
import { formatTimeAgo } from '../../lib/time'

interface RecentEventsTimelineProps {
  checks: CheckResult[]
}

export function RecentEventsTimeline({ checks }: RecentEventsTimelineProps) {
  const events = [...checks].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt)).slice(0, 12)

  if (events.length === 0) return <p className="text-xs text-slate-500">Sem eventos recentes.</p>

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex gap-3 text-xs">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${event.ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span className="h-full w-px bg-slate-200" />
          </div>
          <div className="flex-1 pb-1">
            <p className="text-slate-800">
              <span className="font-medium">{event.serviceName}</span> · {event.ok ? 'OK' : 'FAIL'}{' '}
              · {event.latencyMs}
              ms
            </p>
            <p className="text-[11px] text-slate-500">
              {formatTimeAgo(event.checkedAt)} · {event.checkedAt}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
