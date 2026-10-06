# Security, Authentication and Dual Persistence Specification

## Purpose
Arquitetura de segurança, autenticação multi-campanha (Multi-Guild) e persistência dual (SQLite WAL para desenvolvimento local e PostgreSQL Neon para produção serverless), incorporando criptografia de senhas com PBKDF2, tokens JWT via jose, middleware de borda, consultas otimizadas via JSONB e endpoints parciais.

## Requirements

### Requirement: Multi-Tenant Campaign Isolation and PBKDF2 Hashing
O sistema DEVE (MUST) isolar dados de múltiplas campanhas de RPG através de identificadores únicos de guilda, protegendo o acesso com senhas autenticadas via derivação PBKDF2 (salt de 16 bytes, 100.000 iterações HMAC-SHA512) e capacidade de auto-upgrade de formato.

#### Scenario: Autenticação de Campanha com Validação de Hash
- **WHEN** O usuário submete o identificador da guilda e a senha de acesso
- **THEN** O servidor verifica a senha contra o hash PBKDF2 armazenado; se válida, emite um token JWT de sessão assinado e um refresh token

#### Scenario: Bloqueio de Acesso com Senha Inválida
- **WHEN** Uma tentativa de login com credenciais incorretas for efetuada
- **THEN** A requisição é rejeitada com código HTTP 401 e a falha é contabilizada no limitador de taxa (Rate Limit)

### Requirement: JWT Session Management and Edge Middleware
O sistema DEVE (MUST) utilizar tokens JWT assinados via biblioteca 'jose' (HS256) com tempo de expiração configurável e suporte a validação antecipada em Edge Middleware no Vercel.

#### Scenario: Validação Antecipada no Edge Middleware
- **WHEN** Uma requisição HTTP com cabeçalho Authorization Bearer chega à infraestrutura do Vercel
- **THEN** O Edge Middleware valida a assinatura e expiração do JWT na borda da rede antes de encaminhar para a função serverless, rejeitando requisições inválidas sem consumir recursos de banco

#### Scenario: Renovação Silenciosa de Sessão com Refresh Token
- **WHEN** O token de acesso expira e o cliente solicita renovação via rota /api/auth/refresh com refresh token válido
- **THEN** Um novo token de acesso JWT é emitido sem exigir que o regente redigite a senha da campanha

### Requirement: Dual Persistence Engine (SQLite and PostgreSQL JSONB)
O backend DEVE (MUST) operar de forma transparente em dois motores de banco de dados: SQLite com WAL para execução local sem dependências de infraestrutura, e PostgreSQL Neon em produção com queries JSONB de alta performance.

#### Scenario: Execução Local Automática em SQLite
- **WHEN** A variável POSTGRES_URL estiver ausente ou vazia no ambiente de execução
- **THEN** O servidor Express inicializa o banco SQLite local com modo WAL ativado e traduz dinamicamente os tipos de schema (JSONB para TEXT, UUID para TEXT, TIMESTAMP para DATETIME)

#### Scenario: Consultas e Atualizações Otimizadas via JSONB em Produção
- **WHEN** O servidor opera conectado ao PostgreSQL Neon com POSTGRES_URL configurado
- **THEN** Operações de consulta granular utilizam jsonb_path_query_array e atualizações parciais utilizam jsonb_set, reduzindo o tráfego de rede de ~150KB para ~2KB por requisição

### Requirement: Data Migration Resilience and Schema Sanitization
O sistema DEVE (MUST) assegurar retrocompatibilidade com versões anteriores da aplicação através de sanitização automática de schemas corrompidos ou desatualizados.

#### Scenario: Sanitização de Guilda Legada sem Quebra de Execução
- **WHEN** Dados de uma versão antiga da guilda com campos ausentes (ex: domínios sem conselheiros ou itens sem categoria) forem carregados
- **THEN** O mecanismo de migração preenche os campos ausentes com defaults seguros e normaliza a estrutura sem perda de integridade
