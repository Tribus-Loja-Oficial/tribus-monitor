import type { CoverageSnapshot } from '../../lib/coverage'
import { formatTimeAgo } from '../../lib/time'
import { SectionCard } from '../ui/SectionCard'

interface CoveragePanelProps {
  coverage: CoverageSnapshot
}

function fmt(value: number | null) {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

function barWidth(value: number | null) {
  if (value === null) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function barTone(value: number | null) {
  if (value === null) return 'bg-slate-300'
  if (value >= 90) return 'bg-emerald-500'
  if (value >= 80) return 'bg-lime-500'
  if (value >= 70) return 'bg-amber-500'
  if (value >= 50) return 'bg-orange-500'
  return 'bg-rose-500'
}

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  return (
    <SectionCard
      title="Cobertura de testes"
      subtitle="Linhas, funções, branches e statements dos repositórios monitorados."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {coverage.repos.map((repo) => (
          <article key={repo.key} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{repo.name}</h4>
              {repo.sourceUrl ? (
                <a
                  href={repo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  fonte
                </a>
              ) : null}
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <dt className="text-slate-600">Lines</dt>
                  <dd className="font-semibold text-slate-900">{fmt(repo.lines)}</dd>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barTone(repo.lines)}`}
                    style={{ width: `${barWidth(repo.lines)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <dt className="text-slate-600">Functions</dt>
                  <dd className="font-semibold text-slate-900">{fmt(repo.functions)}</dd>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barTone(repo.functions)}`}
                    style={{ width: `${barWidth(repo.functions)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <dt className="text-slate-600">Branches</dt>
                  <dd className="font-semibold text-slate-900">{fmt(repo.branches)}</dd>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barTone(repo.branches)}`}
                    style={{ width: `${barWidth(repo.branches)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <dt className="text-slate-600">Statements</dt>
                  <dd className="font-semibold text-slate-900">{fmt(repo.statements)}</dd>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barTone(repo.statements)}`}
                    style={{ width: `${barWidth(repo.statements)}%` }}
                  />
                </div>
              </div>
            </dl>

            <p className="mt-3 text-xs text-slate-500">
              Atualizado:{' '}
              {repo.updatedAt ? (
                <>
                  {new Date(repo.updatedAt).toLocaleString('pt-BR')}
                  {' · '}
                  <span className="whitespace-nowrap">{formatTimeAgo(repo.updatedAt)}</span>
                </>
              ) : (
                'N/A'
              )}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Dados publicados automaticamente pelos pipelines de CI dos repositórios Tribus.
      </p>
    </SectionCard>
  )
}
