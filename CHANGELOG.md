
# 📜 Changelog — Grimório da Fortuna T20

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.6.5] — 2026-06-12
### Corrigido
- **Fluxo de Caixa — Validação de valor:** 21 operações corrigidas para registrar `value: 0` quando apenas o tesouro do domínio (`domain.treasury`) é alterado, sem movimentação real no cofre da guilda (`wallet.LO`/`wallet.TS`). Isso evita que gráficos de Fluxo de Caixa e Dashboard exibam movimentações fictícias.
- **Registro de Itens:** `addItem` não é venda — `log.value` alterado para `0` (`useItemActions.ts`).
- **Ações de Domínio:** `manageDomainTreasury`, `addDomainBuilding`, `addDomainUnit`, `resolveCaravan`, `applyBattleOutcome`, `payMaintenance`, `applyRandomEvent`, `resolveRevolt` e fases de pagamento de `executeDomainAction` (governar, corte, festival, extorquir, convocar, impostos, caravana) — `log.value` alterado para `0` (`useDomainActions.ts`).
- **Investimentos:** Exibe `--` no lugar de `+0` para entradas sem valor financeiro (`InvestmentsPage.tsx`).

### Adicionado
- **Script de correção retroativa:** `npm run db:fixCashFlow` — percorre guildas existentes e zera `log.value` de operações de tesouro de domínio registradas incorretamente antes da correção. Identifica e preserva os únicos logs `Dominio` com valor legítimo (`investDomain`/`withdrawDomain`). Idempotente e seguro (`scripts/fixCashFlowRetroactive.ts`).

## [2.6.4] — 2026-06-12
### Corrigido
- **JWT fallback em GET:** Adicionado check `auth.userId === id` no fallback JWT do GET handler (`api/guilds.ts`).
- **JWT fallback em POST/DELETE:** Handlers de salvamento autenticam via JWT com `userId === id || role === 'admin'` e preservam hash armazenado (`api/guilds.ts`, `server.ts`).
- **Runtime Edge + JWT secret:** Restaurado `runtime: 'edge'` com fallback de JWT secret hardcoded (`utils/jwt.ts`); Edge Functions não acessam env vars sensíveis.
- **Rota de sub-recurso:** Parâmetro opcional `:subResource?` dividido em duas rotas explícitas (`server.ts`); `path-to-regexp` v8 não suporta `?`.
- **Modal de criação de missões no estado vazio:** Modal só existia no bloco Kanban — extraído para variável `questModal` e referenciado em ambos os branches (`QuestBoardPage.tsx`). ~110 linhas duplicadas eliminadas.

### Alterado
- **Debug logging:** `[DEBUG]` prefix adicionado em `QuestBoardPage.tsx`, `GuildContext.tsx` (triggerSave) e `services/db.ts` (apiRequest, getGuild, saveGuild) para diagnóstico.

## [2.6.3] — 2026-06-10
### Corrigido
- **Marcadores de conflito merge:** Removidos `<<<<<<<`/`=======`/`>>>>>>>` em `api/guilds.ts` que quebravam toda persistência de dados.

## [2.6.2] — 2026-06-10
### Corrigido
- **AnimatedCard em tabelas:** Componente `AnimatedCard` usa `as='tr'` em páginas com `<tbody>` para validade HTML.

## [2.6.1] — 2026-06-10
### Corrigido
- **Alinhamento Arsenal:** Cabeçalho de tabela e `type="button"` em todos os botões da página de Arsenal.

## [2.6.0] — 2026-06-10
### Adicionado
- **Animações em todas as 17 páginas:** Componentes `AnimatedCard`, `EmptyState`, `CardSkeleton` com fade-in, hover effects e `parchment-card rounded-[32px]`.
- **Identidade visual refinada:** Efeitos `active:scale-95` consistentes em todos os botões interativos.

