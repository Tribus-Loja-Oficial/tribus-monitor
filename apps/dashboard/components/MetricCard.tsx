interface MetricCardProps {
  label: string
  value: number
  tone?: 'default' | 'danger'
}

export function MetricCard({ label, value, tone = 'default' }: MetricCardProps) {
  const valueColor = tone === 'danger' ? 'text-rose-600' : 'text-slate-900'
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</h2>
      <p className={`mt-3 text-4xl font-semibold ${valueColor}`}>{value}</p>
    </article>
  )
}
