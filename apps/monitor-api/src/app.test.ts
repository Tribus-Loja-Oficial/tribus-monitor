import { describe, expect, it } from 'vitest'
import { createApp } from './app'

const env = { MONITOR_CHECKS_TOKEN: 'secret-token', MONITOR_COVERAGE_TOKEN: 'coverage-token' }

function mkCheck(ok: boolean, at: string) {
  return {
    serviceKey: 'storefront-health',
    serviceName: 'Storefront Health',
    kind: 'storefront-api' as const,
    niche: 'corrida',
    url: 'https://storefront.example/api/health',
    statusCode: ok ? 200 : 503,
    latencyMs: ok ? 120 : 7000,
    ok,
    error: ok ? null : 'timeout',
    checkedAt: at,
    source: 'check-runner' as const,
  }
}

describe('monitor-api', () => {
  it('requires bearer token for POST /checks', async () => {
    const app = createApp(env)
    const res = await app.request('/checks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    expect(res.status).toBe(401)
  })

  it('ingests checks and exposes status/history/services', async () => {
    const app = createApp(env)
    const post = await app.request('/checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer secret-token',
      },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    expect(post.status).toBe(201)

    const statusRes = await app.request('/status')
    expect(statusRes.status).toBe(200)
    const statusBody = await statusRes.json()
    expect(statusBody.services[0].status).toBe('healthy')

    const historyRes = await app.request('/history')
    const historyBody = await historyRes.json()
    expect(historyBody.checks).toHaveLength(1)

    const servicesRes = await app.request('/services')
    const servicesBody = await servicesRes.json()
    expect(servicesBody.services[0].serviceKey).toBe('storefront-health')
  })

  it('opens and closes incidents automatically', async () => {
    const app = createApp(env)
    for (let i = 0; i < 3; i += 1) {
      await app.request('/checks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer secret-token',
        },
        body: JSON.stringify({ checks: [mkCheck(false, `2026-01-01T10:00:0${i}.000Z`)] }),
      })
    }
    const openRes = await app.request('/incidents')
    const openBody = await openRes.json()
    expect(openBody.incidents).toHaveLength(1)
    expect(openBody.incidents[0].resolvedAt).toBeNull()

    await app.request('/checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer secret-token',
      },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:10.000Z')] }),
    })
    const closedRes = await app.request('/incidents')
    const closedBody = await closedRes.json()
    expect(closedBody.incidents[0].resolvedAt).toBeTruthy()
  })

  it('ingests and lists coverage snapshots', async () => {
    const app = createApp(env)
    const unauthorized = await app.request('/coverage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        repoKey: 'tribus-monitor',
        repoName: 'Tribus Monitor',
        lines: 99,
        functions: 100,
        branches: 98,
        statements: 100,
      }),
    })
    expect(unauthorized.status).toBe(401)

    const post = await app.request('/coverage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer coverage-token',
      },
      body: JSON.stringify({
        repoKey: 'tribus-monitor',
        repoName: 'Tribus Monitor',
        lines: 99,
        functions: 100,
        branches: 98,
        statements: 100,
      }),
    })
    expect(post.status).toBe(201)

    const list = await app.request('/coverage')
    expect(list.status).toBe(200)
    const body = await list.json()
    expect(body.repos).toHaveLength(1)
    expect(body.repos[0].repoKey).toBe('tribus-monitor')
  })

  it('accepts real-state coverage snapshots', async () => {
    const app = createApp(env)
    const post = await app.request('/coverage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer coverage-token',
      },
      body: JSON.stringify({
        repoKey: 'real-state',
        repoName: 'Real State Landing',
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        commitSha: null,
        runUrl: null,
      }),
    })
    expect(post.status).toBe(201)
  })
})
