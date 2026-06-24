## Why

O projeto "IAgora?" (fórum de alunos sobre spec-driven development) ainda não tem código: nenhuma base de app, build, testes ou integração com backend. Sem uma fundação técnica consistente — estrutura de pastas, integração Supabase via `@supabase/ssr`, convenções de segurança e tooling — qualquer feature futura (posts, comentários, auth UI) nasceria sobre terreno inconsistente. Esta change estabelece essa fundação para que todas as specs seguintes construam sobre padrões já validados.

## What Changes

- Inicializa app **Next.js** (última versão, App Router) + **TypeScript** + **Tailwind CSS v4** com **pnpm**.
- Define estrutura de pastas: `app/` (rotas) e `lib/` (lógica: `lib/supabase/`, `lib/auth/`, `lib/validation/`).
- Integra **Supabase** via `@supabase/ssr`: `createServerClient` (server) e `createBrowserClient` (client).
- Adiciona `middleware.ts` com refresh de sessão e proteção de rota.
- Cria `.env.example` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — documentando que a service role **NUNCA** vai ao client.
- Estabelece convenções: mutations em Server Actions com validação+sanitização (**Zod**); leituras em Server Components; **RLS** como camada final de defesa em TODAS as tabelas; código/tabelas/identificadores em inglês, UI em português.
- Configura tooling: **ESLint**, **Vitest** (unit/integração) e **Playwright** (E2E) com setup mínimo rodando.
- Define scripts pnpm: `dev`, `build`, `lint`, `test`, `test:e2e`.
- Entrega uma home/landing simples no estilo **neubrutalism** (design system `neubrutalism-DESIGN.md`).

Não inclui (ficam para specs seguintes): schema de banco (profiles/posts/comments), RLS policies concretas, telas de login/signup.

## Capabilities

### New Capabilities
- `app-foundation`: Bootstrap do projeto Next.js + TypeScript + Tailwind v4, estrutura de pastas `app/`/`lib/`, scripts pnpm e landing neubrutalism.
- `supabase-integration`: Clients SSR (`createServerClient`/`createBrowserClient`), middleware de sessão + proteção de rota, `.env.example` e regras de segredos (service role só no server).
- `dev-tooling`: ESLint, Vitest (unit/integração) e Playwright (E2E) com setup mínimo executável.
- `project-conventions`: Convenções documentadas — mutations via Server Actions com validação+sanitização (Zod), leituras via Server Components, RLS obrigatório, idioma de código vs UI.

### Modified Capabilities
<!-- Nenhuma — primeira change do projeto, sem specs existentes. -->

## Impact

- **Novo código**: todo o esqueleto do projeto (`package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `lib/`, `middleware.ts`, configs de Tailwind/ESLint/Vitest/Playwright).
- **Dependências**: `next`, `react`, `react-dom`, `typescript`, `tailwindcss` (v4), `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `vitest`, `@playwright/test`, `eslint`.
- **Segredos**: introduz `.env.example` (sem valores reais) e contrato de uso de chaves.
- **Sistemas externos**: Supabase (Postgres + Auth) — apenas wiring; sem schema ainda.
