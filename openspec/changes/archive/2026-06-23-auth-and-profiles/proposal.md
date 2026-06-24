## Why

A fundação (`bootstrap-foundation`) deixou o middleware de sessão e os clients SSR prontos, mas o app ainda não tem autenticação real nem identidade de usuário. Sem signup/login/logout e sem a tabela `profiles`, nenhuma feature de domínio (posts, comentários) pode existir — não há autor, não há controle de acesso. Esta change entrega a camada de identidade e auth sobre a qual todo o fórum será construído.

## What Changes

- Cria tabela `profiles` 1:1 com `auth.users` (`id`, `name`, `role` com default `student`, `created_at`), com **RLS habilitado** e policies por operação.
- Cria o profile automaticamente no signup via **trigger** `security definer` em `auth.users` (role sempre `student`; `teacher` é promovido manualmente no DB).
- Adiciona **Server Actions** `signup`, `login` e `logout`, com validação+sanitização Zod antes de tocar o banco.
- Define schemas Zod de auth: email válido, senha mínima de **8** caracteres, nome obrigatório (limite + trim/sanitização).
- Adiciona páginas públicas `/login` e `/signup` (formulários neubrutalism) com estados de loading e mensagens de erro claras (email já cadastrado, credenciais inválidas, campos vazios).
- Adiciona **header global** nas páginas autenticadas: nome do usuário + menu de perfil com ação de logout; ausente (ou sem bloco de perfil) em telas públicas.
- Estende a proteção de rota no middleware: rota protegida sem sessão → `/login`; usuário logado em `/login`/`/signup` → home.
- Adiciona migration SQL versionada em `supabase/migrations/` e a aplica via MCP Supabase.

Sem confirmação de email (signup cria sessão ativa direto). Sem UI de admin para promover `teacher` (manual no DB).

## Capabilities

### New Capabilities
- `authentication`: Signup/login/logout via Supabase Auth como Server Actions, validação Zod, proteção e redirecionamento de rotas por estado de sessão.
- `user-profiles`: Tabela `profiles` 1:1 com `auth.users`, criação automática no signup, roles `student`/`teacher`, RLS por operação.
- `app-shell`: Header global com identidade do usuário e logout, condicional entre rotas públicas e autenticadas.

### Modified Capabilities
- `supabase-integration`: A regra de proteção de rota do middleware passa a incluir o redirecionamento de usuários autenticados para fora de `/login` e `/signup`.

## Impact

- **Schema**: nova tabela `profiles`, trigger + função `security definer`, policies RLS. Migration em `supabase/migrations/`.
- **Novo código**: `app/(auth)/login`, `app/(auth)/signup`, `lib/auth/actions.ts`, `lib/validation/auth.ts`, componente de header, atualização de `lib/supabase/middleware.ts`.
- **Dependências**: nenhuma nova (Supabase, Zod já presentes).
- **Segurança**: RLS é a defesa final; `role` protegido contra auto-alteração; sanitização de `name`.
- **Sistemas externos**: projeto Supabase recebe migration aplicada via MCP.
