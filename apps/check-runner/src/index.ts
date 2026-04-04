import { getEnv } from './config/env'
import { runHttpCheck } from './services/http-check'
import { sendChecksToMonitorApi } from './services/monitor-api'
import { buildTargets } from './services/targets'

async function main() {
  const env = getEnv()
  const targets = buildTargets({
    storefrontBaseUrl: env.TRIBUS_STOREFRONT_BASE_URL,
    opsBaseUrl: env.TRIBUS_OPS_BASE_URL,
    beBaseUrl: env.TRIBUS_BE_BASE_URL,
    niches: env.niches,
  })

  const checks = await Promise.all(targets.map((target) => runHttpCheck(target)))
  await sendChecksToMonitorApi({
    monitorApiUrl: env.MONITOR_API_URL,
    token: env.MONITOR_CHECKS_TOKEN,
    checks,
  })

  console.log(JSON.stringify({ event: 'runner_completed', checks: checks.length }))
}

void main()
