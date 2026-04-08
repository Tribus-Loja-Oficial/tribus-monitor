import { describe, expect, it } from 'vitest'
import { formatTimeAgo } from './time'

describe('formatTimeAgo', () => {
  it('formats seconds minutes hours and days', () => {
    const t0 = '2026-01-01T12:00:00.000Z'
    expect(formatTimeAgo(t0, Date.parse('2026-01-01T12:00:30.000Z'))).toMatch(/30s/)
    expect(formatTimeAgo(t0, Date.parse('2026-01-01T12:05:00.000Z'))).toMatch(/5 min/)
    expect(formatTimeAgo(t0, Date.parse('2026-01-01T14:00:00.000Z'))).toMatch(/2 h/)
    expect(formatTimeAgo(t0, Date.parse('2026-01-03T12:00:00.000Z'))).toMatch(/2 d/)
  })

  it('never returns negative elapsed', () => {
    expect(
      formatTimeAgo('2026-01-02T12:00:00.000Z', Date.parse('2026-01-01T12:00:00.000Z'))
    ).toMatch(/0s/)
  })
})
