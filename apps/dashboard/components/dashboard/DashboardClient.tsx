'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CheckResult } from '@tribus-monitor/core'
import type { DashboardData } from '../../lib/monitor-api'
import { getGlobalPlatformStatus } from '../../lib/status'
import { groupServicesByDomain } from '../../lib/service-groups'
import { formatTimeAgo } from '../../lib/time'
import { GlobalStatusBanner } from '../status/GlobalStatusBanner'
import { ModulesOverview } from '../ModulesOverview'
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
  const [activeTab, setActiveTab] = useState<'services' | 'coverage'>('services')

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
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <header className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-white shadow-lg">
        <h1 className="text-2xl font-bold md:text-3xl">Tribus Monitor Dashboard</h1>
        <p className="mt-1 text-sm text-cyan-50">
          Observabilidade operacional da plataforma Tribus.
        </p>
      </header>

      <GlobalStatusBanner status={globalStatus} lastUpdatedLabel={lastUpdatedLabel} />
      <ModulesOverview />

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Servicos monitorados" value={data.services.length} icon="🧩" />
        <MetricCard
          label="Incidentes abertos"
          value={openIncidents.length}
          icon="🚨"
          tone="danger"
        />
        <MetricCard label="Eventos recentes" value={data.historyCount} icon="🕒" />
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-white/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'services'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Servicos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'coverage'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cobertura de testes
        </button>
        <span className="ml-3 inline-flex items-center text-[11px] text-slate-500">
          Atualizado {lastUpdatedLabel}
        </span>
      </section>

      {activeTab === 'services' ? (
        <>
          <div className="space-y-3">
            {groupedServices.map((group) => (
              <ServiceGroupSection
                key={group.key}
                group={group}
                checksByService={checksByService}
              />
            ))}
          </div>

          <section className="grid gap-3 md:grid-cols-2">
            <SectionCard title="Incidentes" subtitle="Titulo, duracao, inicio e status atual.">
              <IncidentList incidents={data.incidents} />
            </SectionCard>
            <SectionCard title="Timeline de checks" subtitle="Ultimos eventos de verificacao.">
              <RecentEventsTimeline checks={data.checks} />
            </SectionCard>
          </section>
        </>
      ) : (
        <CoveragePanel coverage={data.coverage} />
      )}
    </main>
  )
}
