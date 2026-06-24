-- Moderação do professor: teacher pode apagar QUALQUER post/comment.
-- A autorização vive no banco (RLS) — a UI sozinha não basta.
--
-- Critério "autor OU teacher" via subquery inline em profiles. Não usamos uma
-- função SECURITY DEFINER para não expô-la como RPC (/rest/v1/rpc). A RLS de
-- profiles já permite ao usuário autenticado ler o próprio role.

-- DELETE de posts: autor OU teacher.
drop policy "posts_delete_own" on public.posts;
create policy "posts_delete_author_or_teacher"
  on public.posts for delete
  to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'teacher'
    )
  );

-- DELETE de comments: autor OU teacher.
drop policy "comments_delete_own" on public.comments;
create policy "comments_delete_author_or_teacher"
  on public.comments for delete
  to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'teacher'
    )
  );
