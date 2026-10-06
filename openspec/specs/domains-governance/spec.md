# Domains and Governance Specification

## Purpose
Governança de domínios e senhorios territoriais segundo as regras de Domínios de Tormenta20, englobando reivindicação por terreno, tipos de corte, níveis de popularidade, decretos governamentais em duas fases, conselheiros, catálogo de edifícios e tropas militares, caravanas, eventos de crise e revoltas.

## Requirements

### Requirement: Domain Claiming and Terrain Dynamics
Domínios territoriais DEVEM (MUST) ser categorizados por tipo de terreno canônico de Arton (Planície, Floresta, Montanha, Colina, Pântano, Deserto, Tundra, Subterrâneo), determinando teto de nível, potencial mágico e bônus conforme raças ligadas à natureza ou ao subterrâneo e acesso aquático.

#### Scenario: Reivindicação de Novo Domínio
- **WHEN** Um regente reivindica um território especificando nome, regente, terreno, acesso à água e vínculos raciais
- **THEN** O domínio é criado com tesouraria em LO (Lingotes de Ouro de Domínio), nível inicial 1, corte inicial e status de popularidade neutro, deduzindo o custo de reivindicação caso payCost seja verdadeiro

#### Scenario: Domínios Coexistentes e Místicos
- **WHEN** Um domínio for configurado como Místico ou coexistente no subterrâneo sob outro território de superfície
- **THEN** O sistema associa o identificador de co-relação territorial e calcula o potencial mágico adicional sem conflito de soberania

### Requirement: Governance Action Engine and Decrees
Ações de governança e decretos de domínio DEVEM (MUST) ser executados em um fluxo de duas etapas: 1) Pagamento e alocação de recursos de governança; 2) Rolagem de dados e resolução dos efeitos de renda, manutenção e ordem pública.

#### Scenario: Execução de Ação Governar
- **WHEN** O regente inicia uma ação governamental (ex: Cobrar Impostos, Festividades ou Obras Públicas)
- **THEN** Na fase 'pay' o custo em LO é debitado e o status da ação do turno é marcado; na fase 'success' com o resultado do dado é aplicada a tabela de resultados modificada pela popularidade e corte do domínio

#### Scenario: Turno de Domínio e Reinicialização
- **WHEN** O turno mensal do domínio é encerrado ou resetado
- **THEN** As ações executadas são limpas para o próximo ciclo de governo e a manutenção geral de corte, exércitos e infraestrutura é apurada

### Requirement: Infrastructure Buildings and Military Units
O sistema DEVE (MUST) gerenciar construções civis e fortificações com catálogo oficial T20, calculando o valor agregado de Fortificação, e unidades militares com limites baseados no nível e estruturas do território.

#### Scenario: Recrutamento de Unidades Militares com Pré-requisitos
- **WHEN** O regente recruta uma tropa militar (ex: Arqueiros, Cavalaria ou Infantaria Pesada)
- **THEN** O sistema verifica se o domínio possui os edifícios obrigatórios (ex: Quartel, Cavalariça) e slots militares disponíveis, debitando o custo de alistamento e atualizando o custo de manutenção futura

#### Scenario: Manutenção e Rebaixamento por Inadimplência
- **WHEN** A manutenção mensal das forças armadas e corte não puder ser quitada pela tesouraria de LO
- **THEN** O sistema aplica perda de tropas militares, rebaixa o nível da corte para Miserável e deflagra risco de revolta popular

### Requirement: Advisors and Regional Caravans
O domínio DEVE (MUST) permitir alocação de conselheiros especializados com bônus de perícias e despacho de caravanas comerciais para geração de divisas externas.

#### Scenario: Despacho e Resolução de Lucro de Caravana
- **WHEN** Uma caravana comercial é despachada como tarefa pendente e posteriormente resolvida no destino
- **THEN** O sistema processa o resultado da viagem, credita o lucro líquido obtido em LO na tesouraria do domínio e encerra a tarefa pendente

#### Scenario: Revolta Popular e Crises
- **WHEN** O nível de popularidade atinge o estágio de Revolta ou ocorre uma crise aleatória na tabela de eventos
- **THEN** Um teste de ordem pública é exigido; se falhar, o domínio sofre bloqueio de ações de renda, danos a estruturas e risco de perda de nível de domínio
