import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runCheckCycle } from './run-check-cycle'

vi.mock('./config/env', () => ({
  getEnv: () => ({
    MONITOR_API_URL: 'https://m.example',
    MONITOR_CHECKS_TOKEN: 't',
    niches: ['corrida'],
    TRIBUS_STOREFRONT_BASE_URL: 'https://sf.example',
    TRIBUS_OPS_BASE_URL: 'https://ops.example',
    TRIBUS_BE_BASE_URL: 'https://be.example',
  }),
}))

vi.mock('./services/targets', () => ({
  buildTargets: () => [
    {
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api' as const,
      niche: 'corrida',
      url: 'https://example.com',
    },
  ],
}))

vi.mock('./services/http-check', () => ({
  runHttpCheck: vi.fn(async () => ({
    serviceKey: 'k',
    serviceName: 'n',
    kind: 'storefront-api',
    niche: 'corrida',
    url: 'https://example.com',
    statusCode: 200,
    latencyMs: 1,
    ok: true,
    error: null,
    checkedAt: '2026-01-01T10:00:00.000Z',
    source: 'check-runner' as const,
  })),
}))

vi.mock('./services/monitor-api', () => ({
  sendChecksToMonitorApi: vi.fn(async () => {}),
}))

describe('runCheckCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs checks and sends them to the monitor API', async () => {
    const logs: string[] = []
    const out = await runCheckCycle((m) => logs.push(m))
    expect(out.checks).toBe(1)
    expect(logs.some((l) => l.includes('runner_completed'))).toBe(true)
  })
})
