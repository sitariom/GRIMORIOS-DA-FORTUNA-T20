# Core Finances and Treasury Specification

## Purpose
Gerenciamento completo da tesouraria da guilda, suportando sistema monetário canônico de Tormenta20 com quatro tipos de moeda, fluxo de caixa imutável com categorização, conversão cambial automatizada e investimentos com rendimento e liquidez.

## Requirements

### Requirement: Multi-Currency Monetary System
O sistema DEVE (MUST) suportar quatro denominações monetárias oficiais de Arton: Peças de Cobre (TC), Peças de Prata (TP), Peças de Ouro (TO/T$) e Lingotes de Platina/Ouro (TL), com paridades fixas: 1 TO = 10 TP = 100 TC; 1 TL = 1.000 TO.

#### Scenario: Depósito em Moeda Específica
- **WHEN** Um usuário registra um depósito de 500 TO com motivo e membro associado
- **THEN** O saldo da guilda na carteira para a moeda TO deve ser incrementado em 500 e uma entrada no fluxo de caixa deve ser registrada com data, tipo 'deposit', valor, moeda e categoria financeira

#### Scenario: Saque com Verificação de Saldo
- **WHEN** Um usuário solicita um saque de moedas da tesouraria
- **THEN** O sistema deve validar se o saldo na moeda selecionada é suficiente antes de debitar, rejeitando a operação caso não haja fundos disponíveis

#### Scenario: Câmbio Automatizado entre Moedas
- **WHEN** A guilda realiza uma operação de câmbio convertendo 100 TO para TP
- **THEN** O saldo em TO deve ser decrementado em 100, o saldo em TP deve ser incrementado em 1.000, e a operação deve ser registrada no histórico

### Requirement: Immutable Cash Flow Ledger
Todas as entradas e saídas de valores DEVEM (MUST) gerar registros de transação imutáveis com carimbo de data/hora, membro responsável, categoria e motivo detalhado.

#### Scenario: Registro Automático por Ações do Sistema
- **WHEN** Ocorre uma venda de item do inventário, pagamento de salário de NPC, taxa de manutenção de base ou receita de domínio
- **THEN** Uma transação correspondente deve ser gerada automaticamente no livro razão, recalculando os saldos da carteira de forma atômica

### Requirement: Campaign Investments Management
O sistema DEVE (MUST) permitir alocação de fundos em investimentos com taxa de risco, liquidez e rendimentos periódicos vinculados à passagem de tempo no calendário da campanha.

#### Scenario: Aplicação e Resgate de Investimentos
- **WHEN** O regente aloca capital em um investimento ou solicita o resgate com rendimentos acumulados
- **THEN** Os valores correspondentes devem transitar entre a tesouraria líquida e a carteira de investimentos com atualização dos registros de auditoria
