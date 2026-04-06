import { z } from 'zod'
import type { MonitorEnv } from '../types'

const envSchema = z.object({
  MONITOR_CHECKS_TOKEN: z.string().min(1),
  MONITOR_COVERAGE_TOKEN: z.string().min(1),
})

export function getEnv(bindings?: MonitorEnv) {
  const checksToken = bindings?.MONITOR_CHECKS_TOKEN ?? process.env.MONITOR_CHECKS_TOKEN
  const source = {
    MONITOR_CHECKS_TOKEN: checksToken,
    MONITOR_COVERAGE_TOKEN:
      bindings?.MONITOR_COVERAGE_TOKEN ?? process.env.MONITOR_COVERAGE_TOKEN ?? checksToken,
  }
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid monitor-api environment: ${details}`)
  }
  return parsed.data
}
