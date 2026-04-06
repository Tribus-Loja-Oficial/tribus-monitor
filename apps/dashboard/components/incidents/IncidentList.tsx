import type { Incident } from '@tribus-monitor/core'

interface IncidentListProps {
  incidents: Incident[]
}

function formatIncidentDuration(incident: Incident): string {
  const start = Date.parse(incident.startedAt)
  const end = incident.resolvedAt ? Date.parse(incident.resolvedAt) : Date.now()
  const minutes = Math.max(0, Math.floor((end - start) / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return `${hours}h ${rem}min`
}

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm font-semibold text-emerald-900">
          ✅ Nenhum incidente ativo no momento
        </p>
        <p className="mt-1 text-xs text-emerald-700">
          A plataforma segue operando dentro do esperado para os servicos monitorados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {incidents.map((incident) => (
        <article
          key={incident.id}
          className={`rounded-lg border p-3 ${incident.resolvedAt ? 'border-slate-200 bg-slate-50/70' : 'border-rose-200 bg-rose-50/70'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{incident.serviceName}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                incident.resolvedAt ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {incident.resolvedAt ? 'RESOLVIDO' : 'ATIVO'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            Inicio: {incident.startedAt} · Duracao: {formatIncidentDuration(incident)}
          </p>
          <p className="text-[11px] text-slate-600">
            Motivo: {incident.openReason ?? 'nao informado'}
          </p>
        </article>
      ))}
    </div>
  )
}
