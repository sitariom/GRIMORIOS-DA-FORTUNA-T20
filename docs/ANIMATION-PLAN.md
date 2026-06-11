# Plano de Animacoes e UX — Evolucao Visual

## Diagnostico

### Paginas com alto nivel de animacao (REFERENCIA)
| Pagina | Animacoes | Qualidade |
|--------|-----------|-----------|
| DashboardPage | Hero parallax, KPI cards animate-slide-up com stagger, SVG chart, hover effects, wax seals, sparkle spin, gradient overlays | EXCELENTE |
| FinancialPage | animate-scroll-unroll com stagger nos KPI cards, hover scale, wax seals, toggle com transicao | BOA |
| DomainsPage | Cards com hover, secoes estilizadas | BOA |

### Paginas com nivel intermediario
| Pagina | Animacoes | Qualidade |
|--------|-----------|-----------|
| BasesPage | Parchment cards, alguns hovers | MODERADA |
| GuildManagerPage | Modais, mas sem entrada animada | MODERADA |
| MembersPage | Cards basicos | MODERADA |
| NPCsPage | Cards basicos | MODERADA |

### Paginas com nivel SIMPLES (ALVO DA MELHORIA)
| Pagina | Problemas | 
|--------|-----------|
| ChroniclesPage | Lista sem animacao de entrada, sem empty state, sem shimmer |
| CalendarPage | Grid estatico, sem animacao de transicao entre meses |
| QuestBoardPage | Cards sem hover/entrada, sem empty state |
| ReputationPage | Display estatico de tiers, sem animacao |
| InventoryPage | Lista de itens basica, sem animacao |
| ItemHistoryPage | Lista historica simples |
| InvestmentsPage | Lista de investimentos simples |
| CashFlowPage | Tabela de fluxo de caixa simples |
| ConglomeratesPage | Cards de conglomerados sem refinamento |
| DivinePointsPage | Display de pontos simples |

---

## Plano de Implementacao

### Fase 1 — Componentes Globais de Animacao
Criar hooks e componentes reutilizaveis:

1. **useStaggerAnimation(count: number, baseDelay: number)** — Hook que retorna array de refs com animationDelay progressivo
2. **AnimatedCard** — Wrapper que aplica fade-in + slide-up com delay config
3. **LoadingSkeleton** — Componente de shimmer/skeleton generico para cards/tabelas
4. **EmptyState** — Componente de estado vazio com icone tematico + CTA

### Fase 2 — Paginas do Dashboard/Finance (ja estao boas)
Nenhuma alteracao necessaria.

### Fase 3 — Paginas Intermediarias
- **BasesPage**: Adicionar animate-slide-up nos cards de base, wax seals, hover glow
- **GuildManagerPage**: Adicionar entrada animada nos cards de guilda, loading skeleton enquanto lista carrega
- **MembersPage**: Adicionar stagger nos cards de membro, shimmer loading
- **NPCsPage**: Adicionar stagger nos cards de NPC, shimmer loading

### Fase 4 — Paginas Simples (ALVO PRINCIPAL)

#### 4.1 ChroniclesPage
- Adicionar animate-slide-up com stagger nas linhas do log (cada entrada aparece sequencialmente)
- Empty state quando nao ha logs
- Loading skeleton enquanto carrega
- Scroll infinito com fade-in das novas linhas

#### 4.2 CalendarPage
- Animacao de transicao entre meses (slide horizontal)
- Destaque do dia atual com pulse
- Hover nos dias com eventos
- Empty state para dias sem eventos

#### 4.3 QuestBoardPage
- Cards de missao com animate-slide-up e stagger
- Hover elevacao com glow
- Drag-and-drop visual com feedback
- Empty state quando nao ha missoes
- Badge de status com animacao

#### 4.4 ReputationPage
- Barras de progresso animadas (animate-width)
- Tiers com revelacao sequencial
- Efeito de glow no tier atual
- Empty state

#### 4.5 InventoryPage
- Grid de itens com animate-slide-up e stagger
- Hover com detalhes expandidos
- Categorias com collapse animado
- Empty state e loading skeleton

#### 4.6 ItemHistoryPage
- Timeline visual com entradas animadas
- Stagger nas transacoes
- Empty state e skeleton

#### 4.7 InvestmentsPage
- Cards de investimento com animate-fade-in
- Progresso animado
- Empty state

#### 4.8 CashFlowPage
- Tabela com linhas animadas (stagger)
- Grafico de fluxo (como no Dashboard)
- Empty state e skeleton

#### 4.9 ConglomeratesPage
- Cards com entrada animada
- Hover com glow nos conglomerados
- Dominios dentro com collapse animado

#### 4.10 DivinePointsPage
- Display de pontos com animated counter
- Barras de progresso animadas
- Efeito de sparkle ao gastar pontos

### Fase 5 — Micro-interacoes Globais
- Adicionar `active:scale-95` em todos os botoes
- Adicionar `transition-all duration-300` em todos os cards/interativos
- Adicionar hover com elevacao (shadow increase) em cards
- Adicionar wax seal decorativo em cards que nao tem

---

## Como vou executar

1. Por pagina, comecando pelas mais simples
2. Nao quebrar funcionalidade existente
3. Manter-se fiel a tematica grimorio (parchment, wax seal, gold, medieval)
4. Usar as animacoes ja definidas no tailwind.config (animate-slide-up, animate-fade-in, animate-bounce-in, animate-scroll-unroll)
5. Reutilizar os padroes visuais ja existentes (parchment-card, wax-seal, font-medieval, rounded-[32px])

Posso comecar? Ou deseja ajustar algo no plano?
