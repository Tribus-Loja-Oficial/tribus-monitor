import { afterEach, describe, expect, it, vi } from 'vitest'
import { log } from './logger'

describe('log', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs info to console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log('info', 'hello', { x: 1 })
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = JSON.parse(spy.mock.calls[0]![0] as string)
    expect(arg.level).toBe('info')
    expect(arg.message).toBe('hello')
    expect(arg.x).toBe(1)
  })

  it('logs warn to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    log('warn', 'w')
    expect(spy).toHaveBeenCalled()
  })

  it('logs error to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log('error', 'e')
    expect(spy).toHaveBeenCalled()
  })
})
