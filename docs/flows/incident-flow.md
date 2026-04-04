# Fluxo — Incidentes

## Abertura

- Quando estado anterior não é `down` e novo estado vira `down`.
- Não abre incidente duplicado se já existir um incidente aberto para o serviço.

## Fechamento

- Quando havia incidente aberto e o serviço volta para `healthy`.

## Status

- `healthy`: 0 falhas consecutivas
- `degraded`: 1-2 falhas consecutivas
- `down`: 3+ falhas consecutivas
