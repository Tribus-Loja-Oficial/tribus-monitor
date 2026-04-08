import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import { ZodError } from 'zod'
import { errorHandler } from './error-handler'

describe('errorHandler', () => {
  it('maps ZodError to 400', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/z', () => {
      throw new ZodError([{ code: 'custom', message: 'bad', path: ['x'] }])
    })
    const res = await app.request('/z')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('maps Error to 500', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/e', () => {
      throw new Error('boom')
    })
    const res = await app.request('/e')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('uses default message when ZodError has no issues', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/empty', () => {
      const err = new ZodError([])
      throw err
    })
    const res = await app.request('/empty')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.message).toBe('Invalid request.')
  })

  it('maps non-Error throw to 500', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/s', () => {
      throw 'string-throw'
    })
    const res = await app.request('/s')
    expect(res.status).toBe(500)
  })

  it('maps duck-typed Zod-like error (name + issues) to 400', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/duck', () => {
      throw { name: 'ZodError', issues: [{ message: 'duck bad', path: ['x'] }] }
    })
    const res = await app.request('/duck')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.message).toBe('duck bad')
  })

  it('does not treat objects with issues but wrong name as validation errors', async () => {
    const app = new Hono()
    app.use('*', errorHandler)
    app.get('/fake', () => {
      throw { name: 'OtherError', issues: [{ message: 'not zod' }] }
    })
    const res = await app.request('/fake')
    expect(res.status).toBe(500)
  })
})
