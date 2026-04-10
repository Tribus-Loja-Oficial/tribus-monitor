import type { E2ERun, E2EScenarioResult } from '@tribus-monitor/core'
import type { E2EData } from '../../lib/monitor-api'
import { formatTimeAgo } from '../../lib/time'
import { SectionCard } from '../ui/SectionCard'

function passRateTone(rate: number) {
  if (rate >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (rate >= 80) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-rose-700 bg-rose-50 border-rose-200'
}

function statusBadge(status: E2EScenarioResult['status']) {
  const map: Record<string, string> = {
    passed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
    timedout: 'bg-orange-100 text-orange-700',
    skipped: 'bg-slate-100 text-slate-500',
  }
  const labels: Record<string, string> = {
    passed: 'ok',
    failed: 'falhou',
    timedout: 'timeout',
    skipped: 'pulado',
  }
  return { cls: map[status] ?? 'bg-slate-100 text-slate-500', label: labels[status] ?? status }
}

function barWidth(rate: number) {
  return Math.max(0, Math.min(100, Math.round(rate)))
}

function barTone(rate: number) {
  if (rate >= 95) return 'bg-emerald-500'
  if (rate >= 80) return 'bg-amber-400'
  return 'bg-rose-500'
}

interface RunSummaryCardProps {
  run: E2ERun
  isLatest: boolean
}

function RunSummaryCard({ run, isLatest }: RunSummaryCardProps) {
  const tone = passRateTone(run.passRate)
  return (
    <article
      className={`rounded-xl border p-4 ${isLatest ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {isLatest && (
              <span className="mr-1.5 inline-block rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                último
              </span>
            )}
            {run.runner} · {run.environment}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {new Date(run.emittedAt).toLocaleString('pt-BR')}
            {' · '}
            <span className="whitespace-nowrap">{formatTimeAgo(run.emittedAt)}</span>
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>
          {run.passRate.toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barTone(run.passRate)}`}
          style={{ width: `${barWidth(run.passRate)}%` }}
        />
      </div>

      <dl className="mt-3 flex gap-4 text-xs">
        <div className="flex flex-col items-center">
          <dt className="text-slate-400">total</dt>
          <dd className="font-semibold text-slate-900">{run.total}</dd>
        </div>
        <div className="flex flex-col items-center">
          <dt className="text-emerald-600">passou</dt>
          <dd className="font-semibold text-emerald-700">{run.passed}</dd>
        </div>
        <div className="flex flex-col items-center">
          <dt className="text-rose-500">falhou</dt>
          <dd className="font-semibold text-rose-700">{run.failed}</dd>
        </div>
        {run.skipped > 0 && (
          <div className="flex flex-col items-center">
            <dt className="text-slate-400">pulado</dt>
            <dd className="font-semibold text-slate-500">{run.skipped}</dd>
          </div>
        )}
      </dl>
    </article>
  )
}

interface E2EPanelProps {
  e2e: E2EData
}

export function E2EPanel({ e2e }: E2EPanelProps) {
  const { runs, latestResults } = e2e

  if (runs.length === 0) {
    return (
      <SectionCard
        title="E2E — Testes funcionais"
        subtitle="Resultados dos testes end-to-end publicados pelo pipeline do tribus-e2e."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Nenhuma execução registrada ainda</p>
          <p className="mt-1">
            Os resultados aparecem automaticamente após o próximo run do GitHub Actions.
          </p>
        </div>
      </SectionCard>
    )
  }

  const latest = runs[0]!

  // Group latest results by suite
  const bySuite = latestResults.reduce<Record<string, E2EScenarioResult[]>>((acc, r) => {
    ;(acc[r.suiteId] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Histórico de runs */}
      <SectionCard
        title="E2E — Testes funcionais"
        subtitle={`Último run: ${formatTimeAgo(latest.emittedAt)} — ${latest.passed}/${latest.total} passaram (${latest.passRate.toFixed(1)}%)`}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {runs.map((run, i) => (
            <RunSummaryCard key={run.id} run={run} isLatest={i === 0} />
          ))}
        </div>
      </SectionCard>

      {/* Cenários do último run */}
      {latestResults.length > 0 && (
        <SectionCard
          title="Cenários — último run"
          subtitle={`${new Date(latest.emittedAt).toLocaleString('pt-BR')} · ${latest.runner}`}
        >
          <div className="space-y-2">
            {Object.entries(bySuite).map(([suiteId, scenarios]) => (
              <div key={suiteId}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {suiteId}
                </p>
                <div className="space-y-1">
                  {scenarios.map((s) => {
                    const { cls, label } = statusBadge(s.status)
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                      >
                        <span className="min-w-0 truncate font-medium text-slate-800">
                          {s.scenarioName}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-slate-400">
                            {(s.durationMs / 1000).toFixed(1)}s
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}
                          >
                            {label}
                          </span>
                          {s.criticality && (
                            <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                              {s.criticality}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
