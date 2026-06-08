# Grimório da Fortuna T20

![Versão](https://img.shields.io/badge/vers%C3%A3o-2.3.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Express](https://img.shields.io/badge/Express-5-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Vercel-336791)

Aplicação web full-stack para gestão de tesouraria, inventário, propriedades e logística de campanhas de RPG Tormenta20. O sistema oferece controle financeiro com conversão de moedas, gestão de bases (incluindo Negócios), domínios com governança completa, calendário de Arton, quadro de missões, membros, NPCs, reputação por facção, investimentos e crônicas.

## Funcionalidades

### Finanças
- **Sistema Monetário:** Suporte a quatro moedas (Cobre, Prata, Ouro, Lingotes) com taxas de conversão automatizadas.
- **Fluxo de Caixa:** Registro imutável de transações (entradas/saídas) com categorização, filtros e histórico completo.
- **Câmbio:** Ferramenta para conversão rápida entre diferentes tipos de moeda.
- **Investimentos:** Gestão de aplicações e rendimentos.

### Gestão de Ativos
- **Inventário:** Cadastro completo de itens com controle de quantidade, valor, raridade (Comum a Artefato) e tipo (Consumível, Equipamento, Tesouro, Arma, Riqueza).
- **Venda e Retirada:** Baixa de estoque com cálculo automático de valores.
- **Histórico de Itens:** Rastreamento de movimentações por item.

### Bases e Propriedades
- **7 Tipos de Base:** Centro de Poder, Empreendimento, Esconderijo, Fortificação, Móvel, Residência e Negócio.
- **Evolução:** Portes Mínima a Suprema com slots de construção limitados.
- **Cômodos e Mobílias:** Sistema completo de reforma e decoração.
- **Negócios:** Gestão de ativos empresariais (45 ativos oficiais T20), evolução por níveis (1-7), coleta de lucros mensais.

### Domínios
- **Governança:** Decretos com rolagens para renda, manutenção e popularidade.
- **Infraestrutura:** Construções e unidades militares — catálogo oficial ou projetos personalizados.
- **Eventos:** Crises e revoltas com impactos dinâmicos.
- **Conselheiros:** Alocação de especialistas por domínio.

### Membros e NPCs
- **Membros:** Gestão de aventureiros com status (Ativo, Viajando, Ferido, Morto, Inativo), pontos divinos e afinidade.
- **NPCs:** Contratação, alocação (Base/Domínio/Grupo/Membro), folha de pagamento e vínculos (Contratado, Aliado, Parceiro, Recrutado).

### Campanha e Narrativa
- **Calendário:** Sistema de datas no calendário de Arton (dia/mês/ano, dia da semana, Nimb Day).
- **Missões:** Quadro de missões com status e acompanhamento.
- **Reputação:** Rastreamento por facção com bônus associados.
- **Crônicas:** Registro narrativo da campanha.

### Infraestrutura
- **Múltiplos Perfis:** Suporte a campanhas simultâneas com autenticação por senha (PBKDF2).
- **Backup:** Exportação e importação de dados via JSON.
- **Servidor Express:** API própria com suporte a SQLite (dev) e PostgreSQL (produção/Vercel).

## Tecnologias

- **Frontend:** React 19, TypeScript, React Router v6
- **Estilização:** Tailwind CSS (Dark/Light Mode)
- **Ícones:** Lucide React
- **Backend:** Express 5, esbuild, Vite 6
- **Banco:** SQLite (local) / PostgreSQL (Vercel)
- **Segurança:** Helmet, CORS, Rate Limit, PBKDF2
- **CI:** GitHub Actions

## Instalação e Uso Local

### Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** 9.x ou superior
- **Git**

### 1. Clone

```bash
git clone https://github.com/seu-usuario/grimorio-fortuna-t20.git
cd grimorio-fortuna-t20
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário (veja a [referência completa](#variáveis-de-ambiente)).

### 4. Modo Desenvolvimento

Inicia o servidor Express com hot-reload via Vite:

```bash
npm run dev
```

Acesse em **http://localhost:3000**. O backend usa SQLite automaticamente (não requer configuração adicional).

### 5. Build e Produção Local

Gera os bundles otimizados e inicia o servidor em modo produção:

```bash
npm run build
npm start
```

Acesse em **http://localhost:3000**. O servidor Express serve os arquivos estáticos e a API no mesmo endereço.

### 6. Testes

```bash
npm test
```

Executa a suíte de testes (domainActions, baseActions, npcActions, migration).

---

## Deploy na Vercel

A aplicação é dividida em duas camadas para deploy na Vercel:

| Camada | Tecnologia | Como é deployada |
|--------|-----------|------------------|
| **Frontend** (SPA) | React + Vite | Build automático via `npm run build` |
| **API** (serverless) | TypeScript + `@vercel/postgres` | Funções em `api/` detectadas automaticamente |

### Passo a passo

#### 1. Conecte o repositório

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **Add New → Project**.
3. Importe o repositório do GitHub.
4. Mantenha as configurações padrão — a Vercel detecta automaticamente o Vite.

#### 2. Configure as variáveis de ambiente

No painel do projeto na Vercel, vá em **Settings → Environment Variables** e adicione:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `POSTGRES_URL` | Não | URL de conexão PostgreSQL (Vercel Postgres, Neon, Supabase). Sem ela, o app **não funciona em produção** — use o provedor Postgres da Vercel. |
| `ADMIN_PASSWORD` | Não | Senha inicial do administrador mestre (definida uma vez na primeira execução). |
| `NODE_ENV` | Não | `production` (padrão na Vercel). |

> **Importante:** Em produção na Vercel o app **requer PostgreSQL**. O SQLite é usado apenas em desenvolvimento local.

#### 3. Faça o deploy

A Vercel detecta automaticamente:
- **Build Command:** `npm run build`
- **Output Directory:** `dist/` (gerado pelo Vite)
- **API Directory:** `api/` (serverless functions em Edge Runtime)

Clique em **Deploy**. O primeiro deploy pode levar alguns minutos.

#### 4. Configure o banco de dados (PostgreSQL)

Recomendado: use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) — o link cria automaticamente o banco e fornece a `POSTGRES_URL`.

Se usar provedor externo (Neon, Supabase, Railway):

1. Crie um banco PostgreSQL 15+.
2. Copie a connection string para `POSTGRES_URL` nas variáveis de ambiente da Vercel.
3. As tabelas (`guilds`, `admin_auth`) são criadas automaticamente na primeira requisição (auto-migration).

### Verificação pós-deploy

1. Acesse a URL gerada pela Vercel.
2. Crie uma nova guilda — a tela de **Gerenciar Campanhas** solicitará uma senha.
3. Os dados serão persistidos no PostgreSQL via API serverless.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Local | Vercel | Descrição |
|----------|:-----------:|:-----:|:------:|-----------|
| `POSTGRES_URL` | Não | ❌ | ✅ | URL de conexão PostgreSQL. Sem ela, usa SQLite local. |
| `ADMIN_PASSWORD` | Não | ❌ | ✅ | Senha do admin mestre (definida na primeira execução). |
| `GEMINI_API_KEY` | Não | ❌ | ❌ | Chave da API Gemini (funcionalidade descontinuada). |
| `NODE_ENV` | Não | ❌ | ❌ | `development`, `production` ou `test`. |

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com hot-reload (Vite + Express, SQLite local) |
| `npm run build` | Build de produção: Vite (frontend) + esbuild (server) |
| `npm start` | Servir produção localmente (requer `npm run build` antes) |
| `npm test` | Rodar testes automatizados |
| `npm run preview` | Preview do build Vite (sem backend) |

---

## Arquitetura do Projeto

```
grimorio-fortuna-t20/
├── index.tsx               # Entry point React
├── App.tsx                 # Componente raiz + React Router
├── server.ts               # Servidor Express (dev/produção local)
├── vite.config.ts          # Configuração Vite
├── vercel.json             # Configuração de deploy Vercel
├── types.ts                # Tipos TypeScript (GuildState, Base, Domain...)
├── constants.ts            # Constantes do sistema T20
│
├── context/
│   ├── GuildContext.tsx     # Contexto global + Provider
│   └── hooks/              # Hooks por domínio (useBaseActions, useDomainActions...)
│
├── pages/                  # 16 páginas (Dashboard, Finanças, Bases, Domínios...)
├── components/             # Sidebar, Logo, ConfirmModal
├── services/db.ts          # Cliente da API (fetch para /api/guilds)
│
├── api/                    # Serverless Functions (Vercel Edge)
│   ├── guilds.ts           # CRUD de guildas
│   └── admin.ts            # Autenticação e gestão admin
│
├── utils/password.ts       # Hash PBKDF2 via WebCrypto
│
├── tests/                  # Testes automatizados
├── docs/memory/            # ADRs e documentação da agência de IA
├── .trae/skills/           # Skills dos agentes de IA
│
├── .env.example            # Template de variáveis de ambiente
├── .gitignore
└── package.json
```

---

## Licença

Distribuído sob a licença MIT.