import type { CheckResultInput, ServiceKind } from '@tribus-monitor/core'

export interface CheckTarget {
  serviceKey: string
  serviceName: string
  kind: ServiceKind
  niche: string
  url: string
  checkType?: 'http' | 'catalog-products'
}

export async function runHttpCheck(target: CheckTarget, timeoutMs = 15000): Promise<CheckResultInput> {
  const started = Date.now()
  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
    let ok = response.ok
    let error: string | null = response.ok ? null : `HTTP ${response.status}`

    if (response.ok && target.checkType === 'catalog-products') {
      const payload = (await response.json()) as unknown
      if (!Array.isArray(payload) || payload.length === 0) {
        ok = false
        error = 'No products returned from BE catalog endpoint.'
      } else {
        const first = payload[0] as Record<string, unknown>
        const hasMinimumFields =
          typeof first.id === 'number' &&
          typeof first.name === 'string' &&
          typeof first.permalink === 'string'
        if (!hasMinimumFields) {
          ok = false
          error = 'Product payload missing required fields (id/name/permalink).'
        }
      }
    }

    return {
      serviceKey: target.serviceKey,
      serviceName: target.serviceName,
      kind: target.kind,
      niche: target.niche,
      url: target.url,
      statusCode: response.status,
      latencyMs: Date.now() - started,
      ok,
      error,
      checkedAt: new Date().toISOString(),
      source: 'check-runner',
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return {
      serviceKey: target.serviceKey,
      serviceName: target.serviceName,
      kind: target.kind,
      niche: target.niche,
      url: target.url,
      statusCode: null,
      latencyMs: Date.now() - started,
      ok: false,
      error: reason,
      checkedAt: new Date().toISOString(),
      source: 'check-runner',
    }
  }
}
