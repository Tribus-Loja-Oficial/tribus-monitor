import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEnv } from './env'

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads process.env when bindings are omitted', () => {
    vi.stubEnv('MONITOR_CHECKS_TOKEN', 'from-process')
    vi.stubEnv('MONITOR_COVERAGE_TOKEN', 'cov-process')
    const env = getEnv()
    expect(env.MONITOR_CHECKS_TOKEN).toBe('from-process')
    expect(env.MONITOR_COVERAGE_TOKEN).toBe('cov-process')
  })

  it('parses bindings when provided', () => {
    const env = getEnv({
      MONITOR_CHECKS_TOKEN: 'a',
      MONITOR_COVERAGE_TOKEN: 'b',
    })
    expect(env.MONITOR_CHECKS_TOKEN).toBe('a')
    expect(env.MONITOR_COVERAGE_TOKEN).toBe('b')
  })

  it('falls back coverage token to checks token when coverage missing', () => {
    // GHA sets MONITOR_COVERAGE_TOKEN on the job; must not leak into this case
    const prevCoverage = process.env.MONITOR_COVERAGE_TOKEN
    delete process.env.MONITOR_COVERAGE_TOKEN
    try {
      const env = getEnv({ MONITOR_CHECKS_TOKEN: 'only' })
      expect(env.MONITOR_COVERAGE_TOKEN).toBe('only')
    } finally {
      if (prevCoverage === undefined) delete process.env.MONITOR_COVERAGE_TOKEN
      else process.env.MONITOR_COVERAGE_TOKEN = prevCoverage
    }
  })

  it('throws on invalid env', () => {
    expect(() => getEnv({ MONITOR_CHECKS_TOKEN: '' })).toThrow(/Invalid monitor-api environment/)
  })
})
