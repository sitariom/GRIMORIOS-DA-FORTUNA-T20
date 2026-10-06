# Characters and NPCs Roster Specification

## Purpose
Gerenciamento de aventureiros e comitiva de NPCs conforme as regras de Tormenta20, incluindo status de atividade de membros, carteiras individuais, Pontos Divinos do Panteão de Arton, papéis de parceiros T20, folha de pagamento automatizada, sistema de progressão de Afinidade (0 a 7 PA) e resolução de Última Demanda.

## Requirements

### Requirement: Member Adventurers Lifecycle and Divine Points
O sistema DEVE (MUST) gerenciar o registro dos heróis da guilda, seus estados de vitalidade (Ativo, Viajando, Ferido, Morto, Inativo), carteiras individuais com transferências e concessão de Pontos Divinos oriundos da devoção às divindades de Arton.

#### Scenario: Transferência de Recursos entre Tesouraria e Membro
- **WHEN** O tesoureiro transfere moedas da guilda para a carteira pessoal de um aventureiro
- **THEN** O saldo da tesouraria geral é deduzido, a carteira pessoal do membro é incrementada e o log de transferência é gravado

#### Scenario: Gestão de Pontos Divinos e Bênçãos
- **WHEN** Um membro canaliza ou recebe Pontos Divinos durante a campanha
- **THEN** O saldo de pontos de devoção é atualizado e as bênçãos ou aflições ativas são exibidas na ficha do personagem

### Requirement: Retinue NPCs and Payroll Engine
O sistema DEVE (MUST) catalogar NPCs vinculados ao grupo (Contratado, Aliado, Parceiro T20, Recrutado) com papéis especializados (Curandeiro, Combatente, Atirador, Guardião, Magivocador, etc.) e sua alocação física (Base, Domínio, Grupo ou Membro).

#### Scenario: Pagamento Automatizado da Folha Salarial
- **WHEN** A ação de pagamento da folha de pagamento de NPCs for disparada
- **THEN** O sistema calcula os salários apenas dos NPCs contratados com status 'Ativo', ignora aliados voluntários e parceiros sem custo salarial, debita o valor total em T$ da tesouraria e emite recibos no logbook

#### Scenario: Suspensão de Salário para NPCs Inativos ou em Missão
- **WHEN** Um NPC estiver com status diferente de 'Ativo' (ex: Em Missao, Ferido ou Inativo)
- **THEN** O sistema exclui o NPC do cálculo de desembolso salarial daquele ciclo

### Requirement: NPC Affinity System and Ultimate Quest
NPCs DEVEM (MUST) possuir trilha de afinidade individual por membro mensurada de 0 a 7 Pontos de Afinidade (PA), permitindo ativação de bônus exclusivos e desbloqueio da Última Demanda.

#### Scenario: Evolução de Afinidade por Interação
- **WHEN** Um membro interage com um NPC realizando ações cotidianas (+1 PA) ou alinhadas com suas preferências pessoais (+2 PA)
- **THEN** A pontuação de afinidade com o membro é incrementada até o teto estrito de 7 PA

#### Scenario: Ativação de Bônus de Afinidade por Membro
- **WHEN** Um aventureiro ativa o benefício de vínculo com um NPC de sua confiança
- **THEN** O sistema garante que cada membro usufrua de no máximo um bônus de afinidade ativo simultaneamente, substituindo qualquer benefício anterior

#### Scenario: Conclusão da Última Demanda (Ultimate Quest)
- **WHEN** O grupo tenta cumprir a Última Demanda de um NPC cuja afinidade atingiu a pontuação máxima de 7 PA
- **THEN** A missão pessoal é completada com sucesso, concedendo recompensa permanente e consolidando o vínculo leal do personagem com a guilda
