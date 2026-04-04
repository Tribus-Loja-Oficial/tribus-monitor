interface Props {
  status: 'healthy' | 'degraded' | 'down'
}

export function StatusBadge({ status }: Props) {
  const styles =
    status === 'healthy'
      ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
      : status === 'degraded'
        ? 'border-amber-200 bg-amber-100 text-amber-800'
        : 'border-rose-200 bg-rose-100 text-rose-800'

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>
      {status}
    </span>
  )
}
