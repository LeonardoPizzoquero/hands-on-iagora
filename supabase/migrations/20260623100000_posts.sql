-- Posts: conteúdo central do fórum. Markdown rico, autor = profile.
-- RLS é a camada final de defesa; cada operação tem policy explícita.

-- Função genérica p/ manter updated_at (reutilizada por posts e comments).
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  content text not null check (char_length(content) >= 1),
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Paginação por cursor: order by created_at desc, id desc.
create index posts_created_at_id_idx on public.posts (created_at desc, id desc);
create index posts_author_id_idx on public.posts (author_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- SELECT: qualquer autenticado lê posts.
create policy "posts_select_authenticated"
  on public.posts for select
  to authenticated
  using (true);

-- INSERT: autenticado, sempre como autor = usuário atual.
create policy "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

-- UPDATE: somente o autor (moderação do professor entra em change futura).
create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- DELETE: somente o autor.
create policy "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);
