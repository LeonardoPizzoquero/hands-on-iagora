## 1. Scaffold do projeto

- [x] 1.1 Inicializar app Next.js (última versão, App Router) + TypeScript + Tailwind CSS v4 com pnpm
- [x] 1.2 Configurar scripts pnpm em `package.json`: `dev`, `build`, `lint`, `test`, `test:e2e`
- [x] 1.3 Criar estrutura de pastas: `app/`, `lib/supabase/`, `lib/auth/`, `lib/validation/`
- [x] 1.4 Adicionar `.gitignore` cobrindo `.env*`, `node_modules`, `.next`, artefatos de teste

## 2. Design system neubrutalism

- [x] 2.1 Definir tokens no `app/globals.css` via `@theme` (`--border-width`, `--shadow-offset`, paleta, fontes)
- [x] 2.2 Implementar landing page `/` no estilo neubrutalism (borda sólida, sombra offset, sem gradiente/blur)
- [x] 2.3 Garantir landing pública e responsiva (mobile collapse <768px, sem `h-screen`)

## 3. Integração Supabase (SSR)

- [x] 3.1 Instalar `@supabase/ssr` e `@supabase/supabase-js`
- [x] 3.2 Criar `lib/supabase/server.ts` com `createServerClient` (cookies do Next)
- [x] 3.3 Criar `lib/supabase/client.ts` com `createBrowserClient`
- [x] 3.4 Criar `lib/supabase/middleware.ts` (refresh de sessão + helper de proteção)
- [x] 3.5 Criar `middleware.ts` na raiz com matcher excluindo assets estáticos
- [x] 3.6 Criar `.env.example` com as 3 variáveis + comentário de que service role é só server

## 4. Convenções e validação

- [x] 4.1 Instalar `zod` e criar pasta `lib/validation/` com schema-exemplo
- [x] 4.2 Documentar convenções (Server Actions+validação, Server Components leitura, RLS, idioma) em README curto / comentários

## 5. Tooling de testes e lint

- [x] 5.1 Configurar ESLint e garantir `pnpm lint` verde
- [x] 5.2 Configurar Vitest (jsdom, globals) + 1 teste unit-semente (util/validation)
- [x] 5.3 Configurar Playwright (`webServer` -> `pnpm dev`) + 1 teste E2E-semente (landing carrega)

## 6. Verificação final

- [x] 6.1 Rodar `pnpm lint` e confirmar verde
- [x] 6.2 Rodar `pnpm build` e confirmar sucesso
- [x] 6.3 Rodar `pnpm test` e confirmar verde (3/3). `pnpm test:e2e` — setup pronto, execução adiada a pedido
