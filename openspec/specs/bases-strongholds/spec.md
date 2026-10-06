# Bases and Strongholds Specification

## Purpose
Gerenciamento de bases operacionais, fortalezas e negócios empresariais segundo as regras de QG e Empreendimentos de Tormenta20, com suporte a 7 tipos de bases, portes de Mínima a Suprema, slots de construção, cômodos, mobílias, manutenção periódica, gárgulas animadas e ativos comerciais com evolução de níveis 1 a 7.

## Requirements

### Requirement: Stronghold Portes and Types Hierarchy
O sistema DEVE (MUST) implementar os portes (Mínima, Pequena, Média, Grande, Enorme, Colossal, Suprema) com seus respectivos slots de construção (1 a 12), custos de manutenção base e testes exigidos de Nobreza/Engenharia (CD 15 a 35). Tipos suportados incluem Centro de Poder, Empreendimento, Esconderijo, Fortificação, Móvel, Residência e Negócio.

#### Scenario: Construção de Base com Teste de Nobreza
- **WHEN** O grupo tenta construir uma nova base e fornece a rolagem de teste contra a CD do porte
- **THEN** Se a rolagem for igual ou superior à CD, a base é criada com slots disponíveis e custo debitado; caso contrário, a construção falha consumindo apenas materiais parciais

#### Scenario: Compra Imediata de Base Pronta
- **WHEN** O grupo adquire uma base pronta pelo método 'buy'
- **THEN** A base é concedida imediatamente sem necessidade de rolagem de dados, aplicando o multiplicador de custo triplicado sobre o valor base

#### Scenario: Upgrade de Porte da Base
- **WHEN** O regente executa o aprimoramento de porte de uma base existente (ex: Mínima para Modesta)
- **THEN** O sistema valida os pré-requisitos, debita a diferença de custo, executa o teste de CD e expande a quantidade máxima de slots de cômodos suportados

### Requirement: Rooms and Furnitures Management
Bases DEVEM (MUST) suportar cômodos que ocupam slots e mobílias que concedem bônus específicos, respeitando limites e compatibilidades de instalação.

#### Scenario: Adição e Movimentação de Mobílias
- **WHEN** Uma mobília é adquirida para um cômodo específico ou transferida para outro cômodo da mesma base
- **THEN** O sistema valida a compatibilidade do cômodo, o limite máximo de mobílias permitidas e debita o custo em T$ da tesouraria caso aplicável

#### Scenario: Manutenção e Danificação de Cômodos
- **WHEN** A manutenção mensal da base for ignorada ou falhar por falta de fundos
- **THEN** Um cômodo aleatório deve ser marcado como danificado, suspendendo seus benefícios até que seja reparado pelo custo equivalente a 50% do valor de construção

#### Scenario: Gárgulas Animadas de Defesa
- **WHEN** O grupo adiciona uma gárgula animada de proteção a uma fortificação
- **THEN** O sistema aplica os limites máximos de gárgulas por porte e adiciona a taxa de vigilância mágica à manutenção regular

### Requirement: Business Enterprises and Profit Engine
Bases do tipo Negócio DEVEM (MUST) permitir associação a um dos 45 ativos comerciais oficiais de Tormenta20, progressão de nível de 1 a 7 e coleta de lucros mensais.

#### Scenario: Coleta de Lucros Mensais de Negócio
- **WHEN** O regente realiza a coleta mensal de rendimentos do negócio com a rolagem de dados informada
- **THEN** O sistema calcula o retorno com base no nível do empreendimento (Nível 1 a 7) e tabela oficial T20, creditando o lucro líquido na tesouraria da guilda e registrando no fluxo de caixa
