# Operações — Deploy

## Dashboard (Vercel)

- Build: `npm run build -w @tribus-monitor/dashboard`
- Deploy em projeto Vercel dedicado.

## Monitor API (Cloudflare Workers)

- Build: `npm run build -w @tribus-monitor/monitor-api`
- Deploy: `wrangler deploy` em `apps/monitor-api`.

## Check Runner (GitHub Actions)

- Deploy é o próprio workflow `runner-cron.yml`.
- Executa em cron e também manual (`workflow_dispatch`).
