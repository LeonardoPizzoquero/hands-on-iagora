# supabase-integration Specification

## Purpose

Define a integração com Supabase via `@supabase/ssr`: clients server/browser, middleware de sessão e proteção de rotas, e o contrato de variáveis de ambiente com segurança de segredos.

## Requirements

### Requirement: SSR Supabase Clients
O sistema SHALL prover dois clients Supabase via `@supabase/ssr`: um server client (`createServerClient`) para uso em Server Components/Actions e um browser client (`createBrowserClient`) para uso no client.

#### Scenario: Server client criado com cookies
- **WHEN** código server-side importa o helper de server client
- **THEN** um cliente é criado usando `createServerClient` integrado aos cookies da request do Next.js

#### Scenario: Browser client criado
- **WHEN** código client-side importa o helper de browser client
- **THEN** um cliente é criado usando `createBrowserClient` com a publishable key

### Requirement: Session Middleware and Route Protection
O sistema SHALL ter um `middleware.ts` que atualiza (refresh) a sessão do usuário a cada request, protege rotas designadas redirecionando usuários não autenticados para `/login`, e redireciona usuários autenticados para fora das rotas de auth (`/login`, `/signup`).

#### Scenario: Refresh de sessão
- **WHEN** uma request chega com cookies de sessão válidos
- **THEN** o middleware revalida o usuário e propaga os cookies atualizados na response

#### Scenario: Rota protegida sem sessão
- **WHEN** um usuário não autenticado acessa uma rota protegida
- **THEN** o middleware redireciona para `/login`

#### Scenario: Landing pública não é bloqueada
- **WHEN** um visitante não autenticado acessa a landing pública `/`
- **THEN** o middleware permite o acesso sem redirecionar

#### Scenario: Usuário autenticado em rota de auth
- **WHEN** um usuário autenticado acessa `/login` ou `/signup`
- **THEN** o middleware redireciona para a home

### Requirement: Environment Contract and Secret Safety
O projeto SHALL incluir `.env.example` declarando `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`, e a service role key MUST NUNCA ser exposta ao client.

#### Scenario: .env.example presente e documentado
- **WHEN** o repositório é inspecionado
- **THEN** `.env.example` lista as três variáveis sem valores reais e comenta que a service role é exclusiva do servidor

#### Scenario: Service role não vaza ao client
- **WHEN** o bundle client é gerado
- **THEN** `SUPABASE_SERVICE_ROLE_KEY` não aparece no código client (sem prefixo `NEXT_PUBLIC_`)
