import { describe, expect, it, vi } from 'vitest'
import { fetchDashboardData } from './monitor-api'

describe('fetchDashboardData', () => {
  it('returns normalized dashboard payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ services: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ repos: [] }) })
    )

    const data = await fetchDashboardData()
    expect(data.services).toHaveLength(0)
    expect(data.incidents).toHaveLength(0)
    expect(data.historyCount).toBe(0)
    expect(data.checks).toHaveLength(0)
    expect(data.coverage.repos).toHaveLength(3)
  })
})
