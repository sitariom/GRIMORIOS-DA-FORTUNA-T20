# Especificação Técnica Detalhada — Frentes 2, 3 e 4

Este documento reúne o detalhamento técnico, arquitetural e de implementação das evoluções especificadas para o **Grimório da Fortuna T20** nas frentes de **Performance e Frontend (Frente 2)**, **Arquitetura e Refatoração (Frente 3)** e **Testes e Automação (Frente 4)**.

---

## 🚀 FRENTE 2: Otimizações de Performance e Frontend

### 2.1 Code-Splitting Granular com `React.lazy()` e `Suspense`

#### Diagnóstico Técnico
No arquivo `App.tsx`, todas as 17 páginas são importadas de forma estática no topo do arquivo:
```typescript
import FinancialPage from './pages/FinancialPage';
import CashFlowPage from './pages/CashFlowPage';
import InventoryPage from './pages/InventoryPage';
// ... 14 outros imports estáticos
```
Isso força o bundler (Vite / Rollup) a empacotar todo o código em um único chunk monolítico de **884.63 kB** (`dist/assets/index-*.js`), que precisa ser baixado, parseado e compilado pelo motor V8 do navegador mesmo que o usuário só visite o Dashboard.

#### Solução Especificada
1. Substituir os imports estáticos por declarações dinâmicas `React.lazy()`:
```typescript
const FinancialPage = React.lazy(() => import('./pages/FinancialPage'));
const CashFlowPage = React.lazy(() => import('./pages/CashFlowPage'));
const InventoryPage = React.lazy(() => import('./pages/InventoryPage'));
const ItemHistoryPage = React.lazy(() => import('./pages/ItemHistoryPage'));
const BasesPage = React.lazy(() => import('./pages/BasesPage'));
const DomainsPage = React.lazy(() => import('./pages/DomainsPage'));
const ConglomeratesPage = React.lazy(() => import('./pages/ConglomeratesPage'));
const InvestmentsPage = React.lazy(() => import('./pages/InvestmentsPage'));
const MembersPage = React.lazy(() => import('./pages/MembersPage'));
const DivinePointsPage = React.lazy(() => import('./pages/DivinePointsPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const GuildManagerPage = React.lazy(() => import('./pages/GuildManagerPage'));
const NPCsPage = React.lazy(() => import('./pages/NPCsPage'));
const ChroniclesPage = React.lazy(() => import('./pages/ChroniclesPage'));
const QuestBoardPage = React.lazy(() => import('./pages/QuestBoardPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const ReputationPage = React.lazy(() => import('./pages/ReputationPage'));
```

2. Envolver a árvore de rotas dentro de `<React.Suspense fallback={<LoadingScreen />}>`:
```tsx
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/finance" element={<FinancialPage />} />
    {/* demais rotas */}
  </Routes>
</Suspense>
```

#### Resultado Esperado
- Bundle inicial reduzido de **884 kB** para **~80 kB**.
- Cada uma das 17 páginas gera seu próprio chunk sob demanda de ~25 a 50 kB.
- Tempo de carregamento inicial (First Contentful Paint) até 4x mais rápido.

---

### 2.2 Migração do Tailwind CSS de CDN para Build Nativo do Vite

#### Diagnóstico Técnico
O `index.html` injeta o Tailwind através da tag:
```html
<script src="https://cdn.tailwindcss.com"></script>
```
Isso introduz um atraso de rede externo (dependência do CDN), executa o compilador JIT dentro da thread principal do navegador e impede que a aplicação funcione em ambientes offline ou com conexões lentas.

#### Solução Especificada
1. Instalar as dependências de build no projeto:
   - `npm install -D tailwindcss @tailwindcss/vite` ou configurar via PostCSS/Autoprefixer.
2. Atualizar o `vite.config.ts` para integrar o plugin do Tailwind.
3. Criar `src/index.css` contendo as diretivas:
```css
@import "tailwindcss";
```
4. Mover a configuração temática de cores de fantasia (`fantasy-wood`, `fantasy-parchment`, `fantasy-gold`, etc.) para o arquivo de configuração nativo do Tailwind.
5. Remover `<script src="https://cdn.tailwindcss.com"></script>` do `index.html`.

---

## 🏛️ FRENTE 3: Arquitetura e Refatoração de Código

### 3.1 Desacoplar Conglomerados do `GuildContext.tsx` (`useConglomerateActions.ts`)

#### Diagnóstico Técnico
O arquivo `GuildContext.tsx` possui 1.144 linhas. Enquanto ações de Finanças, Bases, Domínios, Inventário, Membros, NPCs, Calendário, Missões e Reputação possuem seus próprios hooks em `context/hooks/`, as seguintes 9 funções de **Conglomerados** ficaram codificadas inline no `GuildContext.tsx`:
- `createConglomerate`
- `addDomainToConglomerate`
- `removeDomainFromConglomerate`
- `subjugateDomain`
- `disbandConglomerate`
- `setDomainRole`
- `inactivateConglomerate`
- `reactivateConglomerate`
- `setConglomerateAffinity`

