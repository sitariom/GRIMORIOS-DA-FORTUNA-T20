# Registros de Decisão Arquitetural (ADRs) — Grimório da Fortuna T20

Este documento consolida as principais decisões arquiteturais tomadas durante o desenvolvimento e evolução do **Grimório da Fortuna T20**.

---

## ADR-001: Arquitetura Dual de Persistência (SQLite WAL em Dev vs PostgreSQL Neon em Prod)

### Contexto
O projeto necessita rodar perfeitamente em duas situações distintas:
1. Em ambientes locais e de desenvolvimento (desenvolvedores, mestres de RPG rodando offline ou em hardware leve como Orange Pi / Raspberry Pi) sem exigir a instalação de containers Docker ou bancos de dados externos.
2. Em produção cloud no Vercel utilizando arquitetura serverless de baixo custo e alta disponibilidade com PostgreSQL (Neon).

### Decisão
Implementar uma camada de abstração de banco de dados no backend (`server.ts` e `services/db.ts`) que inspeciona a variável de ambiente `POSTGRES_URL`:
- Se ausente: Inicializa automaticamente o **SQLite** (`database.sqlite`) com o modo **WAL (Write-Ahead Logging)** ativado para suporte a concorrência, convertendo dinamicamente cláusulas SQL de PostgreSQL para SQLite.
- Se presente: Conecta ao pool de conexões do **PostgreSQL Neon** via `@vercel/postgres`.

### Consequências
- **Positivas**: Zero atrito no setup local (`npm run dev` funciona imediatamente sem dependências externas); escalabilidade serverless em produção; conformidade total de tipos.
- **Negativas**: Necessidade de manter compatibilidade de sintaxe SQL entre os dois motores na camada de serviço.

---

## ADR-002: Segurança de Autenticação com PBKDF2 e JWT via Jose com Edge Middleware

### Contexto
Múltiplas campanhas de RPG compartilham a aplicação. Cada guilda possui uma senha de regente. É fundamental garantir que as senhas nunca fiquem expostas em texto puro no banco e que as requisições autenticadas sejam validadas com o menor custo computacional possível.

### Decisão
1. Utilizar **PBKDF2 com HMAC-SHA512**, salt de 16 bytes e 100.000 iterações para armazenamento seguro de senhas, com lógica de migração e auto-upgrade transparente de hashes legados.
2. Utilizar a biblioteca **jose** para assinar e verificar tokens JWT com algoritmo HS256 e tempo de expiração configurável (`JWT_EXPIRES_IN`), acompanhado de refresh tokens para renovação silenciosa.
3. Integrar **Edge Middleware (`middleware.ts`)** no Vercel para interceptar e validar o token JWT na borda da rede antes de acionar funções serverless.

### Consequências
- **Positivas**: Criptografia robusta resistente a ataques de força bruta; senhas nunca trafegam em sessões ativas; economia substancial de custos de invocação de funções serverless e banco de dados devido ao Edge Middleware.
- **Negativas**: Necessidade de sincronização da chave `JWT_SECRET` em todos os nós de execução.

---

## ADR-003: Otimização de Performance e Tráfego via Endpoints Parciais e JSONB

### Contexto
O estado completo da guilda (`GuildState`) pode ultrapassar 150KB com o acúmulo de transações, membros, domínios, itens e histórico. Carregar e salvar o blob JSON inteiro a cada clique no frontend gera alto tráfego de rede e lentidão.

### Decisão
1. Criar rotas granulares `/api/guilds/:id/:subResource` (`members`, `domains`, `items`, `wallet`) no backend.
2. Utilizar operadores JSONB nativos do PostgreSQL (`jsonb_path_query_array` para leituras e `jsonb_set` para escritas pontuais).
3. Atualizar o cliente React (`dbService`) para solicitar apenas os recursos necessários quando o usuário navega entre abas.

### Consequências
- **Positivas**: Redução de ~98% no payload de dados transferidos por requisição (de ~150KB para ~2KB); interface instantânea e responsiva.
- **Negativas**: Maior complexidade no roteamento de APIs e sincronização de cache no cliente.

---

## ADR-004: Decomposição de Estado Global em 9 Hooks Especializados na Context API

### Contexto
O arquivo `GuildContext.tsx` concentrava centenas de funções para todas as ações do jogo, dificultando a manutenção, testes unitários e legibilidade.

### Decisão
Modularizar as ações de domínio em 9 custom hooks desacoplados sob `context/hooks/`:
- `useFinancialActions`
- `useBaseActions`
- `useDomainActions`
- `useItemActions`
- `useMemberActions`
- `useNPCActions`
- `useCalendarActions`
- `useQuestActions`
- `useReputationActions`

O `GuildContext.tsx` atua como agregador e provedor de estado e persistência, delegando as regras operacionais para os hooks respectivos.

### Consequências
- **Positivas**: Separação clara de responsabilidades; facilidade para testar funções de negócio de forma isolada (`tests/domainActions.test.ts`, `tests/baseActions.test.ts`, etc.); código limpo e sustentável.
- **Negativas**: Requer passagem de setters de estado e funções de log como dependências de inicialização dos hooks.

---

## ADR-005: Modelagem de Domínios e Fortalezas Aderente às Regras Canônicas de Tormenta20

### Contexto
Jogadores e mestres de Tormenta20 exigem fidelidade estrita às regras oficiais de suplementos de QG, Empreendimentos e Reinos.

### Decisão
Implementar fielmente em `constants.ts` e `types.ts`:
- Os 7 portes de bases com slots e CDs de teste.
- O catálogo de 45 ativos comerciais oficiais com rolagens de lucros de nível 1 a 7.
- Os terrenos artonianos, limites de nível e bônus de raças da natureza e subterrâneas.
- As ações de governança em duas etapas (pagamento e resolução de dados).
- O sistema de afinidade de NPCs com teto de 7 PA e a mecânica de Última Demanda.

### Consequências
- **Positivas**: Experiência imersiva e canônica para mesas de RPG; automação de regras complexas que antes consumiam horas dos mestres.
- **Negativas**: Alto volume de constantes e tabelas de consulta que exigem manutenção e testes de regressão contínuos.

---

## ADR-006: Adoção do OpenSpec (SDD) e CodeGraph para Governança Contínua

### Contexto
O projeto atingiu grande sofisticação funcional e precisa evoluir com governança estrita, rastreabilidade de requisitos BDD e compreensão instantânea da árvore sintática e blast radius de código.

### Decisão
1. Adotar o **OpenSpec v1.14.0** como padrão de desenvolvimento orientado por especificações (Spec-Driven Development - SDD), mantendo 8 living specifications em `openspec/specs/` com cenários BDD (Given-When-Then / When-Then).
2. Adotar o **CodeGraph v1.6.2** para mapeamento semântico contínuo do código-fonte (1.336 nós e 3.329 arestas), permitindo análise de impacto e blast radius antes de qualquer alteração de código.

### Consequências
- **Positivas**: Todo desenvolvimento futuro possui contratos claros antes da escrita de código; validação automatizada de integridade das especificações (`openspec validate`); zero degradação de arquitetura.
- **Negativas**: Requer a manutenção dos arquivos de especificação a cada ciclo de evolução.
