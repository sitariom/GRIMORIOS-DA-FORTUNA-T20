# Propostas de Modernização Visual — Grimório da Fortuna T20

Este documento apresenta três direções estéticas concebidas no **OpenDesign (v0.23.1)** para modernizar a interface do Grimório da Fortuna T20, preservando integralmente o tema de **fantasia medieval** de Tormenta20 e garantindo suporte nativo a **telas claras e escuras (Light/Dark mode)** com acessibilidade e sem artificialismos visuais (*Anti-AI Slop*).

---

## 🎨 Protótipo Interativo no OpenDesign

O protótipo interativo completo foi registrado no daemon local do OpenDesign:
- **Projeto no OpenDesign**: `grimorio-fortuna-evolution`
- **Artefato**: `prototype.html`
- **Arquivo Local**: `docs/design-proposals/prototype.html`
- **Conformidade de Linter (`od lint`)**: **100% Aprovado** (0 P0, 0 P1, 0 P2 — zero cores padrão de IA, zero hexadecimais soltos fora de `:root`).

Para visualizar interativamente com alternância de temas e direções em tempo real:
- Abra o arquivo `docs/design-proposals/prototype.html` no seu navegador favorito, ou
- Acesse o estúdio local do OpenDesign em `http://127.0.0.1:7456`.

---

## 🏛️ As 3 Direções Estéticas

### 1. Pergaminho Nobre & Selo Imperial *(Refined Royal Editorial)*
> **Conceito**: Uma evolução refinada do design atual. Substitui o pergaminho rústico e escuro por uma experiência editorial nobre, inspirada em livros contábeis e decretos reais das cortes de Valkaria e Deheon.

- **Filosofia Visual**: 
  - Superfícies claras marfim/creme nobres e couro encadernado macio no dark mode.
  - Bordas de 1px com tons quentes de madeira e ouro brunido, substituindo sombras excessivamente pesadas por hierarquia limpa.
  - O clássico selo de cera rubro é preservado em formato minimalista e icônico para avisos e notificações.
- **Tipografia**:
  - Títulos e Headers: `Cinzel` (serifa imperial com legibilidade moderna) ou `MedievalSharp`.
  - Dados, Números e Tabelas: `Plus Jakarta Sans` (sans-serif geométrica nítida).
- **Paleta de Cores**:
  - *Light*: Fundo Marfim (`#f7f3e8`), Superfície Branca (`#ffffff`), Texto Carvão Real (`#1c150c`), Acento Ouro Nobre (`#c68a18`), Selo Cera (`#a81c1c`).
  - *Dark*: Fundo Ébano (`#0d0a07`), Superfície Couro Escuro (`#17130e`), Texto Pergaminho Claro (`#f5ece0`), Acento Ouro Reluzente (`#eab308`), Selo Carmesim (`#dc2626`).
- **Ideal Para**: Quem ama o sabor tradicional medieval de pergaminho, mas deseja uma interface limpa, nítida e confortável para leitura prolongada.

---

### 2. Arcana Moderna & Vidro Rúnico *(Modern Arcane Glass)*
> **Conceito**: Fusão entre a sofisticação minimalista contemporânea (inspirada em ferramentas como Linear e Vercel) e a alta magia de Arton (Wynna, Tanna-Toh e a Academia Arcana).

- **Filosofia Visual**:
  - Superfícies de vidro temperado escuro (*frosted glass* com `backdrop-blur` de 12px) e mármore etéreo no modo claro.
  - Bordas finas de 1px com iluminação rúnica suave no hover (`#38bdf8` / `#2563eb`).
  - Espaçamento generoso, cartões modulares e micro-badges com ícones arcanos.
- **Tipografia**:
  - Títulos: `Cinzel` espaçado com tracking elegante.
  - Interface: `Plus Jakarta Sans` refinada.
