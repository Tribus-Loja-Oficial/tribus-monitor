# Fluxo — Ingest

1. `monitor-api` recebe `POST /checks`.
2. Valida payload com Zod.
3. Persiste resultados brutos (`CheckResult`).
4. Calcula `ServiceState` com base em falhas consecutivas.
5. Avalia transição para abrir/fechar incidente.
6. Expõe estado consolidado em `/status`, `/incidents`, `/history`, `/services`.
