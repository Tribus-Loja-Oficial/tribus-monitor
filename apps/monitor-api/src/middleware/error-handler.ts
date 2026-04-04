import { createMiddleware } from 'hono/factory'
import { ZodError } from 'zod'
import { fail } from '../utils/response'
import { log } from '../utils/logger'

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(c, 'VALIDATION_ERROR', error.issues[0]?.message ?? 'Invalid request.', 400)
    }
    const message = error instanceof Error ? error.message : String(error)
    log('error', 'Unhandled monitor-api error', { message, path: c.req.path })
    return fail(c, 'INTERNAL_ERROR', 'Unexpected server error.', 500)
  }
})
