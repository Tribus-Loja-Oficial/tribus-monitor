import { describe, expect, it } from 'vitest'
import type { CheckResult, Incident, ServiceState } from '@tribus-monitor/core'
import { createD1Repositories } from './d1-repositories'
import { createRepositories } from './index'

type ServiceStateRow = {
  service_key: string
  service_name: string
  kind: ServiceState['kind']
  niche: string
  status: ServiceState['status']
  consecutive_failures: number
  last_latency_ms: number
  last_check_at: string
  last_ok_at: string | null
  last_error: string | null
  updated_at: string
}

type IncidentRow = {
  id: string
  service_key: string
  service_name: string
  niche: string
  started_at: string
  resolved_at: string | null
  status_at_open: Incident['statusAtOpen']
  status_at_close: Incident['statusAtClose']
  open_reason: string | null
  close_reason: string | null
}

function createMemoryD1() {
  const checkRows: Array<{
    id: string
    service_key: string
    service_name: string
    kind: CheckResult['kind']
    niche: string
    url: string
    status_code: number | null
    latency_ms: number
    ok: number
    error: string | null
    checked_at: string
    source: CheckResult['source']
    created_at: string
  }> = []

  const serviceMap = new Map<string, ServiceStateRow>()
  const incidentRows: IncidentRow[] = []
  const coverageRows = new Map<
    string,
    {
      repo_key: string
      repo_name: string
      lines: number
      functions: number
      branches: number
      statements: number
      commit_sha: string | null
      run_url: string | null
      updated_at: string
    }
  >()

  const e2eRunRows: {
    id: string
    source: string
    runner: string
    environment: string
    emitted_at: string
    total: number
    passed: number
    failed: number
    skipped: number
    pass_rate: number
    created_at: string
  }[] = []

  const e2eResultRows: {
    id: string
    run_id: string
    suite_id: string
    scenario_id: string
    scenario_name: string
    niche: string
    environment: string
    status: string
    criticality: string
    failure_type: string | null
    error_message: string | null
    duration_ms: number
    started_at: string
    finished_at: string
  }[] = []

  function prepare(sql: string) {
    const q = sql.replace(/\s+/g, ' ').trim()

    const chain = (args: unknown[]) => ({
      async run() {
        if (q.includes('INSERT INTO check_results')) {
          checkRows.push({
            id: args[0] as string,
            service_key: args[1] as string,
            service_name: args[2] as string,
            kind: args[3] as CheckResult['kind'],
            niche: args[4] as string,
            url: args[5] as string,
            status_code: args[6] as number | null,
            latency_ms: args[7] as number,
            ok: args[8] as number,
            error: args[9] as string | null,
            checked_at: args[10] as string,
            source: args[11] as CheckResult['source'],
            created_at: args[12] as string,
          })
          return
        }
        if (q.includes('INSERT INTO service_states')) {
          const st: ServiceStateRow = {
            service_key: args[0] as string,
            service_name: args[1] as string,
            kind: args[2] as ServiceState['kind'],
            niche: args[3] as string,
            status: args[4] as ServiceState['status'],
            consecutive_failures: args[5] as number,
            last_latency_ms: args[6] as number,
            last_check_at: args[7] as string,
            last_ok_at: args[8] as string | null,
            last_error: args[9] as string | null,
            updated_at: args[10] as string,
          }
          serviceMap.set(st.service_key, st)
          return
        }
        if (q.includes('INSERT INTO incidents')) {
          incidentRows.push({
            id: args[0] as string,
            service_key: args[1] as string,
            service_name: args[2] as string,
            niche: args[3] as string,
            started_at: args[4] as string,
            resolved_at: args[5] as string | null,
            status_at_open: args[6] as Incident['statusAtOpen'],
            status_at_close: args[7] as Incident['statusAtClose'],
            open_reason: args[8] as string | null,
            close_reason: args[9] as string | null,
          })
          return
        }
        if (q.includes('UPDATE incidents') && q.includes('SET resolved_at')) {
          const resolvedAt = args[0] as string
          const closeReason = args[1] as string | null
          const serviceKey = args[2] as string
          const candidates = incidentRows
            .filter((r) => r.service_key === serviceKey && r.resolved_at === null)
            .sort((a, b) => b.started_at.localeCompare(a.started_at))
          const target = candidates[0]
          if (target) {
            target.resolved_at = resolvedAt
            target.close_reason = closeReason
            target.status_at_close = 'healthy'
          }
        }
        if (q.includes('INSERT INTO coverage_snapshots')) {
          coverageRows.set(args[0] as string, {
            repo_key: args[0] as string,
            repo_name: args[1] as string,
            lines: args[2] as number,
            functions: args[3] as number,
            branches: args[4] as number,
            statements: args[5] as number,
            commit_sha: args[6] as string | null,
            run_url: args[7] as string | null,
            updated_at: args[8] as string,
          })
        }
        if (q.includes('INSERT INTO e2e_runs')) {
          e2eRunRows.push({
            id: args[0] as string,
            source: args[1] as string,
            runner: args[2] as string,
            environment: args[3] as string,
            emitted_at: args[4] as string,
            total: args[5] as number,
            passed: args[6] as number,
            failed: args[7] as number,
            skipped: args[8] as number,
            pass_rate: args[9] as number,
            created_at: args[10] as string,
          })
        }
        if (q.includes('INSERT INTO e2e_results')) {
          e2eResultRows.push({
            id: args[0] as string,
            run_id: args[1] as string,
            suite_id: args[2] as string,
            scenario_id: args[3] as string,
            scenario_name: args[4] as string,
            niche: args[5] as string,
            environment: args[6] as string,
            status: args[7] as string,
            criticality: args[8] as string,
            failure_type: args[9] as string | null,
            error_message: args[10] as string | null,
            duration_ms: args[11] as number,
            started_at: args[12] as string,
            finished_at: args[13] as string,
          })
        }
      },
      async first<T>(): Promise<T | null> {
        if (q.includes('FROM service_states') && q.includes('WHERE service_key')) {
          const key = args[0] as string
          return (serviceMap.get(key) as T) ?? null
        }
        if (q.includes('FROM incidents') && q.includes('resolved_at IS NULL')) {
          const key = args[0] as string
          const row = incidentRows
            .filter((r) => r.service_key === key && r.resolved_at === null)
            .sort((a, b) => b.started_at.localeCompare(a.started_at))[0]
          return (row as T) ?? null
        }
        return null
      },
      async all<T>(): Promise<{ results: T[] }> {
        if (q.includes('FROM check_results')) {
          const limit = args[0] as number
          const sorted = [...checkRows].sort((a, b) => b.checked_at.localeCompare(a.checked_at))
          return { results: sorted.slice(0, limit) as T[] }
        }
        if (q.includes('FROM service_states') && q.includes('ORDER BY service_key')) {
          const sorted = [...serviceMap.values()].sort((a, b) =>
            a.service_key.localeCompare(b.service_key)
          )
          return { results: sorted as T[] }
        }
        if (q.includes('FROM incidents') && q.includes('ORDER BY started_at DESC')) {
          const limit = args[0] as number
          const sorted = [...incidentRows].sort((a, b) => b.started_at.localeCompare(a.started_at))
          return { results: sorted.slice(0, limit) as T[] }
        }
        if (q.includes('FROM coverage_snapshots')) {
          const sorted = [...coverageRows.values()].sort((a, b) =>
            a.repo_key.localeCompare(b.repo_key)
          )
          return { results: sorted as T[] }
        }
        if (q.includes('FROM e2e_runs')) {
          const limit = args[0] as number
          const sorted = [...e2eRunRows].sort((a, b) => b.emitted_at.localeCompare(a.emitted_at))
          return { results: sorted.slice(0, limit) as T[] }
        }
        if (q.includes('FROM e2e_results') && q.includes('run_id')) {
          const runId = args[0] as string
          const filtered = e2eResultRows
            .filter((r) => r.run_id === runId)
            .sort((a, b) => a.started_at.localeCompare(b.started_at))
          return { results: filtered as T[] }
        }
        return { results: [] }
      },
    })

    return {
      bind: (...args: unknown[]) => chain(args),
      run: () => chain([]).run(),
      first: () => chain([]).first(),
      all: () => chain([]).all(),
    }
  }

  return { prepare }
}

