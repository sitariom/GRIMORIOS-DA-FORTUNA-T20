# Documento de Requisitos do Produto (PRD) - Domínios Tormenta20

## 1. Visão Geral e Contexto
O usuário forneceu as diretrizes oficiais de Tormenta20 (Jogo do Ano) sobre a gestão de Domínios, incluindo Criação, Cortes, Popularidade e Conselheiros. 
Fizemos a auditoria do código atual (`types.ts`, `constants.ts`, `useDomainActions.ts` e `DomainsPage.tsx`) e comparamos com as regras fornecidas.

## 2. O que já está perfeitamente implementado (✓)
- **Criação e Características Base**: Nome, regente, nível, terreno (com limitadores de nível máximo).
- **Custo e Câmbio**: Sistema de conversão de Tibares (T$) para Lingotes de Ouro (LO).
- **Popularidade**: Odiado a Adorado (modificadores de -5 a +2).
- **Mecânica de Revolta**: Implementada caso a popularidade caia abaixo de Odiado.
- **Construções e Unidades Militares**: Catálogo completo já transposto com custos e pré-requisitos.
- **Fortificação**: Computação automática da soma dos bônus defensivos das construções.

## 3. Gap Analysis (O que falta ou possui inconsistências) (X)

### 3.1. Sistema de Conselheiros (Não implementado)
- **Regra**: Uma Corte *Comum* fornece 1 Conselheiro. Uma Corte *Rica* fornece 3 Conselheiros. Eles fornecem bônus baseados em suas profissões (Bispo/Religião, Embaixador/Diplomacia, etc.).
- **Situação Atual**: A UI apenas exibe "+1 Conselheiro" como um texto de bônus, mas não existe banco de dados, tipo de interface ou funcionalidade visual para selecionar, contratar ou demitir Conselheiros.

### 3.2. Duplicidade e Inconsistência na "Ação Governar" (Bug/Refatoração)
- **Regra**: Subir o nível do domínio usa a Ação de Domínio *Governar*.
- **Situação Atual**: A aplicação possui dois botões que fazem a mesma coisa de formas diferentes:
  1. O botão "Expandir Fronteiras" aciona a função `levelUpDomain` (cobrando `Nível * 20 LO`).
  2. O botão de Ação "Governar" aciona `executeDomainAction('govern')` (cobrando `5 * (Nível + 1) LO`).
- **Problema**: Duplicidade de código gerando custos diferentes para a mesma ação no sistema.

## 4. Plano de Implementação Proposto
Se aprovado, o Desenvolvedor (`karpathy-coder`) executará os seguintes passos:

1. **Atualização de Modelos (`types.ts`)**: 
   - Criar interface `Advisor` (id, nome, cargo, perícia).
   - Adicionar a propriedade `advisors: Advisor[]` ao modelo de `Domain`.
2. **Atualização de Catálogo (`constants.ts`)**:
   - Criar o array de cargos oficiais de Conselheiros (Bispo, Capitão da Guarda, Embaixador, etc.).
3. **Atualização de Lógica (`useDomainActions.ts`)**:
   - Criar funções `addAdvisor` e `removeAdvisor`.
   - Incluir verificação no `decreaseCourt` e `payMaintenance` para que, se a corte cair, os conselheiros excedentes sejam perdidos automaticamente.
   - Refatorar a ação de subir de nível: Eliminar a função `levelUpDomain` e unificar tudo na Ação de Domínio `govern` com o custo e regras unificados.
4. **Atualização de Interface (`DomainsPage.tsx`)**:
   - Criar uma nova aba ou seção (Modal) focada na **Corte & Conselheiros**, permitindo que o usuário escolha os conselheiros quando a corte for elevada para Comum ou Rica.
   - Consolidar a UI do botão "Expandir Fronteiras" para apontar para o modal da Ação Governar.