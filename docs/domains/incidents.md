# Domínio — Incidents

Incidentes representam falhas operacionais relevantes (serviço em `down`).

## Regras

- Abrir apenas na transição para `down`.
- Fechar no retorno para `healthy`.
- Proibir incidente duplicado aberto para o mesmo serviço.

## Campos

- `startedAt`, `resolvedAt`
- `openReason`, `closeReason`
- `statusAtOpen`, `statusAtClose`
