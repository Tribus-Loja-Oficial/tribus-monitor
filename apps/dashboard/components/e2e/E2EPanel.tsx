'use client'

import { useState } from 'react'
import type { E2ERun, E2EScenarioResult } from '@tribus-monitor/core'
import type { E2EData } from '../../lib/monitor-api'
import { formatTimeAgo } from '../../lib/time'
import { SectionCard } from '../ui/SectionCard'

// ─── Static scenario descriptions ────────────────────────────────────────────

const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  J01: 'Valida se o portal de nichos carrega corretamente e exibe os nichos disponíveis.',
  J02: 'Valida se a home page do nicho renderiza sem erros e exibe o conteúdo principal.',
  J03: 'Valida se a página de loja lista os produtos sem erros de carregamento.',
  J04: 'Valida se a página de detalhe do produto (PDP) abre e exibe as informações corretamente.',
  J05: 'Valida se um usuário com credenciais válidas consegue autenticar e acessar a área protegida.',
  J06: 'Valida se credenciais inválidas exibem mensagem de erro e bloqueiam o acesso.',
  J07: 'Valida se a rota /conta redireciona para login quando o usuário não está autenticado.',
  J08: 'Valida se os health endpoints da API respondem com status 200.',
  R01: 'Valida se um produto simples pode ser adicionado ao carrinho com sucesso.',
  R02: 'Valida se um produto com variação (tamanho/cor) pode ser selecionado e adicionado ao carrinho.',
  R03: 'Valida se cupons válidos aplicam desconto e cupons inválidos exibem mensagem de erro adequada.',
  R04: 'Valida se o fluxo completo de checkout funciona desde o carrinho até a criação do pedido.',
  R05: 'Valida se o cadastro impede a submissão sem aceitar os termos de uso.',
  R06: 'Valida se a área de conta exibe informações do usuário e permite gerenciar endereços.',
  R07: 'Valida se um CEP inválido exibe mensagem de erro no formulário de entrega.',
  E01: 'Valida se a página de recuperação de senha carrega e exibe o formulário corretamente.',
  E02: 'Valida se os botões de login social estão visíveis e acessíveis na página de login.',
  E03: 'Valida se o banner de newsletter é exibido na home page do nicho.',
  E04: 'Valida se o formulário de contato carrega e realiza validação básica dos campos obrigatórios.',
  N01: 'Valida se credenciais inválidas resultam em mensagem de erro clara na tela de login.',
  N02: 'Valida se um nicho inexistente retorna uma resposta de erro adequada (404).',
  N04: 'Valida se uma falha na API resulta em mensagem de erro amigável na interface.',
}

const SUITE_LABELS: Record<string, string> = {
  'storefront-smoke': 'Smoke',
  'storefront-regression': 'Regression',
  'storefront-extended': 'Extended',
  'storefront-negative': 'Negative',
  'storefront-unknown': 'Outros',
}

