# Fluxo — Check Runner

1. GitHub Actions (cron) executa `apps/check-runner`.
2. Runner monta alvos por nicho (storefront pages/apis + ops api).
3. Executa HTTP checks e mede:
   - status code
   - latência
   - erro
4. Envia payload para `POST /checks` da monitor-api com Bearer token.
