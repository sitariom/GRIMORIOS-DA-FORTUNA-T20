# Arquitetura Técnica — Grimório da Fortuna T20

## 1. Visão Geral do Sistema

O **Grimório da Fortuna T20** é uma plataforma web full-stack de alta performance projetada para gestão de tesouraria, inventário, bases operacionais, negócios e domínios territoriais em campanhas de RPG baseadas no sistema **Tormenta20**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA)                                  │
│  React 19 + TypeScript + Tailwind CSS + Lucide React + React Router v6 │
│  GuildContext (Estado Centralizado) + 9 Hooks de Domínio Especializados│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP / REST / JWT
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE SEGURANÇA                             │
│  Edge Middleware (Vercel) / Express Middleware (Helmet, CORS, RateLim) │
│  Autenticação PBKDF2 (SHA-512) + Sessão JWT (jose HS256) + Refresh Tok │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼                                     ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│     BACKEND LOCAL (Express 5)     │ │    PRODUÇÃO CLOUD (Vercel API)    │
│  Execução local (node/tsx)        │ │  Serverless Functions (api/*.ts)  │
│  Serviço estático de build (Vite) │ │  Edge Runtime + Node.js Lambda    │
└─────────────────┬─────────────────┘ └─────────────────┬─────────────────┘
                  │                                     │
                  ▼                                     ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│         BANCO LOCAL (SQLite)      │ │      BANCO PRODUÇÃO (PostgreSQL)  │
│  Driver sqlite3 + sqlite          │ │  Neon Serverless (@vercel/postgres│
│  Modo WAL ativado                 │ │  JSONB com índices GIN e path ops │
└───────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 2. Camada Frontend (Client-Side)

### 2.1 Tecnologias e Padrões
- **React 19 & TypeScript**: Tipagem estrita de todas as 46 interfaces de dados (`types.ts`).
- **Tailwind CSS**: Estilização moderna com suporte nativo a temas Dark/Light e paleta temática medieval/fantasia.
- **Roteamento**: `react-router-dom` v6 organizando 17 páginas temáticas.
- **Ícones**: `lucide-react` para representação visual dos subsistemas.

### 2.2 Gerenciamento de Estado Modular
O estado da guilda é unificado no `GuildContext.tsx` e decomposto em **9 hooks especializados** (`context/hooks/`):
1. `useFinancialActions`: Depósitos, saques, câmbio entre moedas e transferências.
2. `useBaseActions`: Construção, compras, reformas, cômodos, mobílias, gárgulas e negócios T20.
3. `useDomainActions`: Domínios, governança em duas etapas, impostos, edifícios, tropas, conselheiros e caravanas.
4. `useItemActions`: Catálogo de inventário, cálculo de carga, vendas em lote e baixas.
5. `useMemberActions`: Gestão de membros, carteiras individuais, Pontos Divinos.
6. `useNPCActions`: Comitiva de aliados e contratados, folha salarial, afinidade (0-7 PA) e Última Demanda.
7. `useCalendarActions`: Calendário artoniano, passagem de tempo, Nimb Day.
8. `useQuestActions`: Quadro de missões e recompensas.
9. `useReputationActions`: Facções de Arton e pontos de interesse (POIs).

---

## 3. Camada Backend e APIs

### 3.1 Execução Híbrida: Express 5 vs Serverless
- **Ambiente Local / Dev**: O arquivo `server.ts` utiliza **Express 5** e inicia o servidor Vite com Hot Module Replacement (HMR) em dev (`npm run dev`) ou serve os arquivos compilados (`dist/`) em produção local (`npm start`).
- **Ambiente Cloud / Vercel**: As rotas são espelhadas em `api/*.ts` para execução serverless no Vercel.

### 3.2 Endpoints da API REST
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/admin` | Autenticação administrativa, reset de senhas e auditoria |
| `GET` | `/api/guilds` | Listagem sumária de campanhas disponíveis (sem vazar dados) |
| `GET` | `/api/guilds/:id` | Carregamento do estado completo ou inicial da guilda |
| `GET` | `/api/guilds/:id/:subResource` | Endpoints parciais otimizados (`members`, `domains`, `items`, `wallet`) |
| `POST` | `/api/guilds` | Criação, atualização atômica e importação de guilda |
| `DELETE` | `/api/guilds` | Remoção de campanha |
| `POST` | `/api/auth/refresh` | Renovação silenciosa de token JWT expirado |

---

## 4. Segurança e Autenticação

### 4.1 Criptografia de Senhas (PBKDF2)
- Senhas são processadas via `crypto.pbkdf2` com:
  - **Salt**: 16 bytes aleatórios criptograficamente seguros gerados por campanha.
  - **Iterações**: 100.000 ciclos.
  - **Algoritmo**: HMAC-SHA512.
- **Auto-Upgrade**: O sistema detecta formatos legados de senha e atualiza transparentemente para o padrão moderno no momento do login bem-sucedido.

### 4.2 Tokens JWT e Edge Middleware
- Biblioteca: `jose` (leve, segura e compatível com Edge Runtime).
- Algoritmo: HS256 com chave `JWT_SECRET`.
- **Edge Middleware (`middleware.ts`)**: Valida o token JWT nas rotas protegidas antes de acionar a função serverless, bloqueando acessos não autorizados na borda da rede e economizando consultas ao banco de dados.

### 4.3 Proteção de Rede
- **Helmet**: Headers HTTP seguros contra XSS, Clickjacking e injeção.
- **CORS**: Configurado com origens restritas.
- **Rate Limit**: `express-rate-limit` mitigando ataques de força bruta no login.

---

## 5. Persistência Dual e Otimizações de Dados

### 5.1 Motor Dual: SQLite vs PostgreSQL
O arquivo `server.ts` e `services/db.ts` selecionam o motor dinamicamente:
- Se `POSTGRES_URL` **não estiver definida**:
  - Utiliza **SQLite** (`database.sqlite`) via `sqlite3` e `sqlite`.
  - Ativa automaticamente o modo **WAL (Write-Ahead Logging)** para suporte a leituras concorrentes e alta performance.
  - Faz a conversão dinâmica de queries PostgreSQL para SQLite (`JSONB` → `TEXT`, `UUID` → `TEXT`, `NOW()` → `CURRENT_TIMESTAMP`).
- Se `POSTGRES_URL` **estiver definida**:
  - Utiliza **PostgreSQL Neon** via `@vercel/postgres` com pool de conexões gerenciado.

### 5.2 Otimizações de Payload e Consultas JSONB
- Em vez de transferir o blob completo da guilda (~150KB) a cada interação, o sistema implementa:
  - **Consultas Granulares**: `jsonb_path_query_array` no PostgreSQL para recuperar apenas itens, membros ou domínios específicos.
  - **Patches Incrementais**: Atualizações pontuais via `jsonb_set` diretamente no banco de dados.
  - Redução drástica de tráfego de rede: de ~150KB para ~2KB por requisição.

### 5.3 Tolerância a Falhas e Migração de Schema
- O script `tests/migration.test.ts` e as funções de sanitização garantem que bases de dados antigas ou com campos ausentes sejam automaticamente migradas com valores padrão sem interrupção de serviço.
