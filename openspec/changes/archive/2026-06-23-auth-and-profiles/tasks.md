## 1. Schema e RLS (profiles)

- [x] 1.1 Escrever migration `supabase/migrations/<ts>_profiles.sql`: tabela `profiles` (id FK auth.users, name, role default 'student', created_at)
- [x] 1.2 Habilitar RLS + policies: SELECT (autenticado), UPDATE (`auth.uid() = id`); sem INSERT/DELETE para usuários
- [x] 1.3 Função+trigger `handle_new_user()` (`security definer`, `search_path=''`) — cria profile no signup com role 'student'
- [x] 1.4 Função+trigger `BEFORE UPDATE` que rejeita alteração de `role` por usuário comum
- [x] 1.5 Aplicar migration via MCP Supabase e rodar advisors (checar RLS) — projeto 'iagora', advisors 0 após hardening

## 2. Validação (Zod)

- [x] 2.1 Criar `lib/validation/auth.ts`: `signupSchema` (name trim/min/max, email, senha min 8), `loginSchema`
- [x] 2.2 Teste unit (Vitest) dos schemas: válido, senha curta, email inválido, nome vazio

## 3. Server Actions

- [x] 3.1 `lib/auth/actions.ts` — `signup` (valida, `signUp` com name em options.data, mapeia "Email já cadastrado", redirect home)
- [x] 3.2 `login` (valida, `signInWithPassword`, mapeia "Email ou senha inválidos", redirect home)
- [x] 3.3 `logout` (`signOut`, redirect `/login`)
- [x] 3.4 Helper `getCurrentProfile()` (server) — user + profile (fallback name = email)

## 4. UI auth (neubrutalism)

- [x] 4.1 Layout de rota `app/(auth)/layout.tsx` sem bloco de perfil
- [x] 4.2 `app/(auth)/login/page.tsx` + form client (`useActionState`/`useFormStatus`, loading, erro)
- [x] 4.3 `app/(auth)/signup/page.tsx` + form client (mesmos estados)

## 5. Header global

- [x] 5.1 Componente `Header` (server) com nome + menu de perfil + logout; oculto/sem perfil em rotas públicas
- [x] 5.2 Integrar header no layout das rotas autenticadas

## 6. Middleware

- [x] 6.1 Atualizar `lib/supabase/middleware.ts`: adicionar AUTH_ROUTES e redirect de autenticado em `/login`/`/signup` → home

## 7. Verificação final

- [x] 7.1 `pnpm lint` verde
- [x] 7.2 `pnpm build` sucesso
- [x] 7.3 `pnpm test` verde
