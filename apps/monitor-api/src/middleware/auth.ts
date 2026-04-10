import { createMiddleware } from 'hono/factory'
import { fail } from '../utils/response'

function createBearerAuth(
  tokenName: 'MONITOR_CHECKS_TOKEN' | 'MONITOR_COVERAGE_TOKEN' | 'MONITOR_E2E_TOKEN'
) {
  return createMiddleware(async (c, next) => {
    const token = c.get('env')[tokenName]
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
}

export const checksAuth = createBearerAuth('MONITOR_CHECKS_TOKEN')
export const coverageAuth = createBearerAuth('MONITOR_COVERAGE_TOKEN')
export const e2eAuth = createBearerAuth('MONITOR_E2E_TOKEN')
