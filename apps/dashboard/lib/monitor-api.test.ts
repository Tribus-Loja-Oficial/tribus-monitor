import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDashboardData, fetchDashboardDataFromBase } from './monitor-api'

const dashboardPayload = {
  services: [],
  incidents: [],
  checks: [],
  repos: [],
  e2eRuns: [],
  e2eLatestResults: [],
}

function okResponse(data: unknown) {
  return { ok: true, json: async () => ({ ok: true, data }) }
}

describe('fetchDashboardData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('returns normalized dashboard payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(okResponse(dashboardPayload)))

    const data = await fetchDashboardData()
    expect(data.services).toHaveLength(0)
    expect(data.incidents).toHaveLength(0)
    expect(data.historyCount).toBe(0)
    expect(data.checks).toHaveLength(0)
    expect(data.coverage.repos).toHaveLength(4)
    expect(data.e2e.runs).toHaveLength(0)
  })

  it('throws when a core request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false }))
    await expect(fetchDashboardDataFromBase('https://api.example')).rejects.toThrow(
      /Dashboard data request failed/
    )
  })

  it('uses MONITOR_API_URL for fetch base when set', async () => {
    vi.stubEnv('MONITOR_API_URL', 'https://monitor.example')
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse(dashboardPayload))
    vi.stubGlobal('fetch', fetchMock)

    await fetchDashboardData()

    expect(fetchMock).toHaveBeenCalledWith('https://monitor.example/dashboard', {
      cache: 'no-store',
    })
  })

  it('uses default localhost base when MONITOR_API_URL is unset', async () => {
    const prev = process.env.MONITOR_API_URL
    delete process.env.MONITOR_API_URL
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse(dashboardPayload))
    vi.stubGlobal('fetch', fetchMock)
    try {
      await fetchDashboardData()
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/dashboard', {
        cache: 'no-store',
      })
    } finally {
      if (prev === undefined) delete process.env.MONITOR_API_URL
      else process.env.MONITOR_API_URL = prev
    }
  })

  it('returns empty coverage when repos is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(okResponse({ ...dashboardPayload, repos: [] }))
    )
    const data = await fetchDashboardDataFromBase('https://api.example')
    expect(data.coverage.repos).toEqual(expect.any(Array))
    expect(data.e2e.runs).toHaveLength(0)
  })

  it('returns empty e2e when e2eRuns is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(okResponse({ ...dashboardPayload, e2eRuns: [] }))
    )
    const data = await fetchDashboardDataFromBase('https://api.example')
    expect(data.e2e.runs).toHaveLength(0)
    expect(data.e2e.latestResults).toHaveLength(0)
  })
})
