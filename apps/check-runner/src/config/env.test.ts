import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEnv } from './env'

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('parses env and splits niches', () => {
    vi.stubEnv('MONITOR_API_URL', 'https://monitor.example/api')
    vi.stubEnv('MONITOR_CHECKS_TOKEN', 'tok')
    vi.stubEnv('TRIBUS_MONITOR_NICHES', 'corrida, Moda ')
    vi.stubEnv('TRIBUS_STOREFRONT_BASE_URL', 'https://sf.example')
    vi.stubEnv('TRIBUS_OPS_BASE_URL', 'https://ops.example')
    vi.stubEnv('TRIBUS_BE_BASE_URL', 'https://be.example')
    vi.stubEnv('TRIBUS_CDS_BASE_URL', 'https://cds.example')
    vi.stubEnv('TRIBUS_HUB_API_BASE_URL', 'https://hub-api.example')
    vi.stubEnv('TRIBUS_HUB_WEB_BASE_URL', 'https://hub.example')
    const env = getEnv()
    expect(env.niches).toEqual(['corrida', 'moda'])
  })
})
