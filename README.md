# Tribus Monitor

Sistema de observabilidade da plataforma Tribus: health checks, histórico, incidentes e dashboard.

## Monorepo

```text
tribus-monitor/
  apps/
    dashboard/       # Next.js App Router (visualização)
    monitor-api/     # Cloudflare Workers + Hono
    check-runner/    # Executor de checks (GitHub Actions cron)
  packages/
    core/            # Tipos, schemas e regras puras
```

## Stack

- Dashboard: Next.js + React + Tailwind
- API: Hono + Workers + Zod
- Runner: Node.js + fetch
- Shared core: TypeScript + Zod

## Setup

```bash
npm install
npm run typecheck
npm run lint
npm run test
```

## Arquivos locais de ambiente

- `apps/monitor-api/.dev.vars` (Wrangler local)
- `apps/dashboard/.env.local` (Next local)
- `apps/check-runner/.env.local` (runner local)

Runner local com env file:

```bash
npm run build -w @tribus-monitor/check-runner
npm run start:local -w @tribus-monitor/check-runner
```

## Deploy

- `apps/dashboard`: Vercel
- `apps/monitor-api`: Cloudflare Workers (Wrangler)
- `apps/check-runner`: GitHub Actions (`runner-cron.yml`)

## Variáveis principais

- `MONITOR_API_URL`
- `MONITOR_CHECKS_TOKEN`
- `MONITOR_COVERAGE_TOKEN` (opcional; ingest de cobertura dos CIs)
- `TRIBUS_MONITOR_NICHES` (ex.: `corrida,forro`)
- `TRIBUS_STOREFRONT_BASE_URL`
- `TRIBUS_OPS_BASE_URL`
- `TRIBUS_BE_BASE_URL`

Documentação completa em `docs/`.
