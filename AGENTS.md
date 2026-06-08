# AI Agency Replication Blueprint — Guia Completo

Este documento consolida a arquitetura completa da agência de IA deste projeto, servindo como blueprint replicável para novos projetos.

---

## 1. Filosofia Central

O sistema usa 5 personas de IA (Agents) que atuam em ciclo orquestrado:
**Orquestrador → PO → Dev → QA → Arquivista**

Cada agente tem uma **SKILL.md** em `.trae/skills/<agent-name>/` com frontmatter (`name`, `description`) e instruções.

---

## 2. Estrutura de Diretórios (Blueprint)

```
projeto/
├── CLAUDE.md                          # Sistema Operacional da IA (diretrizes principais)
├── AGENTS.md                          # Este arquivo — blueprint replicável
├── setup-agency.ps1                   # Script para copiar blueprint para novos projetos
├── .trae/
│   └── skills/
│       ├── agency-orchestrator/
│       │   └── SKILL.md               # Orquestrador — gerencia ciclo, delega tarefas
│       ├── agency-po/
│       │   └── SKILL.md               # PO — requisitos, PRDs, épicos
│       ├── agency-qa/
│       │   └── SKILL.md               # QA — testes, code review, segurança
│       ├── karpathy-coder/
│       │   └── SKILL.md               # Dev — código limpo e cirúrgico
│       └── obsidian-mind/
│           └── SKILL.md               # Arquivista — memória de longo prazo (ADRs)
├── docs/
│   └── memory/
│       ├── INDEX.md                   # Índice central da memória
│       ├── ADR-*.md                   # Architecture Decision Records
│       ├── templates/
│       │   ├── ADR.md                 # Template de ADR
│       │   ├── PRD.md                 # Template de PRD
│       │   └── TEST-PLAN.md           # Template de plano de testes
│       └── external-refs/             # Referências externas baixadas (gitignore)
├── tasks/
│   ├── project-init.json              # Workflow: setup inicial de projeto
│   └── agency-evolution.json          # Workflow: auto-evolução da agência
├── .github/
│   └── workflows/
│       └── ai-qa-check.yml            # CI: validação de qualidade em PRs
└── .husky/                            # Git hooks (opcional)
```

---

## 3. As 5 Personas da Agência

### 3.1 Orquestrador (`agency-orchestrator`)
- **Função**: Maestro. Interface única com o usuário.
- **Fluxo**: Recebe demanda → Lê `docs/memory/INDEX.md` → Cria `TodoWrite` → Delega para PO, Dev, QA, Arquivista → Reporta.
- **Habilidades**: Triagem de complexidade, planejamento, execução em cadeia.

### 3.2 PO (`agency-po`)
- **Função**: Product Owner. Foco no "o quê" e "por quê".
- **Quando atuar**: Demanda vaga, nova feature grande, necessidade de PRD.
- **Entregáveis**: PRDs em `docs/memory/templates/PRD.md`, requisitos quebrados em TODOs.

### 3.3 Dev (`karpathy-coder`)
- **Função**: Desenvolvedor Sênior. Código limpo e cirúrgico.
- **Princípios**: Sem overengineering, sem abstrações prematuras, mudanças mínimas.
- **Regra de Ouro**: "Código tão simples que um sênior aprovaria num relance."

### 3.4 QA (`agency-qa`)
- **Função**: Quality Assurance. Quebra o sistema.
- **Atuação**: Code review, edge cases, vulnerabilidades, testes unitários/E2E.
- **Pode**: Rejeitar código ou corrigir cirurgicamente.

### 3.5 Arquivista (`obsidian-mind`)
- **Função**: Memória de longo prazo da IA.
- **Artefatos**: `docs/memory/INDEX.md`, ADRs, templates.
- **Regra**: Toda decisão arquitetural relevante → nova ADR em `docs/memory/`.

---

## 4. Workflows

### 4.1 Project Init (`tasks/project-init.json`)
1. PO entrevista usuário e gera PRD
2. Arquivista salva PRD na memória + estrutura de pastas
3. Dev gera arquitetura base (MVP)
4. QA cria suite inicial de testes

### 4.2 Agency Evolution (`tasks/agency-evolution.json`)
1. Orquestrador executa `update-agency-knowledge.ps1`
2. Arquivista analisa novos arquivos em `external-refs/`
3. Orquestrador compara com estrutura atual
4. Dev atualiza skills/CLAUDE.md
5. QA valida integridade