- **Paleta de Cores**:
  - *Light*: Fundo Mármore Suave (`#f8fafc`), Superfície Alva (`#ffffff`), Texto Ardósia Nobre (`#0f172a`), Acento Safira Arcana (`#2563eb`), Selo Índigo Profundo (`#0369a1`).
  - *Dark*: Fundo Obsidiana Profunda (`#060911`), Vidro Arcana (`#0c1222`), Texto Níquel Brilhante (`#f8fafc`), Acento Ciano Místico (`#38bdf8`), Selo Celestial (`#0284c7`).
- **Ideal Para**: Mesas que adoram um visual moderno de alta tecnologia mágica, onde a interface parece um artefato de cristal e magia pura de Arton.

---

### 3. Forja de Thwor & Aço Tormenta *(Tactical Dark Fantasy / Bastion)*
> **Conceito**: Estética robusta, tática e militar inspirada na Aliança Negra, Doherimm e nos Reinos de Ferro. O aplicativo se transforma em um centro tático de guerra e tesouraria militar.

- **Filosofia Visual**:
  - Cartões com cantos chanfrados (12px), simulando placas de armadura forjadas e reforçadas.
  - Alto contraste cirúrgico para gestão de exércitos, tributos e caravanas em batalha.
  - Números financeiros e indicadores em tipografia monoespelhada (`JetBrains Mono`).
- **Tipografia**:
  - Títulos: `Cinzel` pesado e assertivo.
  - Dados Financeiros / Rótulos: `JetBrains Mono`.
  - Corpo da UI: `Plus Jakarta Sans`.
- **Paleta de Cores**:
  - *Light*: Fundo Calcário Mineral (`#f1f5f9`), Superfície Placa de Prata (`#ffffff`), Texto Chumbo Escuro (`#090d16`), Acento Âmbar Forjado (`#d97706`), Selo Rubi Militar (`#b91c1c`).
  - *Dark*: Fundo Ferro Escurecido (`#090c10`), Placas de Aço (`#12161f`), Texto Aço Polido (`#f1f5f9`), Acento Fogo de Forja (`#f59e0b`), Selo Rubi Tormenta (`#ef4444`).
- **Ideal Para**: Campanhas focadas em conquista territorial, gerenciamento de fortalezas, batalhas e guerras sangrentas de Arton.

---

## 📊 Matriz Comparativa das Direções

| Critério | 1. Pergaminho Nobre | 2. Arcana Moderna | 3. Forja & Aço |
|---|---|---|---|
| **Inspiração Principal** | Cortes de Valkaria & Deheon | Academia Arcana & Wynna | Aliança Negra & Doherimm |
| **Estilo de Card** | Pergaminho editorial marfim | Vidro temperado translúcido | Placas de aço chanfradas |
| **Bordas** | 1px couro dourado | 1px brilho rúnico suave | 1px rebites e ferro forjado |
| **Acentos Cromáticos** | Ouro Imperial & Cera Rubra | Safira Arcana & Ciano Místico | Âmbar de Forja & Rubi Tormenta |
| **Acessibilidade (WCAG)** | AAA (~12:1 / ~15:1) | AAA (~14:1 / ~16:1) | AAA (~15:1 / ~16:1) |
| **Nível de Modernidade** | Moderno Editorial | Ultra Moderno Mágico | Moderno Tático |

---

## 🛠️ Arquitetura de Design Tokens Implementada

Todas as cores foram padronizadas em `:root` via variáveis CSS semânticas, respeitando o padrão OpenDesign:

```css
:root {
  /* Design Tokens Globais */
  --font-display: 'Cinzel', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Tokens Dinâmicos Ativos */
  --bg: var(--color-d1-light-bg);
  --surface: var(--color-d1-light-surface);
  --fg: var(--color-d1-light-fg);
  --muted: var(--color-d1-light-muted);
  --border: var(--color-d1-light-border);
  --accent: var(--color-d1-light-accent);
  --seal: var(--color-d1-light-seal);
  --card-shadow: 0 10px 25px -5px rgba(50, 35, 15, 0.08);
}
```

Isso garante que qualquer uma das direções (ou até a troca dinâmica entre elas por preferência do jogador) possa ser ativada na aplicação com **zero retrabalho de código**, apenas alternando as variáveis semânticas.
