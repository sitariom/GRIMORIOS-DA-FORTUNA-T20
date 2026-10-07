# Test Automation and Quality Coverage Specification

## Purpose
Expansão e consolidação da suíte automatizada de testes do projeto, assegurando execução contínua dos testes de integração do servidor Express e garantindo cobertura unitária abrangente sobre as regras financeiras, mecânicas de inventário e cronologia do calendário artoniano.

## Requirements

### Requirement: Integrated Server and Rate Limiting Pipeline
O script de testes principal (`npm test`) DEVE (MUST) incluir a execução automatizada dos testes de integração do servidor Express (`tests/server.test.ts`), validando o ciclo de vida da API, resposta de rotas e resiliência a picos de tráfego.

#### Scenario: Execução Unificada de Testes de Integração
- **WHEN** O desenvolvedor ou esteira de integração contínua dispara o comando `npm test`
- **THEN** O processo de teste deve inicializar o servidor em porta de teste isolada, verificar a disponibilidade dos endpoints principais de guildas e executar o teste de estresse de 120 requisições consecutivas sem bloqueios indevidos

#### Scenario: Encerramento Limpo e Sem Vazamento de Processos
- **WHEN** A bateria de testes do servidor conclui a execução com sucesso ou falha
- **THEN** O processo filho do servidor Express deve ser finalizado de forma atômica (SIGTERM) liberando a porta de rede utilizada

### Requirement: Comprehensive Financial and Exchange Unit Tests
O sistema DEVE (MUST) possuir uma suíte de testes unitários dedicada (`tests/financialActions.test.ts`) cobrindo as paridades monetárias canônicas de Tormenta20 e a integridade matemática da carteira da guilda.

#### Scenario: Validação Rigorosa de Câmbio de Moedas T20
- **WHEN** Uma conversão de moedas for simulada entre qualquer par de denominações (TC, TP, TO, TL)
- **THEN** Os saldos resultantes devem corresponder estritamente às razões oficiais (1 TO = 10 TP = 100 TC; 1 TL = 1.000 TO), garantindo que nenhum valor seja perdido por arredondamento

#### Scenario: Rejeição de Saques sem Fundos Disponíveis
- **WHEN** Uma tentativa de saque com valor superior ao saldo líquido na moeda especificada for submetida
- **THEN** O motor financeiro deve bloquear o débito, emitir erro descritivo e preservar o saldo inalterado

### Requirement: Inventory Encumbrance and Bulk Liquidation Unit Tests
O sistema DEVE (MUST) testar formalmente (`tests/inventoryActions.test.ts`) as fórmulas de capacidade de carga por Força, sobrecarga e liquidação em lote de equipamentos.

#### Scenario: Cálculo Canônico de Carga e Sobrecarga
- **WHEN** O inventário for consultado com membros de diferentes valores de Força (-1, 0, +2, +5)
- **THEN** Os limites de carga regular e sobrecarga máxima devem ser calculados com exatidão conforme as constantes BASE_CARRY e CARRY_PER_STR

#### Scenario: Liquidação em Lote com Margem de Negociação
- **WHEN** Um lote de múltiplos itens com quantidades variadas for vendido aplicando uma margem negociada (ex: 50%)
- **THEN** Os itens devem ser baixados do estoque e o total apurado em T$ deve ser creditado com precisão na carteira geral

### Requirement: Artonian Calendar and Chronology Unit Tests
O sistema DEVE (MUST) verificar formalmente (`tests/calendarActions.test.ts`) o avanço de tempo no calendário canônico de Arton.

#### Scenario: Passagem de Meses e Virada de Ano
- **WHEN** O calendário avança sucessivamente através dos 30 dias de cada um dos 12 meses nomeados em honra ao Panteão
- **THEN** A rotação mensal e o incremento do ano corrente devem ocorrer pontualmente no 31º dia de avanço

#### Scenario: Celebração do Dia de Nimb
- **WHEN** O estado do Dia de Nimb for comutado para ativo
- **THEN** O calendário deve registrar o estado caótico místico sem corromper a numeração dos dias regulares
