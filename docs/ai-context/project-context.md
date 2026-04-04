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

## Cobertura de monitoramento atual

- `storefront`: página pública + health endpoints.
- `tribus-ops`: health por nicho.
- `be.tribusloja.com.br`: validação de catálogo (retorno de produtos com campos essenciais).

## CI/CD

- CI por camada (dashboard, monitor-api, check-runner), com gates de typecheck/lint/test/build.
- Deploy por camada:
  - dashboard em Vercel;
  - monitor-api em Cloudflare Workers;
  - check-runner em GitHub Actions (cron + run após CI verde na main).

## Shared core

- `packages/core`: tipos, schemas e regras puras.

## Regras críticas

- Sem lógica de negócio em rotas.
- Sem env fora de config.
- Não executar operações destrutivas.
