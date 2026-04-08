import { createMiddleware } from 'hono/factory'
import { ZodError } from 'zod'
import { fail } from '../utils/response'
import { log } from '../utils/logger'

function getZodIssues(error: unknown): { message: string }[] | null {
  if (error instanceof ZodError) return error.issues
  if (
    error &&
    typeof error === 'object' &&
    'issues' in error &&
    'name' in error &&
    (error as { name: string }).name === 'ZodError'
  ) {
    const issues = (error as { issues: unknown }).issues
    if (Array.isArray(issues)) return issues as { message: string }[]
  }
  return null
}

function handleError(c: Parameters<typeof fail>[0], error: unknown) {
  const zodIssues = getZodIssues(error)
  if (zodIssues) {
    return fail(c, 'VALIDATION_ERROR', zodIssues[0]?.message ?? 'Invalid request.', 400)
  }
  const message = error instanceof Error ? error.message : String(error)
  log('error', message, { path: c.req.path })
  return fail(c, 'INTERNAL_ERROR', 'Unexpected server error.', 500)
}

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    return handleError(c, error)
  }
  if (c.error) {
    const response = handleError(c, c.error)
    c.res = response
    return response
  }
})
