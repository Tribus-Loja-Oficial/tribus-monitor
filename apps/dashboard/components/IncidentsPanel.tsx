import type { Incident } from '@tribus-monitor/core'

interface IncidentsPanelProps {
  incidents: Incident[]
}

export function IncidentsPanel({ incidents }: IncidentsPanelProps) {
  if (incidents.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum incidente.</p>
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <article
          key={incident.id}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <p className="font-medium text-slate-900">{incident.serviceName}</p>
          <p className="mt-1 text-xs text-slate-500">
            {incident.startedAt} ·{' '}
            {incident.resolvedAt ? `resolvido em ${incident.resolvedAt}` : 'aberto'}
          </p>
        </article>
      ))}
    </div>
  )
}
