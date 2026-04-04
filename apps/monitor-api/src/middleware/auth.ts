import { createMiddleware } from 'hono/factory'
import { fail } from '../utils/response'

export const checksAuth = createMiddleware(async (c, next) => {
  const token = c.get('env').MONITOR_CHECKS_TOKEN
  const auth = c.req.header('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) {
    return fail(c, 'UNAUTHORIZED', 'Missing Bearer token.', 401)
  }
  const candidate = auth.replace('Bearer ', '').trim()
  if (candidate !== token) {
    return fail(c, 'UNAUTHORIZED', 'Invalid token.', 401)
  }
  await next()
})
