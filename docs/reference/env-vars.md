# Referência — Variáveis de ambiente

## monitor-api

- `MONITOR_CHECKS_TOKEN` (obrigatória)
- local: `apps/monitor-api/.dev.vars`
- cloudflare workers: `wrangler secret put MONITOR_CHECKS_TOKEN`

## check-runner

- `MONITOR_API_URL` (obrigatória)
- `MONITOR_CHECKS_TOKEN` (obrigatória)
- `TRIBUS_MONITOR_NICHES` (default: `corrida`)
- `TRIBUS_STOREFRONT_BASE_URL` (obrigatória)
- `TRIBUS_OPS_BASE_URL` (obrigatória)
- `TRIBUS_BE_BASE_URL` (obrigatória)
- local: `apps/check-runner/.env.local`
- github actions: `secrets` e `vars` no repositório

## dashboard

- `MONITOR_API_URL` (obrigatória)
- local: `apps/dashboard/.env.local`
- vercel: Environment Variables do projeto
