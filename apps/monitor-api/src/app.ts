import { Hono } from 'hono'
import { checkIngestSchema, type ServiceState } from '@tribus-monitor/core'
import { z } from 'zod'
import { getEnv } from './config/env'
import { checksAuth } from './middleware/auth'
import { errorHandler } from './middleware/error-handler'
import { ingestChecks } from './services/ingest.service'
import { createRepositories } from './storage'
import type { MonitorEnv, StorageRepositories } from './types'
import { fail, ok } from './utils/response'

type AppVariables = {
  env: ReturnType<typeof getEnv>
  repositories: StorageRepositories
}

function getStatusPriority(status: ServiceState['status']) {
  if (status === 'down') return 0
  if (status === 'degraded') return 1
  return 2
}

export function createApp(bindings?: MonitorEnv) {
  const env = getEnv(bindings)
  const repositories = createRepositories(bindings)

  const app = new Hono<{ Variables: AppVariables }>()
  app.use('*', async (c, next) => {
    c.set('env', env)
    c.set('repositories', repositories)
    await next()
  })
  app.use('*', errorHandler)

  app.get('/health', (c) =>
    ok(c, {
      ok: true,
      service: 'tribus-monitor-api',
      timestamp: new Date().toISOString(),
    })
  )

  app.post('/checks', checksAuth, async (c) => {
    const body = await c.req.json()
    const parsed = checkIngestSchema.parse(body)
    const result = await ingestChecks(c.get('repositories'), parsed.checks, new Date().toISOString())
    return ok(c, result, 201)
  })

  app.get('/status', async (c) => {
    const rows = await c.get('repositories').serviceStates.list()
    const ordered = [...rows].sort((a, b) => {
      const p = getStatusPriority(a.status) - getStatusPriority(b.status)
      if (p !== 0) return p
      return a.serviceKey.localeCompare(b.serviceKey)
    })
    return ok(c, { services: ordered })
  })

  app.get('/status/:serviceKey', async (c) => {
    const row = await c.get('repositories').serviceStates.get(c.req.param('serviceKey'))
    if (!row) return fail(c, 'NOT_FOUND', 'Service state not found.', 404)
    return ok(c, { service: row })
  })

  app.get('/incidents', async (c) => {
    const limit = z.coerce.number().int().positive().max(500).optional().parse(c.req.query('limit'))
    const rows = await c.get('repositories').incidents.list(limit)
    return ok(c, { incidents: rows })
  })

  app.get('/history', async (c) => {
    const limit = z.coerce.number().int().positive().max(1000).optional().parse(c.req.query('limit'))
    const serviceKey = z.string().optional().parse(c.req.query('serviceKey'))
    const rows = await c.get('repositories').checkResults.list(limit)
    const filtered = serviceKey ? rows.filter((row) => row.serviceKey === serviceKey) : rows
    return ok(c, { checks: filtered })
  })

  app.get('/services', async (c) => {
    const rows = await c.get('repositories').serviceStates.list()
    return ok(c, {
      services: rows.map((row) => ({
        serviceKey: row.serviceKey,
        serviceName: row.serviceName,
        niche: row.niche,
        kind: row.kind,
      })),
    })
  })

  return app
}
