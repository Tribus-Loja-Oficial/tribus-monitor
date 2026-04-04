interface SparklineBarsProps {
  values: number[]
}

export function SparklineBars({ values }: SparklineBarsProps) {
  if (values.length === 0) return <p className="text-[11px] text-slate-400">Sem historico recente.</p>
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((value, idx) => {
        const height = Math.max(4, Math.round((value / max) * 36))
        return (
          <div
            key={`${idx}-${value}`}
            className="w-2 rounded-t bg-cyan-400/80"
            style={{ height }}
            title={`${value}ms`}
          />
        )
      })}
    </div>
  )
}
