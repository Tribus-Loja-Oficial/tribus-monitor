# Integração — Cloudflare Workers

`apps/monitor-api` roda em Cloudflare Workers com Hono.

## Persistência

- D1 para histórico e incidentes.
- KV opcional para estado atual (otimização futura).

## Deploy

- `wrangler.toml` define bindings e variáveis.
- Deploy via GitHub Actions ou `wrangler deploy`.
