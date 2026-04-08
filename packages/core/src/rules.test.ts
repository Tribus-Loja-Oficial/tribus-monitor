import { describe, expect, it } from 'vitest'
import {
  buildIncidentOpen,
  computeNextServiceState,
  getStatusFromFailures,
  shouldCloseIncident,
  shouldOpenIncident,
} from './rules.js'
import type { CheckResultInput, ServiceState } from './types.js'

function mkCheck(ok: boolean): CheckResultInput {
  return {
    serviceKey: 'storefront-health',
    serviceName: 'Storefront Health',
    kind: 'storefront-api',
    niche: 'corrida',
    url: 'https://example.com/api/health',
    statusCode: ok ? 200 : 503,
    latencyMs: ok ? 120 : 5200,
    ok,
    error: ok ? null : 'timeout',
    checkedAt: '2026-01-01T10:00:00.000Z',
    source: 'check-runner',
  }
}

describe('status rules', () => {
  it('maps failures to healthy/degraded/down', () => {
    expect(getStatusFromFailures(0)).toBe('healthy')
    expect(getStatusFromFailures(1)).toBe('degraded')
    expect(getStatusFromFailures(2)).toBe('degraded')
    expect(getStatusFromFailures(3)).toBe('down')
  })

  it('computes next service state with failure counter', () => {
    const initial = computeNextServiceState(null, mkCheck(false), '2026-01-01T10:00:01.000Z')
    expect(initial.status).toBe('degraded')
    const second = computeNextServiceState(initial, mkCheck(false), '2026-01-01T10:00:02.000Z')
    const third = computeNextServiceState(second, mkCheck(false), '2026-01-01T10:00:03.000Z')
    expect(third.status).toBe('down')
    const recovered = computeNextServiceState(third, mkCheck(true), '2026-01-01T10:00:04.000Z')
    expect(recovered.status).toBe('healthy')
    expect(recovered.consecutiveFailures).toBe(0)
  })

  it('opens/closes incident only on valid transitions', () => {
    const prev: ServiceState = {
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api',
      niche: 'corrida',
      status: 'degraded',
      consecutiveFailures: 2,
      lastLatencyMs: 1000,
      lastCheckAt: 'x',
      lastOkAt: null,
      lastError: 'err',
      updatedAt: 'x',
    }
    const down: ServiceState = { ...prev, status: 'down', consecutiveFailures: 3 }
    expect(shouldOpenIncident(prev, down)).toBe(true)
    expect(shouldCloseIncident(down, { ...down, status: 'healthy' }, true)).toBe(true)
  })

  it('creates incident payload on open', () => {
    const incident = buildIncidentOpen(
      {
        serviceKey: 'k',
        serviceName: 'n',
        kind: 'storefront-api',
        niche: 'corrida',
        status: 'down',
        consecutiveFailures: 3,
        lastLatencyMs: 1200,
        lastCheckAt: 'x',
        lastOkAt: null,
        lastError: 'timeout',
        updatedAt: 'x',
      },
      'timeout',
      '2026-01-01T10:00:00.000Z'
    )
    expect(incident.serviceKey).toBe('k')
    expect(incident.resolvedAt).toBeNull()
  })

  it('uses HTTP status in lastError when check fails without error string', () => {
    const check: CheckResultInput = {
      ...mkCheck(false),
      error: null,
      statusCode: 502,
    }
    const next = computeNextServiceState(null, check, '2026-01-01T10:00:00.000Z')
    expect(next.lastError).toBe('HTTP 502')
  })

  it('uses HTTP 0 when failing check has no error and no status code', () => {
    const check: CheckResultInput = {
      ...mkCheck(false),
      error: null,
      statusCode: null,
    }
    const next = computeNextServiceState(null, check, '2026-01-01T10:00:00.000Z')
    expect(next.lastError).toBe('HTTP 0')
  })

  it('preserves lastOkAt on consecutive failures', () => {
    const first = computeNextServiceState(null, mkCheck(true), '2026-01-01T10:00:00.000Z')
    const failed = computeNextServiceState(first, mkCheck(false), '2026-01-01T10:00:01.000Z')
    expect(failed.lastOkAt).toBe('2026-01-01T10:00:00.000Z')
  })

  it('opens incident when previous state is null and next is down', () => {
    const down: ServiceState = {
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api',
      niche: 'corrida',
      status: 'down',
      consecutiveFailures: 3,
      lastLatencyMs: 1,
      lastCheckAt: 'x',
      lastOkAt: null,
      lastError: 'e',
      updatedAt: 'x',
    }
    expect(shouldOpenIncident(null, down)).toBe(true)
  })

  it('does not close incident without open incident', () => {
    const prev: ServiceState = {
      serviceKey: 'k',
      serviceName: 'n',
      kind: 'storefront-api',
      niche: 'corrida',
      status: 'down',
      consecutiveFailures: 3,
      lastLatencyMs: 1,
      lastCheckAt: 'x',
      lastOkAt: null,
      lastError: 'e',
      updatedAt: 'x',
    }
    const healthy = { ...prev, status: 'healthy' as const, consecutiveFailures: 0 }
    expect(shouldCloseIncident(prev, healthy, false)).toBe(false)
    expect(shouldCloseIncident(null, healthy, true)).toBe(false)
  })
})
