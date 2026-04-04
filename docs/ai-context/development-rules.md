# Regras de desenvolvimento — Tribus Monitor

## Arquitetura

- Aplicar separação de camadas em todos os apps.
- `packages/core` não pode depender de framework.

## Implementação

- TypeScript strict obrigatório.
- Validação Zod em entradas de API.
- Logging estruturado no backend.
- Erro global com formato padronizado.

## Documentação

- Atualizar docs sempre que rota/regra/env mudar.
- Manter `project-context.md` atualizado em mudanças estruturais.

## Entrega

- Informar arquivos alterados (código e docs).
- Informar impacto arquitetural e de fluxo.
