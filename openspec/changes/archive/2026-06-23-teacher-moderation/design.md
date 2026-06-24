## Context

Posts e comments já existem com RLS por operação (DELETE só autor). `profiles` tem `role` (`student`|`teacher`, default `student`), trigger `prevent_role_self_change` e signup que força `student`. Falta a camada de moderação: o professor precisa apagar conteúdo de qualquer um, no banco (RLS) e na UI. O repositório é público, então a promoção a `teacher` não pode estar no código.

## Goals / Non-Goals

**Goals:**
- RLS de DELETE de `posts`/`comments` = "autor OU teacher".
- Server Actions de delete delegam autorização ao RLS (sem gate de não-autor na app).
- UI mostra apagar p/ autor OU teacher; confirmação ao moderar conteúdo alheio.
- Destaque neubrutalism em comentários de professor.
- Reforçar/testar que aluno não escala para teacher.

**Non-Goals:**
- Editar conteúdo de terceiros (edição segue exclusiva do autor).
- Ocultar/fixar post, marcar resolvido.
- UI de administração para promover teacher (feito via SQL/MCP).
- Logs/auditoria de moderação.

## Decisions

- **Função `public.is_teacher(uid uuid) returns boolean`**, `SECURITY DEFINER`, `set search_path=''`, lê `public.profiles.role='teacher'`. Usada nas policies para evitar recursão de RLS e centralizar a regra. `revoke execute ... from anon` (mantém `authenticated` p/ uso em policy/checagem).
  - Alternativa considerada: subquery `exists(select 1 from profiles ...)` inline na policy — funciona (SELECT em profiles é permitido a authenticated), mas duplica a regra em 2 policies e acopla à RLS de profiles. Função é mais limpa.
- **Policies DELETE** `posts_delete_own`/`comments_delete_own` são **substituídas** por `posts_delete_author_or_teacher`/`comments_delete_author_or_teacher` com `using (auth.uid() = author_id or public.is_teacher(auth.uid()))`. UPDATE/INSERT/SELECT inalteradas.
- **Server Actions**: `deletePost`/`deleteComment` removem qualquer verificação de autoria na app — apenas exigem sessão e chamam o delete; o RLS é a autorização real. (Hoje elas já não checavam autoria explicitamente; o gate era a própria policy.)
- **Atribuição de role**: documentar comando SQL (`update public.profiles set role='teacher' where id = '<uuid>'`) rodado via service role/MCP. Nada versionado. Incluir no design/README do change, não em migration.
- **Exposição de `role` do autor nas queries**: `getComments` passa a trazer `author.role` (p/ destaque visual e, se necessário, decisão de UI). `getPost` já traz `author_id`; a decisão de moderação na UI usa o role do **usuário atual** (via `getCurrentProfile`), não do autor.
- **Decisão de UI**: mostrar controle de apagar quando `currentUser.id === author_id` **OU** `currentUser.role === 'teacher'`. Confirmação (DeleteConfirm) já existe; ajustar a pergunta quando for conteúdo de terceiro ("Apagar conteúdo de outro usuário (moderação)?").
- **Destaque de professor**: em `CommentItem`, se `comment.authorRole === 'teacher'`, badge/realce (ex.: borda/again cor `brand-red` + selo "prof").

## Risks / Trade-offs

- **`is_teacher` SECURITY DEFINER** poderia vazar dados se mal escrita → retorna apenas boolean, `search_path=''`, sem parâmetros sensíveis; `revoke execute from anon`.
- **UI mostrar botão mas RLS negar** (estado inconsistente) → a decisão de UI usa o mesmo critério do RLS (role do usuário atual); ainda assim o RLS é a verdade final e trata qualquer divergência.
- **Professor apaga por engano** → confirmação obrigatória ao moderar conteúdo de terceiros.
- **Promoção manual fora do código** → risco de esquecer/documentação divergir; mitigado documentando o comando no change e mantendo o teste de não-escalonamento.
- **Trazer role do autor em todas as queries** → custo trivial (join já existe em profiles).

## Migration Plan

1. Migration: cria `public.is_teacher(uuid)`; `drop policy` antigas de DELETE; `create policy` novas "autor OU teacher" em `posts` e `comments`.
2. `get_advisors` (security) pós-migration.
3. Regenerar tipos TS (sem mudança de tabela, mas função nova não afeta types).
4. Promover um usuário de teste a `teacher` via SQL/MCP para validar E2E.
5. Rollback: `drop policy` novas, recriar as antigas "só autor", `drop function is_teacher`.

## Open Questions

- Nenhuma pendente — escopo (delete-only), atribuição (SQL/MCP) e edição alheia (não) já definidos com o usuário.