#### Solução Especificada
Criar o arquivo `context/hooks/useConglomerateActions.ts`:
```typescript
export interface UseConglomerateActionsProps {
  conglomerates: Conglomerate[];
  domains: Domain[];
  setConglomerates: React.Dispatch<React.SetStateAction<Conglomerate[]>>;
  setDomains: React.Dispatch<React.SetStateAction<Domain[]>>;
  addLog: (category: LogCategory, message: string, value?: number, details?: any) => void;
  notify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const useConglomerateActions = ({
  conglomerates,
  domains,
  setConglomerates,
  setDomains,
  addLog,
  notify
}: UseConglomerateActionsProps) => {
  // Implementação isolada e testável das 9 funções
  return {
    createConglomerate,
    addDomainToConglomerate,
    removeDomainFromConglomerate,
    subjugateDomain,
    disbandConglomerate,
    setDomainRole,
    inactivateConglomerate,
    reactivateConglomerate,
    setConglomerateAffinity
  };
};
```
No `GuildContext.tsx`, basta consumir o hook como é feito com os outros 9 hooks:
```typescript
const conglomerateActions = useConglomerateActions({
  conglomerates,
  domains,
  setConglomerates,
  setDomains,
  addLog: internalAddLog,
  notify
});
```

---

### 3.2 Modularização do Monólito `useDomainActions.ts` (2.071 Linhas)

#### Diagnóstico Técnico
O hook `useDomainActions.ts` acumula 2.071 linhas de código, agregando lógicas de naturezas muito distintas:
- Decretos e governança em duas etapas (`executeDomainAction`).
- Tabelas e cálculos de impostos, cortes e popularidade.
- Catálogo de edifícios e cálculo agregado de fortificação.
- Recrutamento, custos de manutenção e perdas de batalha militar.
- Logística de caravanas e tarefas pendentes.
- Resolução interativa de crises e revoltas.

#### Solução Especificada
Subdividir a lógica interna em 3 módulos utilitários coesos sob `context/hooks/domain/`:
1. `domainGovernance.ts`: Resolução de ações governamentais, tabelas de dados, custos e bônus.
2. `domainMilitary.ts`: Gestão de unidades militares, validação de pré-requisitos de edifícios e cálculo de perdas em combate.
3. `domainLogistics.ts`: Despacho e resolução de caravanas e tarefas pendentes.

A assinatura externa e o objeto retornado por `useDomainActions` permanecem **100% inalterados**, garantindo zero impacto nos componentes consumidores.

---

### 3.3 Parametrização e Hardening de Consulta SQL em `api/guilds.ts`

#### Diagnóstico Técnico
Na linha 226 de `api/guilds.ts`:
```typescript
// Query com interpolação de string detectada pelo ast-grep
const query = `SELECT ... WHERE id = '${guildId}'`;
```
Embora o ID seja tratado previamente, interpolações brutas em SQL são uma má prática de segurança e violam as regras estritas de SAST.

#### Solução Especificada
Substituir por consulta estritamente parametrizada:
```typescript
const { rows } = await client.sql`
  SELECT id, name, last_accessed 
  FROM guilds 
  WHERE id = ${guildId}
`;
```
Garantindo proteção absoluta contra injeção e total compatibilidade com os analisadores de segurança (pi-lens / CodeQL / Semgrep).

---

## 🧪 FRENTE 4: Testes e Automação de Qualidade

### 4.1 Integração de `tests/server.test.ts` no `npm test`

#### Diagnóstico Técnico
O arquivo `tests/server.test.ts` valida a integridade do Express, inicialização de rotas e resiliência contra ataques de força bruta (teste de 120 requisições consecutivas no rate limiter). Atualmente ele não está incluído no comando `"test"` do `package.json`.

#### Solução Especificada
Atualizar o script de teste no `package.json`:
```json
{
  "scripts": {
    "test": "npx tsx tests/domainActions.test.ts && npx tsx tests/baseActions.test.ts && npx tsx tests/npcActions.test.ts && npx tsx tests/migration.test.ts && npx tsx tests/server.test.ts"
  }
}
```

---

### 4.2 Novas Suítes de Testes Unitários

#### A. `tests/financialActions.test.ts`
Testará:
1. Paridade de Câmbio T20:
   - 1 TO para TP (resultado: 10 TP).
   - 1 TO para TC (resultado: 100 TC).
   - 1.000 TO para TL (resultado: 1 TL).
   - Conversões fracionárias e reversão cambial sem perda de valor.
2. Depósito e Saque com saldo positivo.
3. Bloqueio de saque com saldo insuficiente.
4. Geração imutável de logs no fluxo de caixa.

#### B. `tests/inventoryActions.test.ts`
Testará:
1. Cálculo de carga regular: `BASE_CARRY + Força * CARRY_PER_STR`.
2. Cálculo de carga máxima de sobrecarga extrema: `Carga * MAX_OVERLOAD_MULTIPLIER`.
3. Venda de lote com 50% de valor para itens comuns e 100% para riquezas/tesouros.
4. Decremento de estoque e remoção automática de itens com quantidade zerada.

#### C. `tests/calendarActions.test.ts`
Testará:
1. Avanço de 1 dia com recálculo do dia da semana artoniano.
2. Avanço de 30 dias com virada de mês canônico (Tauron -> Arsenal -> Valkaria -> ...).
3. Virada de ano após o 12º mês (Khalmyr -> Tauron, ano + 1).
4. Ativação e persistência do estado festivo do Dia de Nimb (*Nimb Day*).
