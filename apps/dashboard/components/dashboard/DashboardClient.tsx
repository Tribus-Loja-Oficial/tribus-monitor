'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CheckResult } from '@tribus-monitor/core'
import type { DashboardData } from '../../lib/monitor-api'
import { getGlobalPlatformStatus } from '../../lib/status'
import { groupServicesByDomain } from '../../lib/service-groups'
import { formatTimeAgo } from '../../lib/time'
import { GlobalStatusBanner } from '../status/GlobalStatusBanner'
import { MetricCard } from '../ui/MetricCard'
import { ServiceGroupSection } from '../services/ServiceGroupSection'
import { SectionCard } from '../ui/SectionCard'
import { IncidentList } from '../incidents/IncidentList'
import { RecentEventsTimeline } from '../incidents/RecentEventsTimeline'
import { CoveragePanel } from '../coverage/CoveragePanel'

interface DashboardClientProps {
  initialData: DashboardData
}

function groupChecksByService(checks: CheckResult[]): Record<string, CheckResult[]> {
  const out: Record<string, CheckResult[]> = {}
  for (const check of checks) {
    const bucket = out[check.serviceKey] ?? (out[check.serviceKey] = [])
    bucket.push(check)
  }
  return out
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [activeTab, setActiveTab] = useState<'services' | 'coverage' | 'business'>('services')

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' })
        if (!res.ok) return
        const payload = (await res.json()) as DashboardData
        setData(payload)
      } catch {
        // best effort refresh
      }
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  const groupedServices = useMemo(() => groupServicesByDomain(data.services), [data.services])
  const checksByService = useMemo(() => groupChecksByService(data.checks), [data.checks])
  const openIncidents = data.incidents.filter((incident) => incident.resolvedAt === null)
  const globalStatus = getGlobalPlatformStatus(data.services)
  const coverageAverage = useMemo(() => {
    const values = data.coverage.repos.flatMap((repo) =>
      [repo.lines, repo.functions, repo.branches, repo.statements].filter(
        (v): v is number => v !== null
      )
    )
    if (values.length === 0) return null
    return Math.round((values.reduce((acc, v) => acc + v, 0) / values.length) * 100) / 100
  }, [data.coverage.repos])
  const lastUpdatedLabel = useMemo(() => {
    const firstCheck = data.checks[0]
    if (!firstCheck) return 'sem dados recentes'
    const latest = data.checks.reduce(
      (acc, curr) => (curr.checkedAt > acc ? curr.checkedAt : acc),
      firstCheck.checkedAt
    )
    return formatTimeAgo(latest)
  }, [data.checks])

  return (
    <main className="mx-auto max-w-7xl space-y-5 p-4 md:p-7">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-slate-100/70 p-7 shadow-[0_18px_45px_rgba(15,23,42,0.09)] md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-slate-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur">
              Tribus Platform Observability
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Tribus Monitor
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              Visao executiva e operacional de disponibilidade, incidentes e qualidade de
              engenharia.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300/70 bg-white/80 p-4 backdrop-blur-sm md:min-w-[260px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Atualizacao
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">{lastUpdatedLabel}</p>
            <p className="mt-2 text-xs text-slate-600">
              Painel sincronizado automaticamente com os checks operacionais.
            </p>
          </div>
        </div>
      </header>

      <GlobalStatusBanner status={globalStatus} lastUpdatedLabel={lastUpdatedLabel} />

      <section className="grid gap-3 md:grid-cols-2">
        <MetricCard
          label="Servicos monitorados"
          value={data.services.length}
          icon="🧩"
          active={activeTab === 'services'}
        />
        <MetricCard
          label={
            coverageAverage === null ? 'Cobertura media indisponivel' : 'Cobertura media de testes'
          }
          value={coverageAverage === null ? 0 : Math.round(coverageAverage)}
          icon="🧪"
          active={activeTab === 'coverage'}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
        <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/80 p-2">
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`rounded-lg border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === 'services'
                ? 'border-slate-300 bg-white text-slate-900 shadow-sm'
                : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/90 hover:text-slate-900'
            }`}
          >
            Servicos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coverage')}
            className={`rounded-lg border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === 'coverage'
                ? 'border-slate-300 bg-white text-slate-900 shadow-sm'
                : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/90 hover:text-slate-900'
            }`}
          >
            Cobertura de testes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`rounded-lg border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === 'business'
                ? 'border-slate-300 bg-white text-slate-900 shadow-sm'
                : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/90 hover:text-slate-900'
            }`}
          >
            Validacoes de negocio
          </button>
        </nav>

        <div className="p-4 md:p-5">
          {activeTab === 'services' ? (
            <section className="space-y-4">
              <header className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">Servicos</h2>
                <p className="text-xs text-slate-600">
                  Monitoramento operacional por dominio da plataforma, com foco em leitura rapida e
                  sinais de gravidade.
                </p>
              </header>
              <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  {groupedServices.map((group) => (
                    <ServiceGroupSection
                      key={group.key}
                      group={group}
                      checksByService={checksByService}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  <SectionCard
                    title={`Incidentes ativos (${openIncidents.length})`}
                    subtitle="Estado atual e historico recente de incidentes."
                  >
                    <div className="mb-3 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                      🚨 Incidentes ativos no momento: {openIncidents.length}
                    </div>
                    <IncidentList incidents={data.incidents} />
                  </SectionCard>
                  <SectionCard
                    title="Timeline de verificacoes"
                    subtitle="Sequencia temporal dos checks mais recentes."
                  >
                    <RecentEventsTimeline checks={data.checks} />
                  </SectionCard>
                </div>
              </section>
            </section>
          ) : activeTab === 'coverage' ? (
            <section className="space-y-4">
              <header className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">Cobertura de testes</h2>
                <p className="text-xs text-slate-600">
                  Indicadores de qualidade de engenharia publicados automaticamente pelos pipelines
                  dos repositorios Tribus.
                </p>
              </header>
              <CoveragePanel coverage={data.coverage} />
            </section>
          ) : (
            <SectionCard
              title="Validacoes de negocio"
              subtitle="Modulo planejado para regras operacionais, sinais de negocio e consistencia de dados."
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Em evolucao</p>
                <p className="mt-1">
                  Esta area sera dedicada a verificacoes de negocio (SLA de pedidos, saude de funis,
                  integridade de catalogo e alertas de risco operacional).
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </section>
    </main>
  )
}