### 4.3 Feature Request (Ad-hoc)
1. Orquestrador recebe demanda
2. Cria `TodoWrite` com etapas
3. Executa em loop: PO (se necessário) → Dev → QA → Arquivista
4. Reporta resultado

---

## 5. Hooks e Automação

- **CI**: `.github/workflows/ai-qa-check.yml` — valida em PRs para main/master
- **Git Hooks**: `.husky/` — linters e verificações pré-commit
- **Sincronização**: `update-agency-knowledge.ps1` baixa READMEs dos repositórios base:
  - `multica-ai/andrej-karpathy-skills`
  - `kepano/obsidian-skills`
  - `breferrari/obsidian-mind`
  - `msitarzewski/agency-agents`

---

## 6. Como Replicar para Novo Projeto

### Método 1: Script Automático
```powershell
.\setup-agency.ps1 -TargetDir "C:\caminho\do\novo-projeto"
```

### Método 2: Manual
Copie da pasta `ai-agency-blueprint/`:
```
ai-agency-blueprint/
├── CLAUDE.md
├── .trae/skills/       (5 agentes)
├── docs/memory/        (INDEX.md + templates)
├── tasks/              (project-init.json, agency-evolution.json)
├── .github/workflows/  (ai-qa-check.yml)
└── .husky/             (hooks)
```

---

## 7. MCPs (Model Context Protocols)

Atualmente este projeto **não utiliza MCPs externos**. Toda a lógica de contexto está contida em:
- `CLAUDE.md` — diretrizes operacionais
- `.trae/skills/*/SKILL.md` — definições de persona
- `docs/memory/INDEX.md` — índice do conhecimento
- `docs/memory/external-refs/` — referências base baixadas

---

## 8. Estrutura do Aplicativo (Grimório da Fortuna T20)

### Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Lucide Icons
- **Backend**: Express 5 + Vite (dev), SQLite (local) / PostgreSQL (Vercel)
- **Build**: esbuild (server), Vite (client)
- **Auth**: PBKDF2 (WebCrypto), session em localStorage/sessionStorage

### Camadas
```
index.tsx → App.tsx → GuildProvider (context/GuildContext.tsx)
                        ├── useFinancialActions
                        ├── useMemberActions
                        ├── useItemActions
                        ├── useBaseActions
                        ├── useDomainActions
                        ├── useNPCActions
                        ├── useCalendarActions
                        ├── useQuestActions
                        └── useReputationActions
                    → pages/ (16 páginas)
                    → components/ (Sidebar, Logo, ConfirmModal)
                    → services/db.ts (API client)
                    → api/ (serverless endpoints: admin.ts, guilds.ts)
                    → server.ts (Express + Vite middleware)
                    → utils/password.ts (PBKDF2 hash/verify)
```

### Domínios de Dados
- `GuildState`: id, guildName, version, wallet, items, bases, domains, npcs, logs, members, calendar, quests, pointsOfInterest, reputations
- `Domain`: level, court, treasury, popularity, fortification, buildings, units, advisors, pendingTasks, revolt, actionsRemaining
- `Base`: porte (Minima-Suprema), type, rooms, furnitures, gargulas
- `NPC/Member`: wallet, inventory, status, divinePoints, affinity
- `Calendar`: day/month/year (Arton), dayOfWeek, isNimbDay

### Scripts
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server (Vite + Express) |
| `npm run build` | Build produção |
| `npm start` | Servir produção |
| `npm test` | Rodar testes |

### Variáveis de Ambiente
- `POSTGRES_URL` — (opcional) URL do PostgreSQL; sem ela, usa SQLite local
- `ADMIN_PASSWORD` — senha admin inicial
- `NODE_ENV` — development | production | test

---

## 9. Próximos Passos (Desenvolvimento Pendente)

Com base nos PRDs em `docs/memory/templates/`:

### Priority: High
1. **Sistema de Conselheiros** — UI para contratar/demitir conselheiros por domínio (PRD-Dominios.md)
2. **Desacoplamento Ação/Sucesso** — Ações de domínio com fase de "Declarar" e "Registrar Resultado" separadas (PRD-Tracker-Dominios.md)

### Priority: Medium
3. **Gestor de Batalhas** — Modal para relatório de perdas em batalhas/crises
4. **Dashboard de Bônus** — Painel unificado de bônus ativos do regente

### Priority: Low
5. **Tracker de Caravanas** — Pendências assíncronas (Caravançará)
6. **Refatorar levelUp** — Unificar "Expandir Fronteiras" e "Governar" (bug de duplicidade)
7. **Mais testes** — Cobrir cenários BDD do TEST-PLAN-Dominios.md