## [2.5.0] — 2026-06-10
### Adicionado
- **JWT com jose:** Login de admin e guilda emite token JWT (HS256, Edge Runtime) no lugar de expor a senha. Suporte a renovação silenciosa (`/api/auth/refresh`) e revogação via `token_version`.
- **Middleware de Autenticação:** Módulo compartilhado (`api/middleware/auth.ts`) eliminando duplicação de auth entre endpoints serverless.
- **Vercel Edge Middleware:** `middleware.ts` na raiz valida JWT antes de rotear para a serverless function, rejeitando tokens inválidos/expirados sem bater no Neon.
- **Endpoints Parciais:** `GET /api/guilds/:id/members|domains|items|wallet` retornam apenas o sub-recurso solicitado (~2KB vs 150KB do blob completo).
- **Filtro Server-Side:** `GET /api/guilds/:id/members?status=Ativo` usa `jsonb_path_query_array` no PostgreSQL para filtrar diretamente no banco.
- **Scripts de Banco:** `npm run db:verify|migrate|validate|index` para verificação JSONB, migração TEXT→JSONB, validação de dados e criação de índice GIN.
- **Patch Parcial:** `POST /api/guilds` com `$patch: true` usa `jsonb_set` no PostgreSQL para atualizar apenas campos modificados.
- **Schema Check Automático:** Startup do servidor e serverless functions verificam se coluna `data` é JSONB, com cache para evitar repetição.

### Alterado
- **Segurança:** Senha nunca armazenada em sessionStorage/localStorage — apenas JWT. Migração automática de sessões antigas.
- **Listagem Pública:** `GET /api/guilds` agora inclui `member_count` e `domain_count` extraídos do JSONB (PostgreSQL).
- **Admin Login:** Retorna `{ success, token, expiresIn, role }` — o token JWT substitui sessão baseada em senha.


## [2.4.0] — 2026-06-10
### Adicionado
- **Sistema de Alianças & Impérios:** Tela dedicada com criação de conglomerados (Aliança/Império), adição e subjugação de domínios, exibição de Poder Militar somado com bônus de papéis táticos.
- **Papéis Táticos:** Domínios em conglomerados podem assumir papéis de Capital (+3 Poder), Baluarte (+2 Poder) ou Valete (+1 Poder), com bônus exibidos no Poder Total do conglomerado.
- **Sistema de Afinidade:** Substitui o booleano `subjugated` por 4 níveis de afinidade (Subjugado → Vassalo → Integrado → Aliado), com controle evolutivo pelo mestre via dropdown na UI.
- **Suborno Diplomático:** Ao aliar um domínio via diplomacia, o mestre pode oferecer um suborno em LO que sai do tesouro do domínio capital e vai para o tesouro do domínio alvo.
- **Inativação de Conglomerados:** Conglomerados podem ser inativados (arquivados com histórico preservado) ou reativados, além da dissolução completa.
- **Transferência entre Conglomerados:** Domínios podem migrar entre conglomerados (aliança voluntária ou conquista), com rastreamento histórico de ex-membros.
- **Controle de Ex-membros:** Cada conglomerado registra domínios que saíram; cada domínio registra conglomerados pelos quais passou, exibido na UI como badges de histórico.

### Alterado
- **LevelUp de Domínio:** Removido custo financeiro e cheque de limite de construções; evolução é concedida pelo Mestre sem custo de tesouro.
- **Refatoração de Terrenos:** Normalização e tabelas de Nível Máximo e Potencial Mágico extraídas para constantes com fallback seguro.
- **Botão "Configurar" (Dark Mode):** Corrigidas classes Tailwind inválidas (`-750`, `-850`) em 13 botões no DomainsPage.tsx.

### Corrigido
- **Criação de Império:** Capital não é mais marcada como subjugada automaticamente.
- **Sanitização de Dados:** Mapeamento automático do campo legado `subjugated` para o novo sistema de afinidade na migração.
### Adicionado
- **Sistema de Negócios:** Novo tipo de base "Negócio" com 45 ativos oficiais T20, evolução por níveis (1-7), coleta de lucros mensais e interface dedicada.
- **Fila de Salvamento:** Salvamento em lote para pontos divinos evitando perda de dados em edições múltiplas.

### Corrigido
- **Lista de Aventureiros:** Filtro de membros ativos agora considera apenas status "Ativo" (excluindo "Viajando", "Ferido", etc.) nas páginas de Reputação e Quadro de Missões.
- **Hardening de Segurança:** Remoção de config do Vercel versionada, correções de dependências, headers de segurança aprimorados.

