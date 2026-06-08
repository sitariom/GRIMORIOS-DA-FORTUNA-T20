# Plano de Ação (PRD) - Domínios como Tracker/Gestor de Estado

## 1. Visão Geral e Filosofia
A aplicação deve atuar estritamente como uma **ferramenta de gestão contábil e de estado**. O aplicativo *não* deve assumir sucessos automáticos em testes de perícia (ex: assumir que a ação "Governar" passou só porque o usuário clicou no botão), nem deve realizar rolagens randômicas de dano ou perdas internamente. 

Toda rolagem de dados (RNG) e determinação de sucesso/falha pertence à plataforma externa (mesa física ou VTT). A aplicação apenas registrará os *custos declarados* e os *resultados alcançados*.

## 2. Gaps Atuais na Aplicação
1. **Ações com Custo vs. Sucesso**: Atualmente, clicar em "Governar" cobra o dinheiro e *imediatamente* sobe o nível do domínio. Na regra, o jogador gasta o dinheiro, faz o teste de Nobreza (CD variável), e só se passar ele sobe de nível. Se falhar, o dinheiro e a ação foram gastos em vão.
2. **Resolução de Batalhas e Crises**: A aplicação atual não possui uma interface para inserir os resultados exatos das Batalhas Simplificadas (ex: se perdeu 1d3+1 unidades, a aplicação precisa perguntar *quantas* e *quais* unidades o jogador rolou na mesa para deletar).
3. **Mecânicas Assíncronas (Caravançará)**: A construção *Caravançará* exige investir dinheiro num turno, e no *próximo turno de impostos*, rolar dados para ver o retorno. A aplicação não possui esse "tracker de pendências".
4. **Visibilidade de Bônus**: As construções fornecem dezenas de bônus passivos (+2 Iniciativa, +3 PM, etc). O jogador precisa ter uma visão unificada disso para aplicar em sua ficha na plataforma externa.

## 3. Plano de Implementação (Fases)

### Fase 1: Desacoplamento de Ação e Sucesso
- Modificar as Ações de Domínio (Governar, Extorquir, Festival, etc) para terem dois fluxos:
  1. **Declarar Ação**: O jogador clica na ação. A aplicação deduz o custo (ex: 5000 T$ ou 20 LO) e consome 1 Ação do Turno.
  2. **Registrar Resultado**: O jogador faz o teste no VTT. Depois, clica em "Registrar Sucesso" (o app aplica o benefício, ex: subir de nível) ou "Registrar Falha" (o app apenas encerra a ação, o custo já foi pago).

### Fase 2: Gestor de Batalhas e Perdas Direcionadas
- Criar um modal de **"Relatório de Batalha/Crise"**.
- O usuário seleciona o resultado que ocorreu na mesa (Ex: *Vitória com Perdas* ou *Derrota por 10+*).
- O modal exibirá *inputs manuais* baseados na regra: "Você sofreu uma Derrota. Role 4d6 LO na mesa e insira o valor perdido aqui. Selecione na lista abaixo qual construção foi destruída e quais tropas morreram".
- A aplicação então deduz exatamente o que foi inserido.

### Fase 3: Dashboard de Bônus do Regente
- Criar um painel (Sidebar ou Modal) chamado **"Resumo de Bônus Ativos"**.
- O sistema varrerá todas as construções erguidas, o nível da corte e os conselheiros contratados, gerando uma lista unificada em *bullet points* (ex: "Combate: +2 Iniciativa, Ataque Furtivo +1d6. Social: +2 Diplomacia. Magia: +4 PM"). Isso facilita o "copy-paste" do jogador para a sua ficha.

### Fase 4: Tracker de Caravanas e Eventos Pendentes
- Criar uma aba "Pendências do Domínio". 
- Se o usuário tem o *Caravançará*, ele pode "Enviar Caravana (Gastar X LO)". A aplicação guarda isso. No próximo turno, um aviso pedirá para o jogador resolver o teste de Nobreza e inserir o lucro obtido.

## 4. Critérios de Aceite
- Nenhuma ação que exige teste de perícia (Governar, Criar Domínio, Combater) deve aplicar o benefício automaticamente sem permitir que o jogador declare falha.
- Nenhum dano de LO ou unidades (1d4, 2d6, etc) deve ser gerado pelo `Math.random()` da aplicação; a UI deve pedir o input do usuário.
- O jogador consegue ver claramente todos os bônus que seu personagem recebe do domínio.