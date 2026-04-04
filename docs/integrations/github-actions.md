# Integração — GitHub Actions

Workflows principais:

- `ci-dashboard.yml`
- `ci-monitor-api.yml`
- `runner-cron.yml`

`runner-cron.yml` executa o `check-runner` em agendamento e envia resultados para `monitor-api`.
