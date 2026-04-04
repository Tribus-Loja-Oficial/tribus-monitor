interface LatencyIndicatorProps {
  latencyMs: number
}

export function LatencyIndicator({ latencyMs }: LatencyIndicatorProps) {
  const tone =
    latencyMs >= 3000 ? 'text-rose-700' : latencyMs >= 1200 ? 'text-amber-700' : 'text-emerald-700'
  return <span className={`text-xs font-medium ${tone}`}>{latencyMs}ms</span>
}
