import { z } from 'zod'

export const sourceSchema = z.enum(['check-runner', 'future'])
export const serviceKindSchema = z.enum(['storefront-page', 'storefront-api', 'ops-api', 'be-api'])
export const serviceStatusSchema = z.enum(['healthy', 'degraded', 'down'])

export const checkResultInputSchema = z.object({
  serviceKey: z.string().min(1),
  serviceName: z.string().min(1),
  kind: serviceKindSchema,
  niche: z.string().min(1),
  url: z.string().url(),
  statusCode: z.number().int().nullable(),
  latencyMs: z.number().nonnegative(),
  ok: z.boolean(),
  error: z.string().nullable(),
  checkedAt: z.string().datetime(),
  source: sourceSchema,
})

export const checkIngestSchema = z.object({
  checks: z.array(checkResultInputSchema).min(1),
})
