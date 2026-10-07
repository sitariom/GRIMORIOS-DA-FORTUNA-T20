# Architecture Refactoring and Modularity Specification

## Purpose
Padronização arquitetural da camada de gerenciamento de estado e robustez de segurança nas APIs, contemplando a extração do hook desacoplado de Conglomerados, modularização interna do hook monólito de Domínios e parametrização estrita de consultas SQL contra injeção de parâmetros.

## Requirements

### Requirement: Decoupled Conglomerate Management Hook
O sistema DEVE (MUST) isolar as operações de gestão geopolítica de Conglomerados em um hook especializado `useConglomerateActions.ts` sob `context/hooks/`, removendo a lógica inline acumulada no `GuildContext.tsx` e unificando o padrão de design dos demais 9 hooks do projeto.

#### Scenario: Execução de Operações de Conglomerado via Hook Dedicado
- **WHEN** O usuário cria uma aliança, adiciona um domínio federado ou executa uma ação de subjugação territorial
- **THEN** O `GuildContext` deve delegar a mutação para o `useConglomerateActions`, mantendo as assinaturas de funções inalteradas e garantindo a gravação de logs de auditoria correspondentes

#### Scenario: Redução de Complexidade do Contexto Central
- **WHEN** O hook de conglomerados for desacoplado
- **THEN** A contagem de linhas do arquivo `GuildContext.tsx` deve ser reduzida em pelo menos 180 linhas, mantendo 100% de retrocompatibilidade com os consumidores da interface `GuildContextData`

### Requirement: Internal Sub-Modular Domain Logic Decomposition
O hook `useDomainActions.ts` DEVE (MUST) decompor internamente sua lógica de mais de 2.000 linhas em módulos utilitários coesos (`domainGovernance`, `domainMilitary`, `domainLogistics`), preservando integralmente sua interface pública e contratos de retorno.

#### Scenario: Preservação de Contrato da Ação Governar
- **WHEN** A função executeDomainAction for acionada em suas duas fases ('pay' e 'success')
- **THEN** O submódulo de governança processa as tabelas de dados, custos e bônus mantendo exatamente os mesmos resultados e efeitos de popularidade

#### Scenario: Isolamento de Funções de Unidades Militares e Logística
- **WHEN** Unidades militares forem adicionadas, removidas ou caravanas forem resolvidas
- **THEN** O processamento de dados e limites de terreno deve ser executado pelos respectivos submódulos sem interdependências circulares

### Requirement: Strict SQL Query Parameterization Hardening
Todas as rotas de API e funções de persistência DEVEM (MUST) utilizar parametrização rigorosa através de template tags `sql` ou parâmetros preparados, eliminando qualquer concatenação ou interpolação de strings em consultas de banco de dados.

#### Scenario: Execução de Consulta Granular com Parâmetros Tipados
- **WHEN** A rota /api/guilds/:id/:subResource executa consultas com filtros ou seletores de recursos parciais
- **THEN** A instrução SQL enviada ao motor de banco (PostgreSQL ou SQLite) deve utilizar marcadores de posição parametrizados ($1, $2 ou ?), rejeitando qualquer interpolação direta de valores fornecidos pelo cliente