describe('createD1Repositories', () => {
  it('falls back to in-memory when binding is invalid', () => {
    const repos = createD1Repositories(null)
    expect(repos).toBeDefined()
  })

  it('executes CRUD paths against a D1-shaped mock', async () => {
    const db = createMemoryD1()
    const repos = createD1Repositories(db)

    const row: CheckResult = {
      id: 'id-1',
      serviceKey: 'svc',
      serviceName: 'S',
      kind: 'storefront-api',
      niche: 'corrida',
      url: 'https://x',
      statusCode: 200,
      latencyMs: 1,
      ok: true,
      error: null,
      checkedAt: '2026-01-01T10:00:00.000Z',
      source: 'check-runner',
      createdAt: '2026-01-01T10:00:00.000Z',
    }

    await repos.checkResults.insertMany([row])
    const listed = await repos.checkResults.list(10)
    expect(listed).toHaveLength(1)
    expect(listed[0]!.serviceKey).toBe('svc')

    const state: ServiceState = {
      serviceKey: 'svc',
      serviceName: 'S',
      kind: 'storefront-api',
      niche: 'corrida',
      status: 'healthy',
      consecutiveFailures: 0,
      lastLatencyMs: 1,
      lastCheckAt: '2026-01-01T10:00:00.000Z',
      lastOkAt: '2026-01-01T10:00:00.000Z',
      lastError: null,
      updatedAt: '2026-01-01T10:00:00.000Z',
    }
    await repos.serviceStates.upsert(state)
    const got = await repos.serviceStates.get('svc')
    expect(got?.status).toBe('healthy')
    const allStates = await repos.serviceStates.list()
    expect(allStates).toHaveLength(1)

    const incident: Incident = {
      id: 'inc-1',
      serviceKey: 'svc',
      serviceName: 'S',
      niche: 'corrida',
      startedAt: '2026-01-01T10:00:00.000Z',
      resolvedAt: null,
      statusAtOpen: 'down',
      statusAtClose: null,
      openReason: 'x',
      closeReason: null,
    }
    await repos.incidents.open(incident)
    const open = await repos.incidents.getOpenByService('svc')
    expect(open?.id).toBe('inc-1')
    await repos.incidents.close('svc', '2026-01-01T11:00:00.000Z', 'ok')
    const incList = await repos.incidents.list(5)
    expect(incList[0]!.resolvedAt).toBeTruthy()

    await repos.coverage.upsert({
      repoKey: 'tribus-monitor',
      repoName: 'T',
      lines: 90,
      functions: 91,
      branches: 92,
      statements: 93,
      commitSha: null,
      runUrl: null,
      updatedAt: '2026-01-01T12:00:00.000Z',
    })
    const cov = await repos.coverage.list()
    expect(cov).toHaveLength(1)
    expect(cov[0]!.lines).toBe(90)
  })

  it('covers null/false branches in D1 repository methods', async () => {
    const db = createMemoryD1()
    const repos = createD1Repositories(db)

    // ok: false branch (row.ok ? 1 : 0)
    await repos.checkResults.insertMany([
      {
        id: 'id-fail',
        serviceKey: 'svc',
        serviceName: 'S',
        kind: 'storefront-api',
        niche: 'corrida',
        url: 'https://x',
        statusCode: 500,
        latencyMs: 1,
        ok: false,
        error: 'timeout',
        checkedAt: '2026-01-01T10:00:00.000Z',
        source: 'check-runner',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
    ])

    // null branch for serviceStates.get with unknown key
    const missing = await repos.serviceStates.get('nonexistent')
    expect(missing).toBeNull()

    // null branch for incidents.getOpenByService with no open incident
    const noIncident = await repos.incidents.getOpenByService('nonexistent')
    expect(noIncident).toBeNull()
  })

  it('routes createRepositories to D1 when DB.prepare exists', () => {
    const repos = createRepositories({
      DB: createMemoryD1(),
      MONITOR_CHECKS_TOKEN: 'a',
      MONITOR_COVERAGE_TOKEN: 'b',
    })
    expect(repos.coverage).toBeDefined()
  })

  it('stores and retrieves E2E runs and results via D1 mock', async () => {
    const db = createMemoryD1()
    const repos = createD1Repositories(db)

    const run = {
      id: 'run-d1-1',
      source: 'tribus-e2e',
      runner: 'github-actions',
      environment: 'production',
      emittedAt: '2026-01-01T10:00:00.000Z',
      total: 2,
      passed: 1,
      failed: 1,
      skipped: 0,
      passRate: 50,
      createdAt: '2026-01-01T10:00:01.000Z',
    }
    const scenarioResults = [
      {
        id: 'res-d1-1',
        runId: 'run-d1-1',
        suiteId: 'storefront-smoke',
        scenarioId: 'J05-login-valid',
        scenarioName: 'Login valido',
        niche: 'corrida',
        environment: 'production',
        status: 'passed' as const,
        criticality: 'P0',
        failureType: null,
        errorMessage: null,
        durationMs: 3200,
        startedAt: '2026-01-01T10:00:00.000Z',
        finishedAt: '2026-01-01T10:00:03.200Z',
      },
      {
        id: 'res-d1-2',
        runId: 'run-d1-1',
        suiteId: 'storefront-smoke',
        scenarioId: 'J06-login-invalid',
        scenarioName: 'Login invalido',
        niche: 'corrida',
        environment: 'production',
        status: 'failed' as const,
        criticality: 'P1',
        failureType: 'functional',
        errorMessage: 'Expected error banner',
        durationMs: 8000,
        startedAt: '2026-01-01T10:00:04.000Z',
        finishedAt: '2026-01-01T10:00:12.000Z',
      },
    ]

    await repos.e2e.insertRun(run, scenarioResults)

    const runs = await repos.e2e.listRuns(10)
    expect(runs).toHaveLength(1)
    expect(runs[0]!.id).toBe('run-d1-1')
    expect(runs[0]!.passRate).toBe(50)

    const results = await repos.e2e.listResultsByRun('run-d1-1')
    expect(results).toHaveLength(2)
    expect(results[0]!.scenarioId).toBe('J05-login-valid')
    expect(results[1]!.errorMessage).toBe('Expected error banner')

    const empty = await repos.e2e.listResultsByRun('nonexistent')
    expect(empty).toHaveLength(0)
  })
})
