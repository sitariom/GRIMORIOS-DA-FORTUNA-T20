# Inventory and Logistics Specification

## Purpose
Gerenciamento de inventário, equipamentos e logística da guilda conforme as regras de carga e itens de Tormenta20, com categorização completa em 7 verticais, níveis de raridade de Comum a Artefato, motor de cálculo de carga por Força com sobrecarga, operações de compra, venda com taxa de mercado e histórico de movimentações.

## Requirements

### Requirement: Item Categorization and Rarity Taxonomy
O sistema DEVE (MUST) suportar as 7 categorias oficiais de itens (Armas, Armaduras, Consumíveis, Itens Gerais, Itens Mágicos, Tesouros e Recursos Naturais), subcategorias especializadas, mapeamento de tipos canônicos e níveis de raridade de Comum a Artefato.

#### Scenario: Cadastro de Item com Metadados Completos
- **WHEN** Um usuário cadastra um item especificando nome, categoria, tipo, raridade, quantidade, valor em T$ e peso em espaços
- **THEN** O item é adicionado ao inventário da guilda com ID único, data de registro e sincronizado nas visualizações da tesouraria

### Requirement: Carrying Capacity and Encumbrance Engine
O sistema DEVE (MUST) calcular o limite de carga e carga máxima baseado no valor de Força dos membros e bônus de transporte, aplicando multiplicadores de sobrecarga conforme as regras de Tormenta20.

#### Scenario: Cálculo de Limite de Carga e Sobrecarga
- **WHEN** O inventário de um aventureiro ou grupo é consultado informando seu modificador de Força
- **THEN** O sistema calcula a capacidade de carga regular (BASE_CARRY + Força * CARRY_PER_STR) e o limite absoluto de sobrecarga, emitindo sinalização visual caso o total de espaços ultrapasse a capacidade permitida

### Requirement: Inventory Liquidation and Cash Inflow
O sistema DEVE (MUST) permitir venda individual ou em lote de itens, aplicando porcentagens negociadas sobre o valor de tabela (ex: 50% para itens comuns, 100% para tesouros).

#### Scenario: Venda de Lote de Itens com Crédito Automático
- **WHEN** O tesoureiro vende um conjunto de itens com uma margem negociada (ex: 50% do valor de face) indicando o membro negociador
- **THEN** Os itens vendidos têm suas quantidades reduzidas ou são removidos do inventário, o valor total em T$ apurado é creditado na carteira da guilda e uma transação de venda é registrada no fluxo de caixa

#### Scenario: Retirada de Item com Registro de Destino
- **WHEN** Um membro retira um item do baú comunitário para uso em missão com motivo justificado
- **THEN** A quantidade disponível no inventário geral é decrementada e um log de retirada é associado ao histórico do item e do membro
