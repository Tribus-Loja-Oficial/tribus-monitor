# Contexto canônico — Tribus Monitor

`tribus-monitor` é o sistema de observabilidade da plataforma Tribus.

## Papel na plataforma

- Monitorar disponibilidade de `tribus-storefront` e `tribus-ops`.
- Persistir histórico de checks.
- Calcular estado por serviço.
- Abrir/fechar incidentes automaticamente.

## Apps

- `apps/check-runner`: executa checks HTTP em cron.
- `apps/monitor-api`: ingest e APIs de consulta.
- `apps/dashboard`: visualização operacional.

## Shared core

- `packages/core`: tipos, schemas e regras puras.

## Regras críticas

- Sem lógica de negócio em rotas.
- Sem env fora de config.
- Não executar operações destrutivas.
