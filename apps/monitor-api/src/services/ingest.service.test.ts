import { describe, expect, it, vi } from 'vitest'
import type { CheckResultInput } from '@tribus-monitor/core'
import { ingestChecks } from './ingest.service'
import type { StorageRepositories } from '../types'

const check: CheckResultInput = {
  serviceKey: 'svc',
  serviceName: 'S',
  kind: 'storefront-api',
  niche: 'corrida',
  url: 'https://example.com',
  statusCode: 200,
  latencyMs: 5,
  ok: true,
  error: null,
  checkedAt: '2026-01-01T10:00:00.000Z',
  source: 'check-runner',
}

function mkRepos(): StorageRepositories {
  return {
    checkResults: {
      insertMany: vi.fn(async () => {}),
      list: vi.fn(async () => []),
    },
    serviceStates: {
      get: vi.fn(async () => null),
      upsert: vi.fn(async () => {}),
      list: vi.fn(async () => []),
    },
    incidents: {
      open: vi.fn(async () => {}),
      getOpenByService: vi.fn(async () => null),
      close: vi.fn(async () => {}),
      list: vi.fn(async () => []),
    },
    coverage: {
      upsert: vi.fn(async () => {}),
      list: vi.fn(async () => []),
    },
  }
}

describe('ingestChecks', () => {
  it('inserts checks and updates service state', async () => {
    const repos = mkRepos()
    const out = await ingestChecks(repos, [check], '2026-01-01T10:00:01.000Z')
    expect(out.ingested).toBe(1)
    expect(repos.checkResults.insertMany).toHaveBeenCalledTimes(1)
    expect(repos.serviceStates.upsert).toHaveBeenCalled()
  })

  it('does not open a second incident while one is already open', async () => {
    const repos = mkRepos()
    const downState = {
      serviceKey: 'svc',
      serviceName: 'S',
      kind: 'storefront-api' as const,
      niche: 'corrida',
      status: 'down' as const,
      consecutiveFailures: 3,
      lastLatencyMs: 1,
      lastCheckAt: '2026-01-01T10:00:00.000Z',
      lastOkAt: null,
      lastError: 'e',
      updatedAt: '2026-01-01T10:00:00.000Z',
    }
    repos.serviceStates.get = vi.fn(async () => downState)
    repos.incidents.getOpenByService = vi.fn(async () => ({
      id: 'open',
      serviceKey: 'svc',
      serviceName: 'S',
      niche: 'corrida',
      startedAt: 'x',
      resolvedAt: null,
      statusAtOpen: 'down' as const,
      statusAtClose: null,
      openReason: 'r',
      closeReason: null,
    }))
    await ingestChecks(repos, [{ ...check, ok: false }], '2026-01-01T10:00:01.000Z')
    expect(repos.incidents.open).not.toHaveBeenCalled()
  })
})
