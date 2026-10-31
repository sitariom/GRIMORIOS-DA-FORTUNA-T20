# Frontend Performance and Build Optimization Specification

## Purpose
Otimização da performance de carregamento, consumo de memória e pipeline de build do frontend da aplicação, através da implementação de code-splitting granular com React.lazy nas 17 rotas e migração do Tailwind CSS de CDN para compilação estática nativa no Vite.

## Requirements

### Requirement: Route-Level Code-Splitting with Lazy Loading
O frontend DEVE (MUST) implementar carregamento sob demanda (lazy loading) para todas as 17 páginas da aplicação através de React.lazy e React.Suspense, desacoplando o bundle inicial de 884 kB em chunks assíncronos leves por rota.

#### Scenario: Carregamento Inicial com Bundle Leve
- **WHEN** O usuário acessa a página inicial ou de autenticação da aplicação
- **THEN** O navegador deve carregar apenas o bundle essencial do shell (< 100 kB), postergando o download do código das demais 16 páginas até que suas respectivas rotas sejam requisitadas

#### Scenario: Transição de Rota com Fallback Estruturado
- **WHEN** O usuário navega para uma página não carregada previamente (ex: /domains ou /inventory)
- **THEN** O componente React.Suspense deve exibir imediatamente o LoadingSkeleton temático de pergaminho enquanto o chunk correspondente é transferido, renderizando a página final sem bloqueio da interface

### Requirement: Native Compiled Tailwind CSS Pipeline
A aplicação DEVE (MUST) substituir o script em tempo de execução do Tailwind CDN por compilação estática integrada ao Vite, eliminando o overhead de compilação JIT no navegador do cliente e permitindo funcionamento 100% offline.

#### Scenario: Compilação Estática no Processo de Build
- **WHEN** O comando de build de produção (npm run build) é executado
- **THEN** O Vite deve processar e minificar todo o CSS em um arquivo estático otimizado, sem injeção de scripts externos no cabeçalho do index.html

#### Scenario: Operação Offline e Independência de Rede Externa
- **WHEN** A aplicação é executada em um ambiente sem acesso à internet
- **THEN** Todas as classes utilitárias de estilo, cores temáticas de fantasia e animações devem ser aplicadas perfeitamente sem falhas de layout
