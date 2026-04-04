# Arquitetura — Overview

O `tribus-monitor` centraliza observabilidade da plataforma Tribus com três responsabilidades:

1. Coletar checks (`apps/check-runner`).
2. Processar e persistir estados/incidentes (`apps/monitor-api`).
3. Exibir visão operacional (`apps/dashboard`).

## Princípios

- Monorepo com contratos compartilhados em `packages/core`.
- Regras de negócio puras no core (status e incidentes).
- Backend com rotas finas e services ricos.
- Storage abstrato desde o início (D1 + KV-ready).
