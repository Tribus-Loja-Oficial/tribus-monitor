# check-runner

Executor de checks HTTP do Tribus Monitor.

## Fluxo

1. Monta targets por nicho.
2. Executa checks com timeout.
3. Executa validacao de catalogo no backend `be.tribus...` (retorno de produtos).
4. Envia resultado consolidado para `monitor-api`.

Execução principal via GitHub Actions cron.
