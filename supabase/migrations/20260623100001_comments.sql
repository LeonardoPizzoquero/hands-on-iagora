-- Comments: texto plano (SEM markdown) em posts. Autor = profile.
-- RLS por operação; on delete cascade ao apagar post ou autor.

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 1000),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lista por post, ordenada mais antigo -> mais novo.
create index comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

-- SELECT: qualquer autenticado lê comentários.
create policy "comments_select_authenticated"
  on public.comments for select
  to authenticated
  using (true);

-- INSERT: autenticado, sempre como autor = usuário atual.
create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

-- UPDATE: somente o autor.
create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- DELETE: somente o autor (moderação do professor entra em change futura).
create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);
