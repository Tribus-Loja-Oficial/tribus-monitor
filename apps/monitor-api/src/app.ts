import { Hono } from 'hono'
import { checkIngestSchema, type ServiceState } from '@tribus-monitor/core'
import { z } from 'zod'
import { getEnv } from './config/env'
import { checksAuth, coverageAuth, e2eAuth } from './middleware/auth'
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
    const result = await ingestChecks(
      c.get('repositories'),
      parsed.checks,
      new Date().toISOString()
    )
    return ok(c, result, 201)
  })

  const coverageIngestSchema = z.object({
    repoKey: z.enum(['tribus-storefront', 'tribus-ops', 'tribus-monitor', 'real-state']),
    repoName: z.string().min(1),
    lines: z.number().min(0).max(100),
    functions: z.number().min(0).max(100),
    branches: z.number().min(0).max(100),
    statements: z.number().min(0).max(100),
    commitSha: z.string().min(1).nullable().optional(),
    runUrl: z.string().url().nullable().optional(),
    updatedAt: z.string().datetime().optional(),
  })

  app.post('/coverage', coverageAuth, async (c) => {
    const body = await c.req.json()
    const parsed = coverageIngestSchema.parse(body)
    const snapshot = {
      ...parsed,
      commitSha: parsed.commitSha ?? null,
      runUrl: parsed.runUrl ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    }
    await c.get('repositories').coverage.upsert(snapshot)
    return ok(c, { saved: true }, 201)
  })

  app.get('/coverage', async (c) => {
    const rows = await c.get('repositories').coverage.list()
    return ok(c, { repos: rows })
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
    const limit = z.coerce
      .number()
      .int()
      .positive()
      .max(1000)
      .optional()
      .parse(c.req.query('limit'))
    const serviceKey = z.string().optional().parse(c.req.query('serviceKey'))
    const rows = await c.get('repositories').checkResults.list(limit)
    const filtered = serviceKey ? rows.filter((row) => row.serviceKey === serviceKey) : rows
    return ok(c, { checks: filtered })
  })

  // ---------- E2E Results ----------

  const e2ePayloadSchema = z.object({
    source: z.string().min(1),
    runner: z.string().min(1),
    checkType: z.literal('functional_e2e'),
    emittedAt: z.string().datetime(),
    results: z.array(
      z.object({
        suiteId: z.string(),
        scenarioId: z.string(),
        scenarioName: z.string(),
        niche: z.string(),
        environment: z.string(),
        status: z.enum(['passed', 'failed', 'skipped', 'timedout']),
        criticality: z.string(),
        failureType: z.string().optional(),
        durationMs: z.number(),
        startedAt: z.string(),
        finishedAt: z.string(),
      })
    ),
  })

  app.post('/e2e-results', e2eAuth, async (c) => {
    const body = await c.req.json()
    const payload = e2ePayloadSchema.parse(body)

    const runId = crypto.randomUUID()
    const now = new Date().toISOString()
    const total = payload.results.length
    const passed = payload.results.filter((r) => r.status === 'passed').length
    const failed = payload.results.filter(
      (r) => r.status === 'failed' || r.status === 'timedout'
    ).length
    const skipped = payload.results.filter((r) => r.status === 'skipped').length
    const passRate = total > 0 ? Math.round((passed / total) * 10000) / 100 : 0

    // Deduce environment from results (all results share same environment)
    const environment = payload.results[0]?.environment ?? 'unknown'

    const run = {
      id: runId,
      source: payload.source,
      runner: payload.runner,
      environment,
      emittedAt: payload.emittedAt,
      total,
      passed,
      failed,
      skipped,
      passRate,
      createdAt: now,
    }

    const scenarioResults = payload.results.map((r, i) => ({
      id: `${runId}-${i}`,
      runId,
      suiteId: r.suiteId,
      scenarioId: r.scenarioId,
      scenarioName: r.scenarioName,
      niche: r.niche,
      environment: r.environment,
      status: r.status,
      criticality: r.criticality,
      failureType: r.failureType ?? null,
      durationMs: r.durationMs,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
    }))

    await c.get('repositories').e2e.insertRun(run, scenarioResults)
    return ok(c, { runId, saved: true }, 201)
  })

  app.get('/e2e-results', async (c) => {
    const limit = z.coerce.number().int().positive().max(100).optional().parse(c.req.query('limit'))
    const runs = await c.get('repositories').e2e.listRuns(limit)
    // Attach scenario results to the latest run for dashboard detail
    const latest = runs[0]
    const results = latest ? await c.get('repositories').e2e.listResultsByRun(latest.id) : []
    return ok(c, { runs, latestResults: results })
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
