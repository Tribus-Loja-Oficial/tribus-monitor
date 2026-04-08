import { describe, expect, it } from 'vitest'
import { DEFAULT_REPOS, normalizeCoverageSnapshot } from './coverage'

describe('normalizeCoverageSnapshot', () => {
  it('returns defaults when rows are empty or not an array', () => {
    expect(normalizeCoverageSnapshot(undefined).repos).toEqual(DEFAULT_REPOS)
    expect(normalizeCoverageSnapshot(null).repos).toEqual(DEFAULT_REPOS)
    expect(normalizeCoverageSnapshot([]).repos).toEqual(DEFAULT_REPOS)
  })

  it('drops invalid repo entries', () => {
    const out = normalizeCoverageSnapshot([{ repoKey: 'nope' }, { key: 'tribus-monitor' }])
    expect(out.repos.find((r) => r.key === 'tribus-monitor')).toBeDefined()
  })

  it('drops non-object rows from array', () => {
    const out = normalizeCoverageSnapshot([
      null,
      undefined,
      1,
      'x',
      { key: 'tribus-ops', name: 'O' },
    ])
    expect(out.repos.find((r) => r.key === 'tribus-ops')?.name).toBe('O')
  })

  it('uses repoName when name is empty string', () => {
    const out = normalizeCoverageSnapshot([
      {
        key: 'tribus-ops',
        name: '',
        repoName: 'From repoName',
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      },
    ])
    expect(out.repos.find((r) => r.key === 'tribus-ops')?.name).toBe('From repoName')
  })

  it('merges known repos and keeps defaults for missing keys', () => {
    const out = normalizeCoverageSnapshot([
      {
        repoKey: 'tribus-storefront',
        repoName: 'SF',
        lines: 50.123,
        functions: 101,
        branches: -1,
        statements: NaN,
        updatedAt: '2026-01-01T00:00:00.000Z',
        runUrl: 'https://ci.example/run',
      },
    ])
    const sf = out.repos.find((r) => r.key === 'tribus-storefront')
    expect(sf?.name).toBe('SF')
    expect(sf?.lines).toBe(50.12)
    expect(sf?.functions).toBeNull()
    expect(sf?.branches).toBeNull()
    expect(sf?.statements).toBeNull()
    expect(sf?.sourceUrl).toBe('https://ci.example/run')
    expect(out.repos.find((r) => r.key === 'tribus-ops')?.lines).toBeNull()
  })

  it('accepts legacy name field and coerces key from repoKey', () => {
    const out = normalizeCoverageSnapshot([
      {
        key: 'real-state',
        name: 'Landing',
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        updatedAt: 'x',
      },
    ])
    const rs = out.repos.find((r) => r.key === 'real-state')
    expect(rs?.name).toBe('Landing')
  })
})
