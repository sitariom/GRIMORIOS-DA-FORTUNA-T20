# Plano de Testes Funcionais e Regressivos: Domínios (Tormenta20)

Este documento estabelece os Critérios de Aceite e Cenários de Teste (BDD - Behavior Driven Development) para garantir que a aplicação atua como um Tracker perfeito das regras de Domínio descritas no livro Tormenta20 (Jogo do Ano, Cap. 4).

---

## 1. Módulo: Criação de Domínios
**Critérios de Aceite:**
- O jogador deve poder criar um Domínio "Normal" (custa T$ 5.000) ou "Conquistado" (Grátis).
- O jogador deve poder assinalar a flag "Domínio Místico".
- Domínios normais iniciam no Nível 1, Popularidade "Tolerado", Corte Inexistente, sem Tesouro.
- Domínios místicos iniciam no Nível 1, Popularidade "N/A", Corte Inexistente, sem Tesouro.

### Cenários de Teste
- **Cenário 1.1:** Criar domínio normal sem fundos.
  - *Dado* que o cofre da Guilda possui 0 T$
  - *Quando* o usuário clica em "Reivindicar (Custo: T$ 5.000)" e submete
  - *Então* o sistema exibe erro de fundos insuficientes e não cria o domínio.
- **Cenário 1.2:** Criar domínio místico por conquista.
  - *Dado* que o usuário seleciona "Conquista" e marca "Domínio Místico"
  - *Quando* submete o formulário
  - *Então* o domínio é criado, 0 T$ é descontado, e o card exibe a tag "MÍSTICO" e Popularidade "N/A".

---

## 2. Módulo: Ações de Domínio (Turno e Limitações)
**Critérios de Aceite:**
- O jogador possui exatamente 2 ações por turno.
- As ações de Extorquir, Convocar, Impostos, Corte (Aumentar/Diminuir), Festival e Governar consomem 1 ação.
- A ação de Câmbio (Converter) e Manutenção NÃO consomem ações do turno.
- Se o domínio estiver em Revolta, ações que dependem do povo (Impostos, Governar, Festival) são bloqueadas.

### Cenários de Teste
- **Cenário 2.1:** Bloqueio por falta de ações.
  - *Dado* que o contador de Ações de Domínio está em 0/2
  - *Quando* o usuário clica no botão "Governar" ou "Extorquir"
  - *Então* o botão deve estar desabilitado (cinza) e impossível de ser clicado.
- **Cenário 2.2:** Bloqueio por Revolta.
  - *Dado* que o domínio possui a flag "Revolta" ativada
  - *Quando* o usuário olha para os botões "Governar", "Festival" e "Impostos"
  - *Então* eles devem estar desabilitados.
- **Cenário 2.3:** Renovação de Turno.
  - *Dado* que as ações do domínio estão em 0/2
  - *Quando* o usuário clica em "Reiniciar Turno"
  - *Então* as ações retornam para 2/2 em todos os domínios.

---

## 3. Módulo: Fluxo Desacoplado (Pagar Custo vs Sucesso)
**Critérios de Aceite:**
- Ações com custo e teste devem primeiro cobrar o LO/T$ e gastar a ação do turno.
- O bônus mecânico só é aplicado se o usuário clicar em "Passei no Teste".

### Cenários de Teste
- **Cenário 3.1:** Falha no Teste de Governar.
  - *Dado* um domínio Nível 1 (Custo para governar: 20 LO) com tesouro de 50 LO
  - *Quando* o usuário clica em Governar -> "Declarar Ação (Pagar Custo)"
  - *Então* o Tesouro cai para 30 LO e 1 Ação de Turno é gasta.
  - *Quando* o usuário clica em "Falhei na Rolagem (Encerrar)"
  - *Então* o nível do domínio se mantém em 1. O dinheiro não é devolvido.
- **Cenário 3.2:** Ação bloqueada em Domínio Místico.
  - *Dado* um domínio Místico
  - *Quando* o usuário abre o modal de "Extorquir" e clica em Pagar Custo
  - *Então* a interface devolve erro "Domínios Místicos não podem ser extorquidos" e a ação não é consumida.

---

## 4. Módulo: Infraestrutura (Construções)
**Critérios de Aceite:**
- O limite de construções é Nível do Domínio × 3.
- Domínios normais podem construir qualquer obra do catálogo.
- Domínios místicos só podem construir obras cuja Perícia seja Misticismo ou Religião.
- Pré-requisitos devem ser respeitados (Ex: Não se pode construir *Muralha* sem antes construir *Paliçada*).

