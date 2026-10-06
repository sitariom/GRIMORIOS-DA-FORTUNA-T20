# Regras de Negócio e Mecânicas Canônicas de Tormenta20

Este documento reúne todas as especificações de regras de negócio, tabelas de referência e fórmulas matemáticas implementadas no **Grimório da Fortuna T20**.

---

## 1. Sistema Monetário e Tesouraria

### 1.1 Paridades Monetárias Canônicas de Arton
O sistema monetário padrão de Arton opera com quatro denominações com taxas de conversão automáticas:

| Moeda | Abreviação | Valor em TO / T$ | Taxa de Conversão |
|---|---|---|---|
| Peça de Cobre | TC | 0,01 T$ | 100 TC = 1 T$ |
| Peça de Prata | TP | 0,10 T$ | 10 TP = 1 T$ |
| Peça de Ouro | TO / T$ | 1,00 T$ | Moeda base de Arton |
| Lingote de Platina/Ouro | TL | 1.000,00 T$ | 1 TL = 1.000 T$ |

- **Moeda de Domínio (LO)**: Lingotes de Ouro de Domínio utilizados para a gestão macroeconômica e militar territorial (1 LO = 100 T$).

### 1.2 Regras do Fluxo de Caixa
- **Imutabilidade**: Cada entrada ou saída gera uma transação com ID único, timestamp, categoria contábil (`income`, `expense`, `transfer`, `investment`), moeda de origem e motivo descritivo.
- **Auditoria de Operações**: Transações disparadas por outros subsistemas (vendas no inventário, salários de NPCs, manutenção de bases e receitas de negócios) são registradas automaticamente.

---

## 2. Bases e Quartéis-Generais (QG)

O sistema implementa integralmente as regras de Quartéis-Generais e Fortalezas de Tormenta20.

### 2.1 Portes e Limites Estruturais
Cada base possui um Porte que dita seus slots de cômodos, custos de manutenção e a Classe de Dificuldade (CD) para construção via teste de Nobreza ou Engenharia:

| Porte | Slots de Construção | CD de Construção | Custo Base Estimado |
|---|---|---|---|
| Mínima | 1 slot | CD 15 | T$ 500 |
| Pequena (Modesta) | 3 slots | CD 20 | T$ 1.500 |
| Média (Básica) | 5 slots | CD 25 | T$ 4.000 |
| Grande (Formidável) | 8 slots | CD 28 | T$ 10.000 |
| Enorme | 10 slots | CD 32 | T$ 25.000 |
| Suprema (Colossal) | 12 slots | CD 35 | T$ 60.000 |

### 2.2 Tipos de Bases
1. **Centro de Poder**: Focado em influência política, diplomacia e rituais.
2. **Empreendimento**: Focado em geração comercial e logística.
3. **Esconderijo**: Focado em furtividade, segurança contra espionagem e rotas de fuga.
4. **Fortificação**: Focado em defesa militar, muralhas e resistência a cercos.
5. **Móvel**: Carroças reforçadas, navios voadores ou embarcações navais.
6. **Residência**: Acomodação confortável para repouso e descanso dos heróis.
7. **Negócio**: Estrutura especializada na gestão dos 45 ativos comerciais oficiais T20.

### 2.3 Métodos de Aquisição e Upgrade
- **Construção (`construct`)**: Requer teste de perícia contra a CD do porte. Sucesso aplica a base normalmente; falha consome materiais parciais.
- **Compra Direta (`buy`)**: Não exige rolagem de dados, mas o custo é **triplicado** (3x o valor de tabela).
- **Recompensa (`reward`)**: Aquisição narrativa gratuita via missão ou decreto régio.
- **Reforma Estrutural**: Permite mudar o tipo da base ou reconfigurar cômodos mediante novo teste de perícia.

### 2.4 Manutenção e Danos a Cômodos
- A manutenção mensal deve ser quitada da tesouraria da guilda.
- **Falta de Pagamento**: Se a manutenção for ignorada (`skip`), um cômodo aleatório é marcado como **Danificado**, suspendendo todos os seus bônus até que seja consertado.
- **Reparo de Cômodo**: O reparo exige o pagamento de **50% do custo original** de construção do cômodo.

