import { getEnv } from './config/env'
import { runHttpCheck } from './services/http-check'
import { sendChecksToMonitorApi } from './services/monitor-api'
import { buildTargets } from './services/targets'

export async function runCheckCycle(
  logFn: (msg: string) => void = (m) => console.log(m)
): Promise<{ checks: number }> {
  const env = getEnv()
  const targets = buildTargets({
    storefrontBaseUrl: env.TRIBUS_STOREFRONT_BASE_URL,
    opsBaseUrl: env.TRIBUS_OPS_BASE_URL,
    beBaseUrl: env.TRIBUS_BE_BASE_URL,
    cdsBaseUrl: env.TRIBUS_CDS_BASE_URL,
    hubApiBaseUrl: env.TRIBUS_HUB_API_BASE_URL,
    hubWebBaseUrl: env.TRIBUS_HUB_WEB_BASE_URL,
    niches: env.niches,
  })

  const checks = await Promise.all(targets.map((target) => runHttpCheck(target)))
  await sendChecksToMonitorApi({
    monitorApiUrl: env.MONITOR_API_URL,
    token: env.MONITOR_CHECKS_TOKEN,
    checks,
  })

  logFn(JSON.stringify({ event: 'runner_completed', checks: checks.length }))
  return { checks: checks.length }
}
