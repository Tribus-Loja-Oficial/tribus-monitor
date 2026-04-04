import { createApp } from './app'
import type { MonitorEnv } from './types'

export default {
  fetch(request: Request, env: MonitorEnv) {
    return createApp(env).fetch(request)
  },
}
