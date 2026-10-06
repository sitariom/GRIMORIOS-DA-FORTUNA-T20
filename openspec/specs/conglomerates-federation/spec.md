# Conglomerates and Federation Specification

## Purpose
Gerenciamento de federações geopolíticas de domínios, suportando criação de Alianças e Impérios, definição de capitais e papéis territoriais, relações de afinidade diplomática e mecânicas de integração pacífica ou subjugação militar.

## Requirements

### Requirement: Conglomerate Topology and Governance Models
O sistema DEVE (MUST) permitir agregar múltiplos domínios em um Conglomerado estruturado sob o modelo de Aliança (cooperação mútua) ou Império (hegemonia centralizada com domínio capital).

#### Scenario: Criação de Conglomerado com Domínio Capital
- **WHEN** Um regente funda um conglomerado especificando nome, modelo ('Alianca' ou 'Imperio') e o domínio capital
- **THEN** O conglomerado é criado no estado ativo, associando o domínio capital com papel de liderança e inicializando a lista de territórios federados

#### Scenario: Adesão Diplomática de Domínio com Suborno ou Tratado
- **WHEN** Um domínio independente é convidado a ingressar no conglomerado fornecendo valor de acordo ou suborno
- **THEN** O domínio é vinculado ao conglomerado, seu papel de membro é atribuído e o custo financeiro é debitado da capital caso estipulado

### Requirement: Domain Strategic Roles and Diplomatic Affinity
Membros do conglomerado DEVEM (MUST) possuir atribuições estratégicas (ex: Centro Produtivo, Bastião Militar, Entreposto Comercial ou Capital) e níveis de afinidade diplomática.

#### Scenario: Atribuição de Papel Estratégico a Domínio Federado
- **WHEN** A liderança do conglomerado altera a função estratégica de um domínio associado
- **THEN** O papel do domínio é atualizado no registro do conglomerado e os efeitos logísticos correspondentes são refletidos na administração regional

#### Scenario: Subjugação Territorial Forçada
- **WHEN** Um conglomerado imperial executa a subjugação de um domínio vizinho derrotado em batalha
- **THEN** O domínio alvo é forçosamente incorporado ao conglomerado com afinidade 'Subjugado', sujeitando sua renda e forças militares ao controle da capital
