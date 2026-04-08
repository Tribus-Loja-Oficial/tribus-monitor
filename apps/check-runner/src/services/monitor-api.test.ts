import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendChecksToMonitorApi } from './monitor-api'

const sampleCheck = {
  serviceKey: 'k',
  serviceName: 'n',
  kind: 'storefront-api' as const,
  niche: 'corrida',
  url: 'https://example.com',
  statusCode: 200,
  latencyMs: 1,
  ok: true,
  error: null,
  checkedAt: '2026-01-01T10:00:00.000Z',
  source: 'check-runner' as const,
}

describe('sendChecksToMonitorApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves when monitor returns ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '' })
    )
    await expect(
      sendChecksToMonitorApi({
        monitorApiUrl: 'https://m.example',
        token: 't',
        checks: [sampleCheck],
      })
    ).resolves.toBeUndefined()
  })

  it('throws when monitor returns error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'nope' })
    )
    await expect(
      sendChecksToMonitorApi({
        monitorApiUrl: 'https://m.example',
        token: 't',
        checks: [sampleCheck],
      })
    ).rejects.toThrow(/Monitor API ingest failed \(500\)/)
  })
})
