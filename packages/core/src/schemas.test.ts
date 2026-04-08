import { describe, expect, it } from 'vitest'
import { checkIngestSchema, checkResultInputSchema } from './schemas.js'

describe('schemas', () => {
  it('accepts a valid check ingest payload', () => {
    const body = {
      checks: [
        {
          serviceKey: 'k',
          serviceName: 'n',
          kind: 'storefront-api',
          niche: 'corrida',
          url: 'https://example.com/h',
          statusCode: 200,
          latencyMs: 10,
          ok: true,
          error: null,
          checkedAt: '2026-01-01T10:00:00.000Z',
          source: 'check-runner',
        },
      ],
    }
    expect(() => checkIngestSchema.parse(body)).not.toThrow()
  })

  it('rejects empty checks array', () => {
    expect(() => checkIngestSchema.parse({ checks: [] })).toThrow()
  })

  it('rejects invalid URL on a check', () => {
    expect(() =>
      checkResultInputSchema.parse({
        serviceKey: 'k',
        serviceName: 'n',
        kind: 'storefront-api',
        niche: 'corrida',
        url: 'not-a-url',
        statusCode: null,
        latencyMs: 0,
        ok: false,
        error: 'x',
        checkedAt: '2026-01-01T10:00:00.000Z',
        source: 'check-runner',
      })
    ).toThrow()
  })
})
