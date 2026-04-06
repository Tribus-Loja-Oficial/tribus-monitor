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
    <main className="mx-auto max-w-7xl space-y-7 p-4 md:p-7">
      <header className="rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 p-6 text-white shadow-xl shadow-cyan-900/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">
              Tribus Platform Observability
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Tribus Monitor
            </h1>
            <p className="mt-2 text-sm text-cyan-50/90">
              Visao executiva e operacional de disponibilidade, incidentes e qualidade de
              engenharia.
            </p>
            <p className="mt-3 text-xs text-cyan-100/80">Dashboard atualizado {lastUpdatedLabel}</p>
          </div>
          <div className="min-w-[250px] flex-1">
            <GlobalStatusBanner status={globalStatus} lastUpdatedLabel={lastUpdatedLabel} />
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Servicos monitorados" value={data.services.length} icon="🧩" />
        <MetricCard
          label="Incidentes ativos"
          value={openIncidents.length}
          icon="🚨"
          tone="danger"
        />
        <MetricCard
          label={
            coverageAverage === null ? 'Cobertura media indisponivel' : 'Cobertura media de testes'
          }
          value={coverageAverage === null ? 0 : Math.round(coverageAverage)}
          icon="🧪"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'services'
              ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Servicos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'coverage'
              ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cobertura de testes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'business'
              ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Validacoes de negocio
        </button>
      </section>

      {activeTab === 'services' ? (
        <>
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
                title="Incidentes"
                subtitle="Estado atual e historico recente de incidentes."
              >
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
        </>
      ) : activeTab === 'coverage' ? (
        <>
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Cobertura de testes</h2>
            <p className="text-xs text-slate-600">
              Indicadores de qualidade de engenharia publicados automaticamente pelos pipelines dos
              repositorios Tribus.
            </p>
          </header>
          <CoveragePanel coverage={data.coverage} />
        </>
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
    </main>
  )
}
