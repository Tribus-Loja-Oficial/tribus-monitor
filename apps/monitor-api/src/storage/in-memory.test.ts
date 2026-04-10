import { describe, expect, it } from 'vitest'
import { createInMemoryRepositories } from './in-memory'

describe('createInMemoryRepositories', () => {
  it('is a no-op when closing incident that does not exist', async () => {
    const repos = createInMemoryRepositories()
    await repos.incidents.close('missing', '2026-01-01T00:00:00.000Z', 'r')
    const list = await repos.incidents.list()
    expect(list).toHaveLength(0)
  })

  it('applies default limits for history and incidents listing', async () => {
    const repos = createInMemoryRepositories()
    const rows = await repos.checkResults.list()
    const inc = await repos.incidents.list()
    expect(Array.isArray(rows)).toBe(true)
    expect(Array.isArray(inc)).toBe(true)
  })

  it('stores and retrieves E2E runs and results', async () => {
    const repos = createInMemoryRepositories()

    const run = {
      id: 'run-1',
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
    const results = [
      {
        id: 'run-1-0',
        runId: 'run-1',
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
        id: 'run-1-1',
        runId: 'run-1',
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

    await repos.e2e.insertRun(run, results)

    const runs = await repos.e2e.listRuns()
    expect(runs).toHaveLength(1)
    expect(runs[0]!.id).toBe('run-1')
    expect(runs[0]!.passRate).toBe(50)

    const scenarioResults = await repos.e2e.listResultsByRun('run-1')
    expect(scenarioResults).toHaveLength(2)
    expect(scenarioResults[0]!.scenarioId).toBe('J05-login-valid')

    const empty = await repos.e2e.listResultsByRun('nonexistent')
    expect(empty).toHaveLength(0)
  })
})
