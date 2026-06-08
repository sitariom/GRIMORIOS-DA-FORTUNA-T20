
# 📜 Changelog — Grimório da Fortuna T20

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.3.0] — 2026-05-13
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
