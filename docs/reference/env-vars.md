# Referência — Variáveis de ambiente

## monitor-api

- `MONITOR_CHECKS_TOKEN` (obrigatória)
- local: `apps/monitor-api/.dev.vars`
- cloudflare workers: `wrangler secret put MONITOR_CHECKS_TOKEN`

### CI/CD (PROD)

- `CLOUDFLARE_API_TOKEN` (vars)
- `CLOUDFLARE_ACCOUNT_ID` (vars)
- `MONITOR_CHECKS_TOKEN` (vars)
- `MONITOR_D1_DATABASE_NAME` (vars, opcional; default `tribus_monitor_db`)

## check-runner

- `MONITOR_API_URL` (obrigatória)
- `MONITOR_CHECKS_TOKEN` (obrigatória)
- `TRIBUS_MONITOR_NICHES` (default: `corrida`)
- `TRIBUS_STOREFRONT_BASE_URL` (obrigatória)
- `TRIBUS_OPS_BASE_URL` (obrigatória)
- `TRIBUS_BE_BASE_URL` (obrigatória)
- local: `apps/check-runner/.env.local`
- github actions: `secrets` e `vars` no repositório

### CI/CD (PROD)

- `MONITOR_API_URL` (secrets)
- `MONITOR_CHECKS_TOKEN` (secrets)
- `TRIBUS_STOREFRONT_BASE_URL` (secrets)
- `TRIBUS_OPS_BASE_URL` (secrets)
- `TRIBUS_BE_BASE_URL` (secrets)
- `TRIBUS_MONITOR_NICHES` (vars)

## dashboard

- `MONITOR_API_URL` (obrigatória)
- local: `apps/dashboard/.env.local`
- vercel: Environment Variables do projeto

### CI/CD (PROD)

- `VERCEL_TOKEN` (vars)
- `VERCEL_ORG_ID` (vars)
- `VERCEL_PROJECT_ID_DASHBOARD` (vars)
