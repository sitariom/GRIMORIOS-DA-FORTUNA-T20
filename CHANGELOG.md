
# 📜 Changelog - Grimório da Fortuna

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.2.0] - 2024-05-24
### Adicionado
- **Pontos Divinos:** Nova tela para gestão e acompanhamento dos pontos divinos (ou pontos de ação) dos membros ativos.
- **Resoluções de Avisos:** Configurados sinalizadores futuros do React Router v7 para `startTransition` e `relativeSplatPath`.

### Corrigido
- **Membros Ativos:** Reparado o sumiço de aventureiros com diferentes de "Ativo" (ex. "Viajando", "Ferido") nas páginas de Reputação e Quadro de Missões (agora apenas "Morto" e "Inativo" os excluem das seleções globais limitadas a ativos).
- **Websocket:** Tratamento do Web Socket HMR no Vite minimizando erros nos logs durante o tempo de desenvolvimento em ambiente seguro.

### Alterado
- **Identidade Visual:** Seletor de Dropdown na aba de Reputação harmonizado visualmente com os campos de entrada, com transparência e estilo alinhado no modo Dark.

## [1.1.0] - 2024-05-20
### Adicionado
- **Construções Personalizadas:** Agora é possível adicionar obras e infraestruturas com nomes, custos e benefícios manuais nos Domínios.
- **Unidades Mercenárias:** Sistema de criação manual de tropas com valores de Poder Bélico (PWR) e custos personalizados.
- **Abas de Recrutamento:** Interface de modais dividida entre "Catálogo Oficial" e "Projetos Personalizados".
- **Sistema de Backup:** Interface refinada na página de Gestão de Campanhas para exportação e importação de JSON.

### Corrigido
- **Botão Governar:** Fluxo corrigido para exibir o resultado detalhado do decreto (renda, manutenção e sucesso/falha) antes de fechar o modal.
- **Recrutamento de NPCs:** O modal de adicionar funcionário estava ausente visualmente e foi reimplementado com seletores dinâmicos de alocação (Base/Domínio/Grupo).
- **Cálculo de Popularidade:** Corrigido erro de índice que ocorria quando a popularidade atingia os limites (Odiado/Adorado) durante a governança.

### Alterado
- **Identidade Visual:** Melhoria no contraste do modo Dark para elementos de pergaminho.
- **Logs do Sistema:** Descrições de logs de governança agora incluem o resultado do dado e o CD do teste.

## [1.0.0] - 2024-05-15
### Lançamento Inicial
- **Core:** Estrutura base com Context API para gestão global de estado.
- **Finanças:** Sistema de quatro moedas (TC, TS, TO, LO) com câmbio integrado.
- **Inventário:** Arsenal completo com sistema de vendas e retiradas.
- **Bases:** Gestão de propriedades, cômodos e mobílias.
- **Domínios:** Sistema básico de territórios, regentes e tesouro real.
- **Dashboard:** Visão geral com integração de IA para geração de arte de fundo.
- **Temas:** Suporte completo a Modo Claro (Pergaminho de Luz) e Modo Escuro (Grimório de Sombras).

---
*Nota: Este projeto segue o versionamento semântico.*
