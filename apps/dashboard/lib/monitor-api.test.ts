import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDashboardData, fetchDashboardDataFromBase } from './monitor-api'

const e2eOk = { ok: true, json: async () => ({ runs: [], latestResults: [] }) }

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
        .mockResolvedValueOnce(e2eOk)
    )

    const data = await fetchDashboardData()
    expect(data.services).toHaveLength(0)
    expect(data.incidents).toHaveLength(0)
    expect(data.historyCount).toBe(0)
    expect(data.checks).toHaveLength(0)
    expect(data.coverage.repos).toHaveLength(4)
    expect(data.e2e.runs).toHaveLength(0)
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
        .mockResolvedValueOnce(e2eOk)
    )
    await expect(fetchDashboardDataFromBase('https://api.example')).rejects.toThrow(
      /Dashboard data request failed/
    )
  })

  it('uses MONITOR_API_URL for fetch base when set', async () => {
    vi.stubEnv('MONITOR_API_URL', 'https://monitor.example')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ services: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ repos: [] }) })
      .mockResolvedValueOnce(e2eOk)
    vi.stubGlobal('fetch', fetchMock)

    await fetchDashboardData()

    expect(fetchMock).toHaveBeenCalledWith('https://monitor.example/status', { cache: 'no-store' })
  })

  it('uses default localhost base when MONITOR_API_URL is unset', async () => {
    const prev = process.env.MONITOR_API_URL
    delete process.env.MONITOR_API_URL
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ services: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ repos: [] }) })
      .mockResolvedValueOnce(e2eOk)
    vi.stubGlobal('fetch', fetchMock)
    try {
      await fetchDashboardData()
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/status', { cache: 'no-store' })
    } finally {
      if (prev === undefined) delete process.env.MONITOR_API_URL
      else process.env.MONITOR_API_URL = prev
    }
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
        .mockResolvedValueOnce(e2eOk)
    )
    const data = await fetchDashboardDataFromBase('https://api.example')
    expect(data.coverage.repos).toEqual(expect.any(Array))
    expect(data.e2e.runs).toHaveLength(0)
  })

  it('uses empty e2e when e2e-results response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ services: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ incidents: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ checks: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ repos: [] }) })
        .mockResolvedValueOnce({ ok: false })
    )
    const data = await fetchDashboardDataFromBase('https://api.example')
    expect(data.e2e.runs).toHaveLength(0)
    expect(data.e2e.latestResults).toHaveLength(0)
  })
})
