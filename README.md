# Grimório da Fortuna

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.1.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

Aplicação web para gestão de tesouraria, inventário, propriedades e logística de campanhas de RPG (focado em Tormenta20). O sistema oferece controle financeiro com conversão de moedas, gestão de bases, domínios e NPCs.

## Funcionalidades

### Finanças
- **Sistema Monetário:** Suporte a quatro moedas (Cobre, Prata, Ouro, Lingotes) com taxas de conversão automatizadas.
- **Fluxo de Caixa:** Registro imutável de transações (entradas/saídas) com categorização e histórico.
- **Câmbio:** Ferramenta para conversão rápida entre diferentes tipos de moeda.

### Gestão de Ativos
- **Inventário:** Cadastro de itens com controle de quantidade, valor e tipo (Equipamento, Tesouro, etc.).
- **Venda e Retirada:** Ferramentas para baixa de estoque e cálculo automático de valores de venda.

### Bases e Domínios
- **Propriedades:** Gestão de bases evolutivas (Mínima a Suprema) com slots de construção limitados.
- **Governança:** Simulação de gestão de domínios com rolagens para renda, manutenção e eventos aleatórios (crises).
- **Infraestrutura:** Adição de construções e unidades militares personalizadas ou via catálogo.

### Pessoal
- **NPCs:** Controle de folha de pagamento e alocação de especialistas (Bases, Domínios ou Grupo).

## Tecnologias

- **Frontend:** React 19, TypeScript
- **Estilização:** Tailwind CSS (Suporte a Dark/Light Mode)
- **Ícones:** Lucide React
- **Armazenamento:** LocalStorage (Persistência no navegador)
- **Backup:** Exportação e Importação de dados via JSON

## Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o projeto localmente:
   ```bash
   npm run dev
   ```

## Licença

Distribuído sob a licença MIT.