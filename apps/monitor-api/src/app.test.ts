import { describe, expect, it } from 'vitest'
import { createApp } from './app'

const env = {
  MONITOR_CHECKS_TOKEN: 'secret-token',
  MONITOR_COVERAGE_TOKEN: 'coverage-token',
  MONITOR_E2E_TOKEN: 'e2e-token',
}

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
        repoName: 'Real State',
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

  it('exposes GET /health', async () => {
    const app = createApp(env)
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.service).toBe('tribus-monitor-api')
  })

  it('rejects checks when Authorization is not Bearer', async () => {
    const app = createApp(env)
    const res = await app.request('/checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Token x',
      },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    expect(res.status).toBe(401)
  })

  it('rejects checks with wrong bearer token', async () => {
    const app = createApp(env)
    const res = await app.request('/checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer wrong',
      },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid check ingest body', async () => {
    const app = createApp(env)
    const res = await app.request('/checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer secret-token',
      },
      body: JSON.stringify({ checks: [] }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown service on GET /status/:serviceKey', async () => {
    const app = createApp(env)
    const res = await app.request('/status/does-not-exist')
    expect(res.status).toBe(404)
  })

  it('sorts status with down before degraded before healthy', async () => {
    const app = createApp(env)
    const auth = { authorization: 'Bearer secret-token', 'content-type': 'application/json' }
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')],
      }),
    })
    const bad = {
      ...mkCheck(false, '2026-01-01T10:00:01.000Z'),
      serviceKey: 'svc-b',
      serviceName: 'B',
    }
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ checks: [bad] }),
    })
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ checks: [bad] }),
    })
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ checks: [bad] }),
    })

    const res = await app.request('/status')
    const body = await res.json()
    expect(body.services[0].status).toBe('down')
    expect(body.services[1].status).toBe('healthy')
  })

  it('filters history by serviceKey and respects limit', async () => {
    const app = createApp(env)
    const auth = { authorization: 'Bearer secret-token', 'content-type': 'application/json' }
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    const res = await app.request('/history?limit=1&serviceKey=storefront-health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.checks.length).toBeLessThanOrEqual(1)
  })

  it('lists services metadata on GET /services', async () => {
    const app = createApp(env)
    await app.request('/checks', {
      method: 'POST',
      headers: { authorization: 'Bearer secret-token', 'content-type': 'application/json' },
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    const res = await app.request('/services')
    const body = await res.json()
    expect(body.services[0]).toMatchObject({
      serviceKey: 'storefront-health',
      niche: 'corrida',
      kind: 'storefront-api',
    })
  })

  it('returns 400 on invalid coverage payload', async () => {
    const app = createApp(env)
    const res = await app.request('/coverage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer coverage-token',
      },
      body: JSON.stringify({
        repoKey: 'unknown-repo',
        repoName: 'X',
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      }),
    })
    expect(res.status).toBe(400)
  })

  it('rejects coverage with invalid bearer token', async () => {
    const app = createApp(env)
    const res = await app.request('/coverage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer not-coverage',
      },
      body: JSON.stringify({
        repoKey: 'tribus-monitor',
        repoName: 'T',
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      }),
    })
    expect(res.status).toBe(401)
  })

  it('ingests coverage with optional commitSha runUrl and updatedAt', async () => {
    const app = createApp(env)
    const res = await app.request('/coverage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer coverage-token',
      },
      body: JSON.stringify({
        repoKey: 'tribus-ops',
        repoName: 'Ops',
        lines: 88,
        functions: 88,
        branches: 88,
        statements: 88,
        commitSha: 'abc123',
        runUrl: 'https://github.com/org/repo/actions/runs/1',
        updatedAt: '2026-01-01T15:00:00.000Z',
      }),
    })
    expect(res.status).toBe(201)
  })

  it('returns service state on GET /status/:serviceKey for existing key', async () => {
    const app = createApp(env)
    const auth = { authorization: 'Bearer secret-token', 'content-type': 'application/json' }
    await app.request('/checks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ checks: [mkCheck(true, '2026-01-01T10:00:00.000Z')] }),
    })
    const res = await app.request('/status/storefront-health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.service.serviceKey).toBe('storefront-health')
  })

  it('requires bearer token for POST /e2e-results', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  it('rejects POST /e2e-results with wrong token', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer wrong' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  it('rejects POST /e2e-results with invalid payload', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer e2e-token' },
      body: JSON.stringify({ source: 'tribus-e2e' }),
    })
    expect(res.status).toBe(400)
  })

  it('ingests and lists E2E results', async () => {
    const app = createApp(env)
    const payload = {
      source: 'tribus-e2e',
      runner: 'github-actions',
      checkType: 'functional_e2e',
      emittedAt: '2026-01-01T10:00:00.000Z',
      results: [
        {
          suiteId: 'storefront-smoke',
          scenarioId: 'J05-login-valid',
          scenarioName: 'Login valido',
          niche: 'corrida',
          environment: 'production',
          status: 'passed',
          criticality: 'P0',
          durationMs: 3200,
          startedAt: '2026-01-01T10:00:00.000Z',
          finishedAt: '2026-01-01T10:00:03.200Z',
        },
        {
          suiteId: 'storefront-smoke',
          scenarioId: 'J06-login-invalid',
          scenarioName: 'Login invalido',
          niche: 'corrida',
          environment: 'production',
          status: 'failed',
          criticality: 'P1',
          failureType: 'functional',
          errorMessage: 'Expected error banner to be visible',
          durationMs: 8000,
          startedAt: '2026-01-01T10:00:04.000Z',
          finishedAt: '2026-01-01T10:00:12.000Z',
        },
      ],
    }

    const post = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer e2e-token' },
      body: JSON.stringify(payload),
    })
    expect(post.status).toBe(201)
    const postBody = await post.json()
    expect(postBody.saved).toBe(true)
    expect(typeof postBody.runId).toBe('string')

    const list = await app.request('/e2e-results?limit=5')
    expect(list.status).toBe(200)
    const listBody = await list.json()
    expect(listBody.runs).toHaveLength(1)
    expect(listBody.runs[0].total).toBe(2)
    expect(listBody.runs[0].passed).toBe(1)
    expect(listBody.runs[0].failed).toBe(1)
    expect(listBody.runs[0].passRate).toBe(50)
    expect(listBody.latestResults).toHaveLength(2)
  })

  it('requires bearer token for DELETE /e2e-results/:runId', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results/00000000-0000-4000-8000-000000000001', {
      method: 'DELETE',
    })
    expect(res.status).toBe(401)
  })

  it('rejects DELETE /e2e-results/:runId with invalid run id', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results/not-a-uuid', {
      method: 'DELETE',
      headers: { authorization: 'Bearer e2e-token' },
    })
    expect(res.status).toBe(400)
  })

  it('deletes an E2E run and its scenario rows', async () => {
    const app = createApp(env)
    const post = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer e2e-token' },
      body: JSON.stringify({
        source: 'tribus-e2e',
        runner: 'local',
        checkType: 'functional_e2e',
        emittedAt: '2026-01-01T10:00:00.000Z',
        results: [
          {
            suiteId: 'storefront-smoke',
            scenarioId: 'J05-login-valid',
            scenarioName: 'Login valido',
            niche: 'corrida',
            environment: 'production',
            status: 'passed',
            criticality: 'P0',
            durationMs: 100,
            startedAt: '2026-01-01T10:00:00.000Z',
            finishedAt: '2026-01-01T10:00:00.100Z',
          },
        ],
      }),
    })
    expect(post.status).toBe(201)
    const { runId } = (await post.json()) as { runId: string }

    const del = await app.request(`/e2e-results/${runId}`, {
      method: 'DELETE',
      headers: { authorization: 'Bearer e2e-token' },
    })
    expect(del.status).toBe(200)
    const delBody = await del.json()
    expect(delBody.deleted).toBe(true)

    const list = await app.request('/e2e-results')
    const listBody = await list.json()
    expect(listBody.runs).toHaveLength(0)
    expect(listBody.latestResults).toHaveLength(0)
  })

  it('returns empty latestResults when no E2E runs exist', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.runs).toHaveLength(0)
    expect(body.latestResults).toHaveLength(0)
  })

  it('handles E2E payload with empty results array (passRate=0)', async () => {
    const app = createApp(env)
    const res = await app.request('/e2e-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer e2e-token' },
      body: JSON.stringify({
        source: 'tribus-e2e',
        runner: 'github-actions',
        checkType: 'functional_e2e',
        emittedAt: '2026-01-01T10:00:00.000Z',
        results: [],
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.saved).toBe(true)
  })

  it('sorts services with same status alphabetically by serviceKey', async () => {
    const app = createApp(env)
    const auth = { authorization: 'Bearer secret-token', 'content-type': 'application/json' }
    const mkFail = (key: string) => ({
      ...mkCheck(false, '2026-01-01T10:00:00.000Z'),
      serviceKey: key,
      serviceName: key,
    })
    // 2 consecutive failures → degraded; exercises getStatusPriority('degraded') tiebreak
    for (let i = 0; i < 2; i++) {
      await app.request('/checks', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ checks: [mkFail('aaa-service'), mkFail('zzz-service')] }),
      })
    }
    const res = await app.request('/status')
    const svcs: { serviceKey: string }[] = (await res.json()).services
    const aIdx = svcs.findIndex((s) => s.serviceKey === 'aaa-service')
    const zIdx = svcs.findIndex((s) => s.serviceKey === 'zzz-service')
    expect(aIdx).toBeLessThan(zIdx)
  })
})
