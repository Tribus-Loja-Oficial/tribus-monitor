# Operações — Troubleshooting

## `POST /checks` retorna 401

- Verificar `MONITOR_CHECKS_TOKEN` no runner e na monitor-api.

## Sem dados no dashboard

- Conferir `MONITOR_API_URL`.
- Validar se `runner-cron` está executando e sem erro.

## Muitos serviços em `down`

- Checar conectividade externa (storefront/ops).
- Validar timeout e disponibilidade de DNS/rede.
