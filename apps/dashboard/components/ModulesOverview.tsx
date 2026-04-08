export function ModulesOverview() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <article className="rounded-xl border border-cyan-200 bg-cyan-50/90 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Ativo</p>
        <h3 className="mt-1 text-sm font-semibold text-cyan-900">Serviços</h3>
        <p className="mt-1 text-sm text-cyan-800">
          Monitoramento de uptime, APIs e status operacional.
        </p>
      </article>
      <article className="rounded-xl border border-cyan-200 bg-cyan-50/90 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Ativo</p>
        <h3 className="mt-1 text-sm font-semibold text-cyan-900">Cobertura de testes</h3>
        <p className="mt-1 text-sm text-cyan-800">
          Visão consolidada de lines, functions, branches e statements.
        </p>
      </article>
      <article className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Em breve</p>
        <h3 className="mt-1 text-sm font-semibold text-slate-900">Validações de negócio</h3>
        <p className="mt-1 text-sm text-slate-600">
          Regras operacionais e indicadores chave da Tribus.
        </p>
      </article>
    </section>
  )
}