### Cenários de Teste
- **Cenário 4.1:** Restrição de Domínio Místico.
  - *Dado* um domínio Místico
  - *Quando* o usuário tenta construir "Taverna" (Perícia: Enganação)
  - *Então* o sistema rejeita a construção e emite alerta.
- **Cenário 4.2:** Restrição de Nível (Capacidade Máxima).
  - *Dado* um domínio Nível 1 (Max 3 construções) que já possui 3 construções
  - *Quando* o usuário tenta adicionar a 4ª construção
  - *Então* o botão do catálogo fica desabilitado e a tentativa manual emite alerta de limite atingido.

---

## 5. Módulo: Poder Militar (Unidades)
**Critérios de Aceite:**
- Limite de recrutamento por Ação é igual ao Nível do Domínio.
- Pré-requisitos de edifícios devem ser respeitados (Ex: "Arqueiros" requer "Pista de Arquearia").
- O valor de "Manutenção" da tropa deve somar na Manutenção total do domínio.

### Cenários de Teste
- **Cenário 5.1:** Falta de pré-requisito militar.
  - *Dado* um domínio que não possui "Pista de Arquearia"
  - *Quando* o usuário tenta alistar "Arqueiros"
  - *Então* o sistema exibe alerta exigindo a construção e não realiza o débito.
- **Cenário 5.2:** Cálculo de Manutenção.
  - *Dado* um domínio sem custo de manutenção
  - *Quando* o usuário alista "Cavaleiros" (Manutenção: 1 LO)
  - *Então* o card do domínio passa a exibir Manutenção: 1 LO.

---

## 6. Módulo: Corte e Conselheiros
**Critérios de Aceite:**
- Corte Inexistente/Pobre = 0 Conselheiros. Comum = 1. Rica = 3.
- Reduzir o nível da corte ou falhar em pagar a manutenção deve demitir o excesso de conselheiros do topo da lista para a base.

### Cenários de Teste
- **Cenário 6.1:** Limite da Corte Rica.
  - *Dado* um domínio com Corte "Rica"
  - *Quando* o usuário nomeia 3 conselheiros
  - *Então* a UI remove o formulário de nomeação e não permite o 4º.
- **Cenário 6.2:** Rebaixamento automático.
  - *Dado* um domínio Corte "Rica" com 3 conselheiros
  - *Quando* o usuário usa a ação "Corte -> Diminuir Corte" (cai para Comum)
  - *Então* 2 conselheiros são automaticamente removidos da lista (mantendo apenas 1).

---

## 7. Módulo: Crises, Perdas e Danos
**Critérios de Aceite:**
- O botão de Perdas/Danos permite subtrair LO, Nível, Unidades e Construções manualmente de forma simultânea.
- A exclusão de uma construção deve recalcular a Fortificação Total.
- A exclusão de uma unidade deve reduzir o custo de manutenção no próximo turno.

### Cenários de Teste
- **Cenário 7.1:** Derrota por Ataque de Dragão.
  - *Dado* um domínio Nível 2, com 1 Forte (+2 Fortificação) e 1 unidade de Arqueiros.
  - *Quando* o usuário abre o modal de Perdas, insere "1" Nível Perdido, e marca o "Forte" e os "Arqueiros" para serem destruídos, e confirma.
  - *Então* o domínio volta ao Nível 1. A Fortificação cai para 0. A unidade de arqueiros desaparece.

---

## 8. Módulo: Conversão e Finanças (Tesouro Real)
**Critérios de Aceite:**
- Taxa de câmbio: T$ 1.000 = 1 LO.
- Converter de T$ para LO exige que o Cofre da Guilda tenha tibares de sobra.
- A conversão é instantânea e não requer o passo de "Sucesso na Mesa".

### Cenários de Teste
- **Cenário 8.1:** Câmbio direto.
  - *Dado* que a guilda tem 2.000 T$ no cofre e o Domínio tem 0 LO.
  - *Quando* o usuário abre "Converter", escolhe T$ -> LO, digita 2 LO e Paga o Custo.
  - *Então* a guilda fica com 0 T$ e o Domínio com 2 LO. O modal exibe sucesso imediatamente sem a etapa de "Sucesso na Mesa".
