import { z } from 'zod'

const envSchema = z.object({
  MONITOR_API_URL: z.string().url(),
  MONITOR_CHECKS_TOKEN: z.string().min(1),
  TRIBUS_MONITOR_NICHES: z.string().default('corrida'),
  TRIBUS_STOREFRONT_BASE_URL: z.string().url(),
  TRIBUS_OPS_BASE_URL: z.string().url(),
  TRIBUS_BE_BASE_URL: z.string().url(),
  TRIBUS_CDS_BASE_URL: z.string().url(),
  TRIBUS_HUB_API_BASE_URL: z.string().url(),
  TRIBUS_HUB_WEB_BASE_URL: z.string().url(),
})

export function getEnv() {
  const parsed = envSchema.parse(process.env)
  return {
    ...parsed,
    niches: parsed.TRIBUS_MONITOR_NICHES.split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  }
}
