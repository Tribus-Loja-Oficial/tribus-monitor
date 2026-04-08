import { describe, expect, it } from 'vitest'
import worker from './index'

const env = {
  MONITOR_CHECKS_TOKEN: 't',
  MONITOR_COVERAGE_TOKEN: 'c',
}

describe('worker default export', () => {
  it('delegates fetch to createApp', async () => {
    const res = await worker.fetch(new Request('http://test/health'), env)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.service).toBe('tribus-monitor-api')
  })
})
