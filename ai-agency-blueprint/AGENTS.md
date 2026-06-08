# AI Agency Replication Blueprint — Guia Completo

Blueprint replicável da agência de IA. Use `setup-agency.ps1` para copiar para novos projetos.

## Estrutura

```
projeto/
├── CLAUDE.md              # SO da IA
├── AGENTS.md              # Este blueprint
├── .trae/skills/          # 5 agentes (orchestrator, po, qa, coder, mind)
├── docs/memory/           # Memória: INDEX.md, ADRs, templates, external-refs
├── tasks/                 # Workflows: project-init, agency-evolution
├── .github/workflows/     # CI: ai-qa-check.yml
└── .husky/                # Git hooks (opcional)
```

## 5 Personas
1. **Orquestrador** — Maestro, planeja e delega
2. **PO** — Requisitos e PRDs
3. **Dev (Karpathy Coder)** — Código limpo e cirúrgico
4. **QA** — Testes, code review, segurança
5. **Arquivista (Obsidian Mind)** — Memória de longo prazo (ADRs)

## Fluxo Padrão
Orquestrador → Lê INDEX.md → TodoWrite → PO(se vago) → Dev → QA → Arquivista(ADR se necessário)
