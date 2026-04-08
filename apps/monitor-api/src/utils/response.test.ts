import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import { fail, ok } from './response'

describe('response helpers', () => {
  it('ok merges object payload', async () => {
    const app = new Hono()
    app.get('/x', (c) => ok(c, { a: 1 }))
    const res = await app.request('/x')
    const body = await res.json()
    expect(body).toEqual({ success: true, a: 1 })
  })

  it('ok wraps primitive payload', async () => {
    const app = new Hono()
    app.get('/x', (c) => ok(c, 'plain'))
    const res = await app.request('/x')
    const body = await res.json()
    expect(body).toEqual({ success: true, data: 'plain' })
  })

  it('ok wraps null as data', async () => {
    const app = new Hono()
    app.get('/x', (c) => ok(c, null))
    const res = await app.request('/x')
    const body = await res.json()
    expect(body).toEqual({ success: true, data: null })
  })

  it('fail returns error envelope', async () => {
    const app = new Hono()
    app.get('/x', (c) => fail(c, 'E', 'msg', 418))
    const res = await app.request('/x')
    expect(res.status).toBe(418)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toEqual({ code: 'E', message: 'msg' })
  })
})
