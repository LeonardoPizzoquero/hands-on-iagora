## Context

A fundação entregou clients SSR (`lib/supabase/server.ts`, `client.ts`), middleware com refresh + proteção de rota (prefixos `PROTECTED_PREFIXES`, redireciona não-autenticados para `/login`) e tooling (Vitest, Zod). Falta a camada de identidade: auth real + tabela de perfis. Esta change adiciona isso.

Decisões travadas com o usuário: **sem confirmação de email** (signup cria sessão ativa); **teacher promovido manualmente no DB** (signup sempre `student`); **senha mínima 8**; **migration versionada em `supabase/migrations/` aplicada via MCP Supabase**.

## Goals / Non-Goals

**Goals:**
- Signup/login/logout funcionando como Server Actions com validação Zod.
- Tabela `profiles` 1:1 com `auth.users`, profile criado automaticamente no signup, RLS por operação.
- Header global com nome + logout em rotas autenticadas; ausente/sem perfil nas públicas.
- Redirecionamentos: protegida sem sessão → `/login`; logado em `/login`/`/signup` → home.
- Mensagens de erro claras e estados de loading nos formulários.

**Non-Goals:**
- Confirmação de email, reset de senha, OAuth.
- UI de admin / moderação / promoção de role.
- CRUD de posts/comentários (próxima change).

## Decisions

- **Criação do profile via trigger `security definer`**: função `handle_new_user()` em `auth.users` (AFTER INSERT) insere em `profiles` com `role='student'` e `name` vindo de `raw_user_meta_data.name`. Alternativa (inserir na action de signup) descartada: a action usa client anon e a policy de INSERT em `profiles` complicaria; trigger `security definer` é o padrão Supabase e roda fora do RLS.
  - O signup passa `name` em `options.data` (`supabase.auth.signUp({ email, password, options: { data: { name } } })`) para o trigger consumir.
- **`name` sanitizado na action também**: além do trigger, a action valida com Zod (`trim`, `min 2`, `max 80`) antes de chamar `signUp`, garantindo input limpo no metadata.
- **RLS em `profiles`**:
  - SELECT: `true` (qualquer autenticado lê) — necessário para exibir nome de autores em posts/comentários. Expõe só `id`/`name`/`role`, dados não sensíveis. Alternativa "só próprio perfil" descartada: quebraria exibição de autores.
  - INSERT: nenhuma policy para usuários (apenas o trigger `security definer` insere).
  - UPDATE: `using (auth.uid() = id)` — só o dono. **`role` protegido** por trigger `BEFORE UPDATE` que rejeita mudança de `role` por usuário comum (`auth.uid() = id` não pode alterar `role`); promoção a teacher é feita via SQL direto (service role / painel), que ignora RLS.
  - DELETE: nenhuma policy (perfis somem por cascade ao deletar o auth user).
- **Redirecionamento de autenticados** em `lib/supabase/middleware.ts`: além de `PROTECTED_PREFIXES`, adicionar `AUTH_ROUTES = ['/login','/signup']`; se há `user` e pathname está em AUTH_ROUTES → redirect para `/`.
- **Erros tipados**: as actions retornam `{ error?: string }` (não throw) para o client renderizar mensagens; usam `useActionState` + `useFormStatus` (`pending`) para loading. Mapear erros do Supabase: `user_already_exists`/duplicado → "Email já cadastrado"; `invalid_credentials` → "Email ou senha inválidos".
- **Header condicional**: `Header` server component lê `getUser()` + profile; renderiza bloco de perfil só se autenticado. Layout das rotas `(auth)` (login/signup) não inclui o header (ou inclui versão sem perfil). Logout é Server Action que chama `supabase.auth.signOut()` e `redirect('/login')`.

## Risks / Trade-offs

- **SELECT aberto a todos os autenticados** → expõe `name`/`role` de todos. Mitigação: são dados públicos do fórum (autor de post); nada sensível na tabela. Documentar para não adicionar colunas sensíveis em `profiles`.
- **Trigger `security definer`** roda com privilégio elevado → risco se mal escrito. Mitigação: função mínima, `set search_path = ''`, só INSERT em `profiles`.
- **"Confirm email" precisa estar OFF** no projeto Supabase, senão o login pós-signup falha. Mitigação: documentar no proposal/README; a action trata o caso de sessão ausente.
- **Bloqueio de auto-alteração de role via trigger** → se mal feito, pode travar updates legítimos de `name`. Mitigação: trigger só compara `OLD.role <> NEW.role` e levanta exceção apenas nesse caso.

## Migration Plan

1. Escrever `supabase/migrations/<timestamp>_profiles.sql`: tabela, RLS enable, policies, função+trigger de criação, função+trigger de proteção de role.
2. Aplicar via MCP Supabase (`apply_migration`); rodar advisors para checar RLS.
3. Rollback: migration de drop (tabela + funções + triggers) se necessário.

## Open Questions

Nenhuma bloqueante. `name` do header vem do profile; fallback para email se profile ainda não propagou.