const SUITE_ORDER = [
  'storefront-smoke',
  'storefront-regression',
  'storefront-extended',
  'storefront-negative',
  'storefront-unknown',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSuiteLabel(suiteId: string): string {
  return SUITE_LABELS[suiteId] ?? suiteId
}

function extractTestId(scenarioId: string): string {
  const match = /^([A-Z]\d+)/i.exec(scenarioId)
  return match ? match[1]!.toUpperCase() : scenarioId.slice(0, 4).toUpperCase()
}

function getDescription(scenarioId: string): string | undefined {
  return SCENARIO_DESCRIPTIONS[extractTestId(scenarioId)]
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTotalDuration(results: E2EScenarioResult[]): string {
  const total = results.reduce((sum, r) => sum + r.durationMs, 0)
  const secs = Math.round(total / 1000)
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function getRunSuiteLabels(results: E2EScenarioResult[]): string[] {
  const seen = new Set<string>()
  return results
    .map((r) => r.suiteId)
    .filter((id) => (seen.has(id) ? false : seen.add(id)))
    .sort((a, b) => SUITE_ORDER.indexOf(a) - SUITE_ORDER.indexOf(b))
    .map(getSuiteLabel)
}

function generateSummary(run: E2ERun, suiteLabels: string[]): string {
  const type = suiteLabels.length === 1 ? suiteLabels[0]!.toLowerCase() : 'mixed'
  if (run.failed === 0) {
    return `Run ${type} em ${run.runner} — todos os ${run.total} cenários passaram com sucesso.`
  }
  return `Run ${type} em ${run.runner} — ${run.passed} de ${run.total} cenários passaram; ${run.failed} falharam.`
}

// ─── Visual tokens ────────────────────────────────────────────────────────────

type StatusKey = E2EScenarioResult['status']

const STATUS_CFG: Record<StatusKey, { dot: string; badge: string; label: string }> = {
  passed: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'passou' },
  failed: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', label: 'falhou' },
  timed_out: {
    dot: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    label: 'timeout',
  },
  skipped: { dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500', label: 'pulado' },
}

const CRITICALITY_CFG: Record<string, string> = {
  P0: 'border-rose-300 bg-rose-50 text-rose-600',
  P1: 'border-amber-300 bg-amber-50 text-amber-600',
  P2: 'border-slate-200 bg-slate-50 text-slate-500',
  P3: 'border-slate-200 bg-slate-50 text-slate-400',
}

const FAILURE_TYPE_LABELS: Record<string, string> = {
  functional: 'falha funcional',
  environment: 'problema de ambiente',
  test_infra: 'infra de teste',
}

function passRateColor(rate: number): string {
  if (rate >= 95) return 'text-emerald-700'
  if (rate >= 80) return 'text-amber-600'
  return 'text-rose-600'
}

function passRateBarColor(rate: number): string {
  if (rate >= 95) return 'bg-emerald-500'
  if (rate >= 80) return 'bg-amber-400'
  return 'bg-rose-500'
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: StatusKey }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.skipped
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
}

function StatusBadge({ status }: { status: StatusKey }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.skipped
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
      {cfg.label}
    </span>
  )
}

function CriticalityBadge({ criticality }: { criticality: string }) {
  const cls = CRITICALITY_CFG[criticality] ?? CRITICALITY_CFG['P2']!
  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${cls}`}>
      {criticality}
    </span>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function PassRateBar({ rate, thin = false }: { rate: number; thin?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-full bg-slate-100 ${thin ? 'h-1' : 'h-1.5'}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${passRateBarColor(rate)}`}
        style={{ width: `${Math.max(0, Math.min(100, rate))}%` }}
      />
    </div>
  )
}

// ─── ScenarioItem ─────────────────────────────────────────────────────────────

