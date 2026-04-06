interface MetricCardProps {
  label: string
  value: number
  icon?: string
  tone?: 'default' | 'danger'
  active?: boolean
}

export function MetricCard({
  label,
  value,
  icon = '🧩',
  tone = 'default',
  active = false,
}: MetricCardProps) {
  const valueColor = tone === 'danger' ? 'text-rose-700' : 'text-slate-900'
  const labelColor = active ? 'text-slate-700' : 'text-slate-500'
  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        active
          ? 'border-blue-300/70 bg-gradient-to-br from-blue-50/70 via-slate-50 to-white ring-1 ring-blue-200/60 shadow-[0_6px_14px_rgba(30,64,175,0.08)]'
          : 'border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
      </div>
      <p className={`mt-2 text-4xl font-semibold leading-none ${valueColor}`}>{value}</p>
      <h2 className={`mt-3 text-xs font-medium uppercase tracking-wide ${labelColor}`}>{label}</h2>
    </article>
  )
}
