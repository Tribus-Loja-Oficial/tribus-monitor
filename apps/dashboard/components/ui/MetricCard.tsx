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
  const valueColor = tone === 'danger' ? 'text-rose-600' : 'text-slate-900'
  return (
    <article
      className={`rounded-xl border bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? 'scale-[1.02] border-cyan-300 shadow-md shadow-cyan-100' : 'border-slate-200/80'
      }`}
    >
      <p className="text-sm">{icon}</p>
      <p className={`mt-1 text-4xl font-semibold leading-none ${valueColor}`}>{value}</p>
      <h2 className="mt-2 text-xs font-medium text-slate-600">{label}</h2>
    </article>
  )
}
