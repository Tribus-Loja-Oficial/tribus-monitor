import { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export function ok(c: Context, data: unknown, status: ContentfulStatusCode = 200) {
  const normalizedData = typeof data === 'object' && data !== null ? data : { data }
  return c.json({ success: true, ...normalizedData }, status)
}

export function fail(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400
) {
  return c.json(
    {
      success: false,
      error: { code, message },
    },
    status
  )
}
