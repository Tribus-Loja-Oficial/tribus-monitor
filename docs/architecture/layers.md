# Arquitetura — Layers

## Padrão obrigatório

`config -> routes -> schemas -> services -> repositories/storage`

## Responsabilidades

- **config**: leitura e validação de env.
- **routes**: parse de request, delegação e resposta.
- **schemas**: validação Zod.
- **services**: regras de status/incidente e orquestração.
- **repositories/storage**: persistência e consultas.

## Regras

- Proibido acessar env fora de `config`.
- Proibido lógica de negócio em `routes`.
