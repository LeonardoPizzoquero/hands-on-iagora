## Context

Projeto novo, sem código. "IAgora?" é um fórum de alunos (dúvidas + projetos) com comentários de professor e alunos, usado como estudo de spec-driven development. A stack é fixada pelo `AGENTS.md`: Next.js (App Router) + TypeScript + Tailwind, pnpm, Supabase via `@supabase/ssr`, Vitest, Playwright, ESLint, design neubrutalism. Esta change só monta a fundação — as features de domínio (posts, comentários, auth UI, schema) virão em changes posteriores.

Decisões já travadas com o usuário: validação com **Zod**; **só fundação de app** (sem schema de DB nesta change); **só middleware** (sem telas login/signup ainda); **Tailwind v4**.

## Goals / Non-Goals

**Goals:**
- App Next.js + TS + Tailwind v4 instalado e buildável com pnpm.
- Estrutura `app/` + `lib/` (`supabase/`, `auth/`, `validation/`) com clients SSR prontos.
- `middleware.ts` fazendo refresh de sessão e protegendo rotas (matcher configurável).
- `.env.example` documentado com contrato de segredos (service role só no server).
- ESLint + Vitest + Playwright rodando com ao menos 1 teste verde cada.
- Landing neubrutalism aplicando tokens do design system.
- Convenções de segurança/idioma documentadas no código (comentários/README curto) e nas specs.

**Non-Goals:**
- Schema de banco (profiles/posts/comments) e RLS policies concretas.
- Telas de login/signup e fluxo de auth completo.
- CRUD de posts/comentários, roles `student`/`teacher` aplicados.
- Deploy na Vercel.

## Decisions

- **Tailwind v4 (CSS-first)**: tokens neubrutalism (`--border-width`, `--shadow-offset`, cores) via `@theme` em `app/globals.css`, sem `tailwind.config.ts`. Alternativa v3 descartada por ser a versão anterior; v4 é a atual e o pedido foi "última versão".
- **`@supabase/ssr` com dois clients**: `lib/supabase/server.ts` (`createServerClient`, usa `cookies()` do Next) e `lib/supabase/client.ts` (`createBrowserClient`). Alternativa: client único — descartada, não suporta corretamente cookies SSR/refresh.
- **Middleware de sessão**: `middleware.ts` na raiz chama helper `lib/supabase/middleware.ts` que faz `getUser()` + refresh de cookies e redireciona não-autenticados em rotas protegidas. `matcher` exclui assets estáticos. Padrão oficial Supabase + Next.
- **Variável de env `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (nome novo da publishable/anon key) exposta ao client por design; `SUPABASE_SERVICE_ROLE_KEY` sem prefixo `NEXT_PUBLIC_` para garantir que nunca chegue ao bundle client.
- **Zod para validação**: schemas em `lib/validation/`; sanitização de strings (trim/limites) nas Server Actions. DOMPurify deixado para quando houver render de HTML rico (não nesta fundação).
- **Vitest** com `environment: jsdom` para componentes + `globals: true`; **Playwright** com `webServer` apontando para `pnpm dev`. Testes-semente: 1 unit (util/validation) + 1 E2E (landing carrega).
- **Segurança como convenção documentada**: como não há tabelas ainda, RLS é registrado como requisito obrigatório nas specs (`project-conventions`) para vincular changes futuras.

## Risks / Trade-offs

- **Tailwind v4 ainda recente** → algumas libs/plugins podem ter docs defasadas. Mitigação: usar context7/docs oficiais ao configurar; manter config mínima CSS-first.
- **Middleware sem rotas protegidas reais ainda** → risco de matcher inerte/over-broad. Mitigação: matcher conservador + comentário marcando onde adicionar rotas; teste cobre que landing pública não é bloqueada.
- **`.env.example` sem valores** → `pnpm build`/E2E podem falhar se exigirem Supabase real. Mitigação: clients tolerantes a env ausente em build; E2E-semente só checa render estático da landing.
- **Convenções só documentadas (não forçadas)** → podem ser ignoradas em changes futuras. Mitigação: codificá-las nas specs `project-conventions` para virarem contrato verificável.

## Migration Plan

Projeto greenfield — sem migração. Rollback = descartar a branch. Validação final: `pnpm lint`, `pnpm build`, `pnpm test` verdes.

## Open Questions

- Nenhuma bloqueante. Ícones (Lucide vs Heroicons) e fonte mono (JetBrains Mono) seguem o design system; decisão fina fica na implementação da landing.
