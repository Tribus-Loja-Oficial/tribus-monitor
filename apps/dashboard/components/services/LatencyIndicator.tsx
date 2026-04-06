interface LatencyIndicatorProps {
  latencyMs: number
}

export function LatencyIndicator({ latencyMs }: LatencyIndicatorProps) {
  const tone =
    latencyMs > 1500 ? 'text-rose-700' : latencyMs >= 500 ? 'text-amber-700' : 'text-emerald-700'
  return <span className={`text-lg font-semibold tabular-nums ${tone}`}>{latencyMs}ms</span>
}
