interface Props {
  status: 'healthy' | 'degraded' | 'down'
}

export function StatusBadge({ status }: Props) {
  const className =
    status === 'healthy'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : status === 'degraded'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-rose-100 text-rose-700 border-rose-200'
  return (
    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${className}`}>
      {status}
    </span>
  )
}