---

## 3. Empreendimentos e Negócios T20

### 3.1 Catálogo de 45 Ativos Comerciais Oficiais
O sistema modela os 45 ativos comerciais oficiais de Arton (Tavernas, Alquimias, Ferrarias, Minerações, Vinícolas, Estábulos, Mercados, Guildas Mercantis, etc.).

### 3.2 Níveis e Lucros Mensais
- Negócios evoluem do **Nível 1 até o Nível 7**.
- A coleta mensal de lucros utiliza rolagens de Ofício ou Negócios baseadas no nível do empreendimento:
  $$\text{Lucro Mensal} = \text{Tabela T20}(\text{Nível}) + \text{Modificador de Rolagem}$$
- Os rendimentos apurados são creditados imediatamente na tesouraria da guilda.

---

## 4. Domínios Territoriais e Governança

### 4.1 Tipos de Terrenos e Limitações
A geografia de Arton impõe limites ecológicos e mágicos ao desenvolvimento dos senhorios:

| Terreno | Nível Máximo Base | Potencial Mágico |
|---|---|---|
| Planície | Nível 5 | Médio |
| Colina | Nível 4 | Médio |
| Floresta | Nível 4 (Nível 5 para Elfos/Silvestres) | Alto |
| Montanha | Nível 3 (Nível 4 para Anões) | Médio |
| Pântano | Nível 2 | Alto |
| Deserto | Nível 2 | Baixo |
| Tundra | Nível 2 | Baixo |
| Subterrâneo | Nível 3 (Nível 4 para Raças Subterrâneas) | Alto |

- **Acesso à Água**: Domínios com litoral ou rios navegáveis recebem bônus de comércio e expansão.
- **Domínios Coexistentes**: Um domínio subterrâneo (como Doherimm ou ermos escuros) pode coexistir sob as mesmas coordenadas geográficas de um senhorio de superfície sem conflito de soberania.

### 4.2 Cortes e Popularidade
- **Níveis de Corte**: Miserável, Modesta, Confortável, Rica, Magnífica. Cortes elevadas geram prestígio, mas exigem manutenção mensal substancial em LO.
- **Níveis de Popularidade**: Revolta (-5), Descontente (-2), Neutro (0), Satisfeito (+2), Idolatrado (+5). Modificam todas as rolagens governamentais.

### 4.3 Ação Governar em Duas Fases
1. **Fase de Pagamento (`pay`)**: O regente declara o decreto governamental (Cobrar Impostos, Promover Obras, Manobras Militares, Festividades), deduz o custo operacional em LO e bloqueia a ação naquele turno.
2. **Fase de Resolução (`success`)**: Com base no resultado do dado d20 somado a bônus de conselheiros e popularidade, aplica-se a tabela de efeitos de receita, ordem pública e expansão.

### 4.4 Forças Militares e Fortificação
- **Edifícios Civis e Militares**: Quartéis, Muralhas, Torres de Vigia, Mercados, Templos e Monumentos contribuem para o índice de **Fortificação** do domínio.
- **Catálogo de Tropas**: Infantaria Leve, Infantaria Pesada, Arqueiros, Cavalaria Ligeira, Cavalaria Pesada, Engenheiros de Cerco e Magos de Batalha.
- **Restrições**: Tropas exigem estruturas pré-requisito (ex: Cavalaria exige Cavalariça; Infantaria exige Quartel) e limite de regimento baseado no nível territorial.
- **Inadimplência de Manutenção**: A falta de pagamento em LO resulta em deserção imediata de tropas, rebaixamento da corte para Miserável e deflagração de risco de Revolta Popular.

---

## 5. Conglomerados Geopolíticos

- **Modelos**:
  - **Aliança**: Confederação cooperativa de senhorios autônomos.
  - **Império**: Estrutura hegemônica centralizada em um Domínio Capital.
- **Papéis Estratégicos**: Domínio Capital, Província Agrícola, Entreposto Comercial, Bastião Militar, Feudo Vassalo.
- **Subjugação Territorial**: Domínios derrotados ou forçados por campanhas de guerra são anexados compulsoriamente com afinidade 'Subjugado', canalizando renda tributária para a capital.

