# Arquitetura — Folder Structure

```text
tribus-monitor/
  apps/
    dashboard/
    monitor-api/
    check-runner/
  packages/
    core/
  docs/
```

- `apps/dashboard`: UI de observabilidade.
- `apps/monitor-api`: ingest, estado, incidentes, APIs.
- `apps/check-runner`: execução de checks periódicos.
- `packages/core`: tipos, schemas e regras compartilhadas.
