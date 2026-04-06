interface MetricCardProps {
  label: string
  value: number
  icon?: string
  tone?: 'default' | 'danger'
}

export function MetricCard({ label, value, icon = '🧩', tone = 'default' }: MetricCardProps) {
  const valueColor = tone === 'danger' ? 'text-rose-600' : 'text-slate-900'
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm">{icon}</p>
      <p className={`mt-1 text-4xl font-semibold leading-none ${valueColor}`}>{value}</p>
      <h2 className="mt-2 text-xs font-medium text-slate-600">{label}</h2>
    </article>
  )
}
