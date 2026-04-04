type Level = 'info' | 'warn' | 'error'

export function log(level: Level, message: string, context?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ?? {}),
  }
  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }
  if (level === 'warn') {
    console.warn(JSON.stringify(payload))
    return
  }
  console.log(JSON.stringify(payload))
}
