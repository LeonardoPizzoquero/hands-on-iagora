# IAgora? — Fórum de Alunos

Fórum onde **alunos** publicam dúvidas e projetos, e **professor**/colegas comentam. Projeto de aula sobre **spec-driven development**.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth) via `@supabase/ssr` · pnpm · Vitest · Playwright · ESLint. Design: `neubrutalism-DESIGN.md`.

## Setup

```bash
pnpm install
cp .env.example .env.local   # preencha com seu projeto Supabase
pnpm dev
```

## Scripts

| Script | Ação |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (unit/integração) |
| `pnpm test:e2e` | Playwright (E2E) |

## Estrutura

```
app/            # rotas (App Router) + globals.css (tokens neubrutalism)
lib/
  supabase/     # server.ts, client.ts, middleware.ts (clients SSR)
  auth/         # roles e helpers de autorização
  validation/   # schemas Zod
e2e/            # testes Playwright
middleware.ts   # refresh de sessão + proteção de rota
```

## Convenções (obrigatórias)

- **Mutations** (criar/editar/apagar) → **Server Actions**, com **validação + sanitização** via **Zod** antes de tocar o banco.
- **Leituras** de página → **Server Components** usando `lib/supabase/server.ts`.
- **RLS é a camada final de defesa**: toda tabela DEVE ter RLS habilitado. Server Actions e Route Handlers não dispensam RLS.
- **Segredos**: a publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) pode ir ao client; `SUPABASE_SERVICE_ROLE_KEY` **NUNCA** vai ao client e nunca usa prefixo `NEXT_PUBLIC_`.
- **Idioma**: código, tabelas e identificadores em **inglês**; UI voltada ao usuário pode ser em **português**.

> Spec-driven: nenhuma feature sai sem spec aprovada → plano → implementação (ver `openspec/`).