---

## 6. Inventário e Sistema de Carga

### 6.1 Categorização e Raridades
- **7 Categorias Oficiais**: Armas, Armaduras, Consumíveis, Itens Gerais, Itens Mágicos, Tesouros e Recursos Naturais.
- **Raridades**: Comum, Superior, Mágico Menor, Mágico Médio, Mágico Maior, Artefato.

### 6.2 Fórmulas de Carga e Sobrecarga por Força
O cálculo de espaços de transporte segue as diretrizes oficiais de Tormenta20:
$$\text{Limite de Carga Base} = \text{BASE\_CARRY} + (\text{Força} \times \text{CARRY\_PER\_STR}) + \text{Bônus}$$
$$\text{Carga Máxima (Sobrecarga Extrema)} = \text{Limite de Carga Base} \times \text{MAX\_OVERLOAD\_MULTIPLIER}$$
Ultrapassar a carga limite impõe penalidades de movimento e destreza; ultrapassar a carga máxima impede a locomoção.

### 6.3 Liquidação de Itens
- **Venda de Itens Comuns**: Valor de mercado padrão equivalente a 50% do valor de face.
- **Tesouros e Gemas**: Liquidáveis por 100% do valor de face.

---

## 7. Membros, NPCs e Sistema de Afinidade

### 7.1 Membros da Guilda
- Status de atividade: `Ativo`, `Viajando`, `Ferido`, `Morto`, `Inativo`.
- Carteiras Pessoais: Transferência bidirecional entre guilda e membro.
- **Pontos Divinos**: Bênçãos e aflições concedidas pelas 20 divindades do Panteão de Arton (Valkaria, Khalmyr, Lena, Tanna-Toh, Thyatis, etc.).

### 7.2 Comitiva de NPCs e Folha Salarial
- **Papéis T20 de Parceiros**: Ajudante, Atirador, Combatente, Curandeiro, Fortão, Guardião, Magivocador, Mestre, Perseguidor, Vigilante.
- **Folha de Pagamento Automatizada**:
  - Salários são calculados **apenas para contratados** (`isContracted: true`).
  - NPCs voluntários ou aliados (`isPartner: true`) **não oneram a folha**.
  - Apenas NPCs com status **`Ativo`** recebem pagamento no ciclo.

### 7.3 Progressão de Afinidade (0 a 7 PA)
- **Escala de Afinidade**: Medida de 0 a 7 Pontos de Afinidade (PA).
- **Interações**:
  - Diálogo / Ação Comum: **+1 PA**.
  - Ação alinhada com gostos / valores do NPC: **+2 PA**.
  - Teto inultrapassável de **7 PA**.
- **Benefícios de Afinidade**: Cada membro aventureiro pode ter no máximo **1 benefício de NPC ativo por vez**.
- **Última Demanda (Ultimate Quest)**: Missão pessoal decisiva do NPC desbloqueada exclusivamente ao atingir a pontuação máxima de **7 PA**.

---

## 8. Calendário de Arton e Campanha

### 8.1 Meses e Dias da Semana de Arton
O calendário canônico de Arton possui 12 meses nomeados em honra aos deuses maiores:
1. Mês de Tauron
2. Mês de Arsenal
3. Mês de Valkaria
4. Mês de Lena
5. Mês de Marah
6. Mês de Tanna-Toh
7. Mês de Thyatis
8. Mês de Allihanna
9. Mês de Megalokk
10. Mês de Hyninn
11. Mês de Aharadak
12. Mês de Khalmyr

- **Dia de Nimb (Nimb Day)**: Celebração mágica que ocorre fora da contagem regular dos dias da semana, onde eventos caóticos e bênçãos imprevisíveis acontecem.

### 8.2 Quadro de Missões e Reputação de Facções
- Missões rastreiam status (`Ativa`, `Concluída`, `Falha`), recompensas e heróis designados.
- Reputação com reinos e facções varia entre tiers: `Hostil`, `Desconfiado`, `Neutro`, `Amigável`, `Honrado` e `Reverenciado`.
