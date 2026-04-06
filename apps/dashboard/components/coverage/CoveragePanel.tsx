import type { CoverageSnapshot } from '../../lib/coverage'
import { SectionCard } from '../ui/SectionCard'

interface CoveragePanelProps {
  coverage: CoverageSnapshot
}

function fmt(value: number | null) {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  return (
    <SectionCard
      title="Cobertura de testes"
      subtitle="Linhas, funcoes, branches e statements dos repositorios monitorados."
    >
      <div className="grid gap-3 md:grid-cols-3">
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

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Lines</dt>
                <dd className="font-semibold text-slate-900">{fmt(repo.lines)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Functions</dt>
                <dd className="font-semibold text-slate-900">{fmt(repo.functions)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Branches</dt>
                <dd className="font-semibold text-slate-900">{fmt(repo.branches)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Statements</dt>
                <dd className="font-semibold text-slate-900">{fmt(repo.statements)}</dd>
              </div>
            </dl>

            <p className="mt-3 text-xs text-slate-500">
              Atualizado:{' '}
              {repo.updatedAt ? new Date(repo.updatedAt).toLocaleString('pt-BR') : 'N/A'}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Dados publicados automaticamente pelos pipelines de CI dos repositorios Tribus.
      </p>
    </SectionCard>
  )
}
