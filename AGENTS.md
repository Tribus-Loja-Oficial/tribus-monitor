# Guia obrigatório para IA — Tribus Monitor

Este arquivo é o contrato obrigatório para qualquer IA trabalhando no `tribus-monitor`.

---

## 1. Regras de arquitetura

- Respeitar separação de camadas: `config -> routes -> schemas -> services -> repositories/storage`.
- Rotas devem ser finas; lógica de negócio fica em services.
- Toda entrada externa deve ser validada com Zod.
- Nenhum acesso direto a `process.env` fora da camada de config.
- `packages/core` deve permanecer framework-agnostic.

---

## 2. Regras de documentação

- Toda mudança relevante deve atualizar docs em `docs/`.
- Sempre revisar impacto em `docs/reference/routes.md` e `docs/reference/env-vars.md`.
- Atualizar fluxos em `docs/flows/` quando o comportamento operacional mudar.

---

## 3. Regras de implementação

- TypeScript strict em todos os apps e packages.
- Logging estruturado (JSON) no backend.
- Tratar erros globalmente (resposta padronizada).
- Não misturar monitoramento com operações administrativas.
- O sistema não deve executar ações destrutivas.

---

## 4. Regra de análise antes de codar

Antes de implementar:

1. Ler `docs/ai-context/project-context.md`.
2. Ler `docs/ai-context/development-rules.md`.
3. Ler documentação de domínio/fluxo afetado.

---

## 5. Regra de entrega

Toda entrega deve listar:

1. Arquivos de código alterados.
2. Arquivos de documentação alterados.
3. Alterações no contexto IA (`project-context.md`, `development-rules.md`) ou justificativa.
4. Impacto na arquitetura e nos fluxos.
