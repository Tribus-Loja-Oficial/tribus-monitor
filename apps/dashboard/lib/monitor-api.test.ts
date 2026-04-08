import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDashboardData, fetchDashboardDataFromBase } from './monitor-api'

describe('fetchDashboardData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

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
    expect(data.coverage.repos).toHaveLength(4)
  })

  it('throws when a core request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ repos: [] }) })
    )
    await expect(fetchDashboardDataFromBase('https://api.example')).rejects.toThrow(
      /Dashboard data request failed/
    )
  })

  it('uses empty coverage when coverage response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ services: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
    )
    const data = await fetchDashboardDataFromBase('https://api.example')
    expect(data.coverage.repos).toEqual(expect.any(Array))
  })
})