function ScenarioItem({ scenario }: { scenario: E2EScenarioResult }) {
  const isFailed = scenario.status === 'failed' || scenario.status === 'timed_out'
  const [open, setOpen] = useState(isFailed)

  const testId = extractTestId(scenario.scenarioId)
  const description = getDescription(scenario.scenarioId)
  const hasDetails = !!description || isFailed

  const containerCls = isFailed
    ? 'border-rose-200 bg-rose-50/40'
    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/40'

  return (
    <div className={`overflow-hidden rounded-lg border transition-colors ${containerCls}`}>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <StatusDot status={scenario.status} />

        {/* Test ID */}
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
          {testId}
        </span>

        {/* Name */}
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-800">
          {scenario.scenarioName}
        </span>

        {/* Right meta */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[11px] text-slate-400">{formatDuration(scenario.durationMs)}</span>
          <CriticalityBadge criticality={scenario.criticality} />
          <StatusBadge status={scenario.status} />
          {hasDetails && <ChevronIcon open={open} />}
        </div>
      </button>

      {open && hasDetails && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2.5 space-y-2.5">
          {/* Description */}
          {description && (
            <p className="text-xs leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-600">O que valida: </span>
              {description}
            </p>
          )}

          {/* Failure type */}
          {isFailed && scenario.failureType && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Classificação:</span>
              <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-600">
                {FAILURE_TYPE_LABELS[scenario.failureType] ?? scenario.failureType}
              </span>
            </div>
          )}

          {/* Error message */}
          {isFailed && scenario.errorMessage && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                Mensagem de erro
              </p>
              <p className="break-all font-mono text-[11px] leading-relaxed text-rose-700">
                {scenario.errorMessage}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex gap-4 text-[11px] text-slate-400">
            <span>Início: {new Date(scenario.startedAt).toLocaleTimeString('pt-BR')}</span>
            <span>Duração: {formatDuration(scenario.durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SuiteGroup ───────────────────────────────────────────────────────────────

function SuiteGroup({ suiteId, scenarios }: { suiteId: string; scenarios: E2EScenarioResult[] }) {
  const passed = scenarios.filter((s) => s.status === 'passed').length
  const failed = scenarios.filter((s) => s.status === 'failed' || s.status === 'timed_out').length
  const total = scenarios.length
  const rate = total > 0 ? (passed / total) * 100 : 0
  const allPassed = failed === 0

  // Start collapsed only if fully passed and no failures anywhere
  const [collapsed, setCollapsed] = useState(allPassed)

  const label = getSuiteLabel(suiteId)
  const headerBg = allPassed ? 'hover:bg-emerald-50/60' : 'hover:bg-rose-50/40'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${headerBg}`}
      >
        {/* Suite name */}
        <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </span>

        {/* Mini dot grid */}
        <div className="flex items-center gap-0.5">
          {scenarios.map((s) => (
            <span
              key={s.id}
              className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_CFG[s.status]?.dot ?? 'bg-slate-300'}`}
              title={s.scenarioName}
            />
          ))}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-emerald-600">{passed} ok</span>
          {failed > 0 && <span className="font-semibold text-rose-600">{failed} falhou</span>}
          <span className={`font-bold tabular-nums ${passRateColor(rate)}`}>
            {rate.toFixed(0)}%
          </span>
        </div>

        {allPassed && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            ✓ tudo ok
          </span>
        )}

        <ChevronIcon open={!collapsed} />
      </button>

      {!collapsed && (
        <div className="border-t border-slate-100 p-2 space-y-1">
          {scenarios.map((s) => (
            <ScenarioItem key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── RunCard ──────────────────────────────────────────────────────────────────

interface RunCardProps {
  run: E2ERun
  isLatest: boolean
  scenarios: E2EScenarioResult[] | null
}

function RunCard({ run, isLatest, scenarios }: RunCardProps) {
  const [expanded, setExpanded] = useState(isLatest)

  const suiteLabels = scenarios ? getRunSuiteLabels(scenarios) : []
  const totalDuration = scenarios ? formatTotalDuration(scenarios) : null
  const summary = scenarios ? generateSummary(run, suiteLabels) : null

  const bySuite = (scenarios ?? []).reduce<Record<string, E2EScenarioResult[]>>((acc, r) => {
    ;(acc[r.suiteId] ??= []).push(r)
    return acc
  }, {})
  const sortedSuites = Object.keys(bySuite).sort(
    (a, b) => SUITE_ORDER.indexOf(a) - SUITE_ORDER.indexOf(b)
  )

  const hasFailed = run.failed > 0
  const outerCls = isLatest
    ? hasFailed
      ? 'border-rose-200 bg-rose-50/20'
      : 'border-emerald-200 bg-emerald-50/20'
    : 'border-slate-200 bg-white'

  return (
    <div className={`overflow-hidden rounded-xl border ${outerCls}`}>
      {/* Run header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-black/[0.02]"
      >
        <div className="min-w-0 flex-1">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isLatest && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                último
              </span>
            )}
            {suiteLabels.map((l) => (
              <span
                key={l}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
              >
                {l}
              </span>
            ))}
            <span className="text-xs text-slate-500">{run.runner}</span>
          </div>

          {/* Timestamps */}
          <p className="mt-1 text-[11px] text-slate-400">
            {new Date(run.emittedAt).toLocaleString('pt-BR')}
            {' · '}
            {formatTimeAgo(run.emittedAt)}
            {totalDuration && ` · ${totalDuration} total`}
          </p>

          {/* Auto-generated summary */}
          {summary && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{summary}</p>}
        </div>

        {/* Pass rate block */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`text-sm font-bold tabular-nums ${passRateColor(run.passRate)}`}>
            {run.passRate.toFixed(1)}%
          </span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-emerald-600">{run.passed}✓</span>
            {run.failed > 0 && <span className="font-medium text-rose-600">{run.failed}✗</span>}
            {run.skipped > 0 && <span className="text-slate-400">{run.skipped} skip</span>}
            <span className="text-slate-400">/ {run.total}</span>
          </div>
          <ChevronIcon open={expanded} />
        </div>
      </button>

      {/* Pass rate bar */}
      <div className="px-4 pb-3">
        <PassRateBar rate={run.passRate} thin />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-200 p-3">
          {scenarios && scenarios.length > 0 ? (
            <div className="space-y-2">
              {sortedSuites.map((suiteId) => (
                <SuiteGroup key={suiteId} suiteId={suiteId} scenarios={bySuite[suiteId] ?? []} />
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-slate-400">
              Detalhes de cenários disponíveis apenas para o run mais recente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Executive summary ────────────────────────────────────────────────────────

function ExecutiveSummary({
  latest,
  latestResults,
}: {
  latest: E2ERun
  latestResults: E2EScenarioResult[]
}) {
  const suiteLabels = getRunSuiteLabels(latestResults)
  const hasFailed = latest.failed > 0
  const bgCls = hasFailed ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'

  return (
    <div className={`rounded-xl border p-4 ${bgCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`text-2xl font-bold tabular-nums ${passRateColor(latest.passRate)}`}>
              {latest.passRate.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-600">de sucesso</span>
            {!hasFailed && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ✓ tudo passou
              </span>
            )}
            {hasFailed && (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                {latest.failed} falhou
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Último run {formatTimeAgo(latest.emittedAt)} · {latest.runner}
          </p>
          {suiteLabels.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-400">Suítes: {suiteLabels.join(' · ')}</p>
          )}
        </div>

        <dl className="flex gap-5 text-xs">
          <div className="flex flex-col items-center">
            <dt className="text-slate-400">total</dt>
            <dd className="font-bold text-slate-700">{latest.total}</dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="text-emerald-600">passou</dt>
            <dd className="font-bold text-emerald-700">{latest.passed}</dd>
          </div>
          {latest.failed > 0 && (
            <div className="flex flex-col items-center">
              <dt className="text-rose-500">falhou</dt>
              <dd className="font-bold text-rose-700">{latest.failed}</dd>
            </div>
          )}
          {latest.skipped > 0 && (
            <div className="flex flex-col items-center">
              <dt className="text-slate-400">pulado</dt>
              <dd className="font-bold text-slate-500">{latest.skipped}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

// ─── E2EPanel ─────────────────────────────────────────────────────────────────

interface E2EPanelProps {
  e2e: E2EData
}

export function E2EPanel({ e2e }: E2EPanelProps) {
  const { runs, latestResults } = e2e

  if (runs.length === 0) {
    return (
      <SectionCard
        title="E2E — Testes funcionais"
        subtitle="Resultados dos testes end-to-end publicados automaticamente pelo pipeline do tribus-e2e."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-8 text-center">
          <p className="text-sm font-medium text-slate-700">Nenhuma execução registrada ainda</p>
          <p className="mt-1 text-xs text-slate-400">
            Os resultados aparecem automaticamente após o próximo run do GitHub Actions.
          </p>
        </div>
      </SectionCard>
    )
  }

  const latest = runs[0]!

  return (
    <SectionCard
      title="E2E — Testes funcionais"
      subtitle="Resultados dos testes end-to-end publicados automaticamente pelo pipeline do tribus-e2e."
    >
      <div className="space-y-4">
        {/* Executive summary */}
        <ExecutiveSummary latest={latest} latestResults={latestResults} />

        {/* Run history */}
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Histórico de execuções
          </p>
          <div className="space-y-3">
            {runs.map((run, i) => (
              <RunCard
                key={run.id}
                run={run}
                isLatest={i === 0}
                scenarios={i === 0 ? latestResults : null}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