## [2.2.0] — 2026-01-29
### Adicionado
- **Calendário de Arton:** Nova tela com sistema completo de datas (dia/mês/ano), dia da semana e detecção de Nimb Day.
- **Quadro de Missões:** Gestão de quests com status, descrição e acompanhamento.
- **Inventário Reformulado:** Interface aprimorada com filtros, histórico de itens e rastreamento de movimentações.
- **Gestão de Campanhas:** Múltiplos perfis com autenticação por senha (PBKDF2), armazenamento isolado por campanha.

### Alterado
- **Evolução de Telas:** Interface unificada para Inventário, Calendário e Missões com navegação consistente.

## [2.1.0] — 2026-01-28
### Adicionado
- **Servidor Express:** Backend próprio com Vite middleware, helmet, CORS e rate limiting.
- **API Serverless:** Endpoints para admin e guildas com deploy para Vercel.
- **Banco de Dados:** Suporte a SQLite (desenvolvimento) e PostgreSQL (produção).
- **Autenticação:** Sistema de login com hash PBKDF2 via WebCrypto, sessão por navegador.

### Alterado
- **Armazenamento:** Migração de LocalStorage puro para banco de dados com cache em memória.
- **Segurança:** Implementação de boas práticas OWASP (helmet, CORS, rate-limit, sanitização).

## [2.0.0] — 2025-12-19
### Adicionado
- **Refatoração completa da UI:** Novo layout responsivo com sidebar unificada e componentes redesenhados.
- **Integração de IA:** Geração de arte de fundo no Dashboard com fallback e cache.
- **Tipos Node:** Suporte a tipos Node/Express no TypeScript.

### Alterado
- **Dependências:** Atualização para React 19, Vite 6, Tailwind CSS 4, Express 5.
- **Configuração:** Projeto migrado de Vite standalone para Vite + Express integrados.

## [1.2.0] — 2025-12-18
### Adicionado
- **Pontos Divinos:** Tela para gestão e acompanhamento dos pontos divinos dos membros ativos.
- **Construções Personalizadas:** Obras e infraestruturas com nomes, custos e benefícios manuais nos Domínios.
- **Unidades Mercenárias:** Criação manual de tropas com Poder Bélico (PWR) e custos personalizados.
- **Abas de Recrutamento:** Interface de modais dividida entre "Catálogo Oficial" e "Projetos Personalizados".
- **Sistema de Backup:** Exportação e importação de dados via JSON.

### Corrigido
- **Botão Governar:** Exibição do resultado detalhado do decreto (renda, manutenção, sucesso/falha).
- **Recrutamento de NPCs:** Modal reimplementado com seletores dinâmicos de alocação.
- **Cálculo de Popularidade:** Erro de índice ao atingir limites (Odiado/Adorado).
- **Websocket HMR:** Tratamento de erros no modo dev com ambiente seguro.

### Alterado
- **Identidade Visual:** Contraste do modo Dark, dropdowns harmonizados no modo escuro.
- **Logs do Sistema:** Inclusão do resultado do dado e CD nos logs de governança.

## [1.1.0] — 2025-12-18
### Adicionado
- **Investimentos:** Gestão de aplicações e rendimentos.
- **Crônicas:** Registro narrativo da campanha.
- **Reputação:** Sistema de rastreamento por facção com bônus.
- **Agentes de IA:** Estrutura de agência com 5 personas (Orquestrador, PO, Dev, QA, Arquivista) e blueprint replicável.

### Alterado
- **Domínios:** Melhorias no sistema de governança, eventos aleatórios (crises) e conselheiros.
- **Dashboard:** Visão geral refinada com indicadores de tesouraria, membros e propriedades.

## [1.0.0] — 2025-12-18
### Lançamento Inicial
- **Core:** Estrutura base com Context API para gestão global de estado.
- **Finanças:** Sistema de quatro moedas (TC, TS, TO, LO) com câmbio integrado.
- **Inventário:** Arsenal completo com sistema de vendas e retiradas.
- **Bases:** Gestão de propriedades, cômodos e mobílias.
- **Domínios:** Sistema básico de territórios, regentes e tesouro real.
- **Dashboard:** Visão geral com integração de IA para geração de arte de fundo.
- **Temas:** Suporte completo a Modo Claro e Modo Escuro.

---
*Nota: Este projeto segue o versionamento semântico.*
