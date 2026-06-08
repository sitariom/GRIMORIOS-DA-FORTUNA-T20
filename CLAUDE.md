# AI Agency & Mind Operating System

Este arquivo é o **Sistema Operacional** da agência de IA. Consulte também `AGENTS.md` para o blueprint completo de replicação.

## 1. Core Principles
- **Pense Antes de Codar**: Se houver ambiguidade, apresente opções e trade-offs.
- **Simplicidade Primeiro**: Código tão simples que um sênior aprovaria num relance.
- **Mudanças Cirúrgicas**: Altere apenas o necessário. Zero "drive-by refactoring".
- **Execução Orientada a Objetivos**: Planeje com `TodoWrite`, execute, verifique.

## 2. Personas da Agência (ciclo: Orquestrador → PO → Dev → QA → Arquivista)

| Persona | Skill | Função |
|---------|-------|--------|
| **Orquestrador** | `agency-orchestrator` | Maestro. Interface única com usuário, planeja, delega, fecha ciclo |
| **PO** | `agency-po` | Requisitos, PRDs, épicos (quando demanda é vaga) |
| **Dev** | `karpathy-coder` | Código limpo e cirúrgico, sem overengineering |
| **QA** | `agency-qa` | Testes, code review, edge cases, segurança |
| **Arquivista** | `obsidian-mind` | Memória de longo prazo: ADRs em `docs/memory/` |

Cada skill está em `.trae/skills/<nome>/SKILL.md` com frontmatter e instruções.

## 3. Comandos do Projeto

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server (Vite + Express, porta 3000) |
| `npm run build` | Build produção (Vite + esbuild) |
| `npm start` | Servir produção de `dist/` |
| `npm test` | Rodar testes (`domainActions`, `baseActions`, `npcActions`, `migration`) |

### Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Lucide Icons (importmap via CDN)
- **Backend**: Express 5 (BFF), **PostgreSQL** (se `POSTGRES_URL`) ou **SQLite** (fallback local)
- **Build**: Vite (client) + esbuild (server bundle)
- **Auth**: PBKDF2 (WebCrypto) com upgrade automático de hash

### Variáveis de Ambiente
- `POSTGRES_URL` — PostgreSQL (opcional; sem ela usa SQLite)
- `ADMIN_PASSWORD` — senha admin inicial
- `NODE_ENV` — development | production | test

## 4. Workflows

1. **Feature Request**: Orquestrador lê `docs/memory/INDEX.md` → cria `TodoWrite` → PO(se vago) → Dev → QA → Arquivista(ADR se necessário)
2. **Project Init** (`tasks/project-init.json`): PO → Arquivista → Dev → QA
3. **Agency Evolution** (`tasks/agency-evolution.json`): Sincroniza conhecimento externo, evolui skills
4. **Sempre antes de codar**: ler `docs/memory/INDEX.md` para contexto
5. **Sempre depois**: `npm run build` ou `npm test` para validar

## 5. Estrutura do App

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
                    → api/ (serverless Vercel: admin.ts, guilds.ts)
                    → server.ts (Express com Vite middleware)
                    → utils/password.ts (PBKDF2)
```

### Domínios de Dados (types.ts)
- `GuildState`: id, guildName, version, wallet, items, bases, domains, npcs, logs, members, calendar, quests, pointsOfInterest, reputations
- `Domain`: level, court, treasury, popularity, fortification, buildings, units, advisors, pendingTasks, revolt, actionsRemaining
- `Base`: porte (Minima-Suprema), type, rooms, furnitures, gargulas
- `NPC/Member`: wallet, inventory, status, divinePoints, affinity
- `Calendar`: day/month/year (Arton), dayOfWeek, isNimbDay

## 6. Próximos Passos (Pendentes)

### High
1. **Sistema de Conselheiros** — UI contratar/demitir conselheiros por domínio
2. **Desacoplamento Ação/Sucesso** — Ações com fase "Declarar" e "Registrar Resultado"

### Medium
3. **Gestor de Batalhas** — Modal perdas em batalhas/crises
4. **Dashboard de Bônus** — Painel unificado de bônus ativos do regente

### Low
5. **Tracker de Caravanas** — Pendências assíncronas (Caravançará)
6. **Refatorar levelUp** — Unificar "Expandir Fronteiras" e "Governar"
7. **Mais testes** — Cobrir cenários BDD do TEST-PLAN-Dominios.md
