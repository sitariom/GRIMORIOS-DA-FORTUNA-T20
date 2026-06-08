# Architecture Decision Record (ADR)
## Título: Reforço de Segurança na Camada Express (BFF)
**Data:** 2026-06-04
**Status:** Aceito

### Contexto
O servidor backend `server.ts` processava requisições sem as devidas proteções HTTP (CORS, limite de taxa e cabeçalhos de segurança). Sendo um projeto de tesouraria de RPG que usa autenticação de usuários, estávamos suscetíveis a ataques de força bruta na API de login e vulnerabilidades comuns.

### Decisão
Implementamos de forma cirúrgica as seguintes bibliotecas no `server.ts`:
1. **Helmet**: Para definir cabeçalhos de segurança HTTP (desabilitamos o CSP para não quebrar o SSR/Vite em dev).
2. **CORS**: Para controle explícito de Cross-Origin.
3. **Express-Rate-Limit**: Definimos um limite de 100 requisições a cada 15 minutos na rota `/api/` para mitigar ataques de força bruta contra senhas de guilda e de admin.

A criptografia de senhas (`utils/password.ts`) já estava perfeitamente adequada, utilizando PBKDF2 com WebCrypto, com verificações de colisão em tempo constante. A injeção de SQL já era coberta pelo wrapper de template strings do DB.

### Consequências
- **Melhora**: Prevenção imediata contra ataques de força bruta no login. Proteção de cabeçalhos.
- **Piora**: Possível bloqueio de usuários legítimos se houverem muitas requisições acidentais num espaço curto de tempo (100 chamadas em 15 minutos é razoável, mas pode ser ajustado no futuro).