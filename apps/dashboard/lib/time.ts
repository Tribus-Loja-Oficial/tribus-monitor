export function formatTimeAgo(isoDate: string, now = Date.now()): string {
  const diffMs = Math.max(0, now - Date.parse(isoDate))
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `ha ${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `ha ${min} min`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `ha ${hours} h`
  const days = Math.floor(hours / 24)
  return `ha ${days} d`
}
