# World, Campaign and Chronicles Specification

## Purpose
Gerenciamento da cronologia e ambientação do mundo de Arton, incluindo calendário canônico de Tormenta20 com 12 meses, dias da semana e Nimb Day, quadro de missões, reputação com facções e pontos de interesse, e crônicas narrativas da campanha.

## Requirements

### Requirement: Arton Canonical Calendar and Time Progression
O sistema DEVE (MUST) implementar a contagem de tempo oficial do cenário de Tormenta20, com 12 meses nomeados segundo as divindades, dias da semana canônicos, celebração anual do Dia de Nimb e avanço cronológico.

#### Scenario: Passagem de Tempo e Avanço de Dias
- **WHEN** O mestre da campanha avança o calendário em N dias
- **THEN** O sistema recalcula o dia do mês, o mês corrente e o ano de Arton, atualiza o dia da semana correspondente e aciona verificações de ciclos periódicos caso aplicável

#### Scenario: Ativação do Dia de Nimb (Nimb Day)
- **WHEN** A chave do Dia de Nimb for ativada no calendário
- **THEN** O sistema sinaliza o estado caótico festivo onde as regras de tempo convencionais são suspensas para celebração mística de Nimb

### Requirement: Quest Board Management
O sistema DEVE (MUST) disponibilizar um quadro de missões com rastreamento de tarefas ativas, recompensas financeiras ou materiais, membros alocados e status de cumprimento.

#### Scenario: Atualização de Status e Recompensa de Missão
- **WHEN** Uma missão é concluída pelo grupo de heróis
- **THEN** O status da quest é alterado para 'Concluída', os valores de recompensa podem ser incorporados à tesouraria e o feito é registrado no diário de campanha

### Requirement: Factions Reputation and Regional Points of Interest
O sistema DEVE (MUST) rastrear a reputação da guilda perante facções e reinos de Arton com tiers escalonados (Hostil a Reverenciado), além de catalogar Pontos de Interesse (POIs) explorados pelo grupo.

#### Scenario: Ajuste de Reputação com Facção
- **WHEN** A guilda cumpre um contrato ou causa um incidente diplomático com uma facção
- **THEN** O valor numérico de reputação é ajustado, o nível de prestígio correspondente é recalculado e os bônus ou sanções ativas são exibidos aos jogadores
