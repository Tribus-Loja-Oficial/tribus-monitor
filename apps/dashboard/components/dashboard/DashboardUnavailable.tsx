import { ModulesOverview } from '../ModulesOverview'
import { SectionCard } from '../ui/SectionCard'
import { MetricCard } from '../ui/MetricCard'

interface DashboardUnavailableProps {
  reason?: string
}

export function DashboardUnavailable({ reason }: DashboardUnavailableProps) {
  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-white shadow-lg">
        <h1 className="text-2xl font-bold md:text-3xl">Tribus Monitor Dashboard</h1>
        <p className="mt-1 text-sm text-cyan-50">
          Observabilidade operacional da plataforma Tribus.
        </p>
      </header>

      <section className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
        <p className="text-sm font-semibold">
          Nao foi possivel adquirir os dados da monitor API agora.
        </p>
        <p className="mt-1 text-xs">
          O dashboard abriu em modo seguro. Tente novamente em alguns segundos.
          {reason ? ` Motivo tecnico: ${reason}.` : ''}
        </p>
        <div className="mt-3 flex gap-2">
          <a
            href="/"
            className="rounded bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
          >
            Tentar novamente
          </a>
          <a
            href="/api/dashboard"
            className="rounded border border-amber-700 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            Ver endpoint de dados
          </a>
        </div>
      </section>

      <ModulesOverview />

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Servicos monitorados" value={0} />
        <MetricCard label="Incidentes abertos" value={0} />
        <MetricCard label="Eventos recentes" value={0} />
      </section>

      <SectionCard title="Diagnostico rapido" subtitle="Checklist para restabelecer o dashboard.">
        <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
          <li>Validar `MONITOR_API_URL` no projeto do dashboard (Vercel).</li>
          <li>Confirmar se a monitor API esta online e responde `GET /status`.</li>
          <li>Verificar logs de runtime do dashboard e da monitor API.</li>
        </ul>
      </SectionCard>
    </main>
  )
}
