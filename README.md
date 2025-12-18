
# 📖 Grimório da Fortuna T20

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.1.0-gold)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![AI](https://img.shields.io/badge/Gemini-AI-orange)

O **Grimório da Fortuna** é uma aplicação web síncrona de alta performance desenvolvida para mestres e jogadores de RPG (especialmente focado no sistema **Tormenta20**). Ele serve como a central definitiva de tesouraria, gestão de inventário, administração de bases e governança de domínios.

Diga adeus às planilhas complexas e dê as boas-vindas a uma interface imersiva, digna das crônicas de Arton.

---

## ✨ Funcionalidades Principais

### 💰 Tesouraria e Fluxo de Caixa
- **Conversão Automática:** Câmbio instantâneo entre TC, TS, TO e LO (Lingotes de Ouro).
- **Livro de Contas:** Registro detalhado de cada tibar que entra ou sai, com identificação do responsável e motivo.
- **Divisão de Espólios:** Facilita a partilha de tesouros entre os membros da guilda.

### 🎒 Arsenal e Bens
- **Gestão de Itens:** Catálogo de equipamentos, relíquias e itens de missão.
- **Negociação Realista:** Sistema de venda com percentual de mercado e controle de estoque.
- **Vínculos:** Itens podem ser marcados como "Inalienáveis" ou "Itens de Missão".

### 🏰 Bases e Fortalezas
- **Construção de Cômodos:** Slots limitados pelo porte da base (Mínima até Suprema).
- **Manutenção:** Cálculo automático de custos mensais para manter suas sedes funcionando.
- **Bônus de Tipo:** Bônus mecânicos baseados no tipo de base (Centro de Poder, Fortificação, etc).

### 👑 Domínios e Governança
- **Decretos Reais:** Botão "Governar" que simula testes de regência, gerando renda e alterando popularidade.
- **Infraestrutura Personalizada:** Adicione construções do catálogo ou crie suas próprias obras com custos em LO.
- **Exército e Tropas:** Recrute legiões padrão ou unidades mercenárias personalizadas.
- **Eventos Súbitos:** Sistema de crise para testar a resiliência do seu domínio.

### 👷 Gestão de NPCs
- **Folha de Pagamento:** Controle centralizado de estipêndios para funcionários.
- **Alocação Estratégica:** Vincule NPCs a bases específicas ou mantenha-os em comitiva com o grupo.

---

## 🤖 Inteligência Artificial

A aplicação integra a **Gemini API** da Google para:
- **Arte Imersiva:** Geração dinâmica de banners e heróis visuais para o Dashboard baseados no nome e lore da sua guilda.
- **Oráculo (Futuro):** Base técnica pronta para expandir para assistentes de mestre inteligentes.

---

## 🛠️ Stack Tecnológica

- **Core:** [React 19](https://react.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com temas Dark/Light imersivos.
- **Ícones:** [Lucide React](https://lucide.dev/)
- **IA:** [@google/genai](https://ai.google.dev/) (Gemini 2.5 Flash Image)
- **Persistência:** LocalStorage com sistema de exportação/importação JSON (Backup).

---

## 🚀 Como Utilizar

### Localmente
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Configure sua API KEY do Gemini no arquivo `.env` como `API_KEY`.
4. Inicie o servidor: `npm run dev`

### Online (Deploy Gratuito)
Para acesso múltiplo de forma gratuita:
1. Faça o deploy na **Vercel** ou **Netlify**.
2. Como os dados são salvos localmente, use a função **"Backup"** em "Minhas Campanhas" para enviar o estado atual do grimório (JSON) para outros jogadores.
3. Os jogadores utilizam a função **"Importar Pergaminho"** para sincronizar.

---

## 📄 Licença

Este projeto é disponibilizado para a comunidade de RPG sob a licença MIT. Sinta-se livre para forjar sua própria versão!

---
*Desenvolvido com sangue, suor e muitos dados rolados.*
