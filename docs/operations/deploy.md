# Operações — Deploy

## Estratégia de CI/CD (alinhada ao padrão Tribus)

- CI separado por camada:
  - `Build & quality checks — Dashboard`
  - `Build & quality checks — Monitor API`
  - `Build & quality checks — Check Runner`
- Deploy separado por camada, acionado após CI verde na `main`:
  - `Deploy production — Dashboard (Vercel)`
  - `Deploy production — Monitor API (Cloudflare Workers)`
  - `Deploy/Run production — Check Runner`

## Dashboard (Vercel)

- Build: `npm run build -w @tribus-monitor/dashboard`
- Deploy: workflow `deploy-dashboard-production.yml`.

## Monitor API (Cloudflare Workers)

- Build: `npm run build -w @tribus-monitor/monitor-api`
- Deploy: workflow `deploy-monitor-api-production.yml` (Wrangler).
- Antes do deploy, o workflow:
  - sincroniza o secret `MONITOR_CHECKS_TOKEN` no Worker;
  - aplica migrations D1 remotas (`wrangler d1 migrations apply`).

## Check Runner (GitHub Actions)

- Execução contínua: workflow `runner-cron.yml`.
- Executa em cron, manual (`workflow_dispatch`) e após CI do runner na `main`.
- Consome apenas `vars` no environment `PROD` (sem `secrets`).
