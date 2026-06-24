-- Curtidas (upvotes) em posts e comentários. Duas tabelas, 1 like por usuário/item.
-- RLS é a camada final: ninguém curte por outro nem o próprio conteúdo.

create table public.post_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index post_likes_post_id_idx on public.post_likes (post_id);

create table public.comment_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_id uuid not null references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);
create index comment_likes_comment_id_idx on public.comment_likes (comment_id);

alter table public.post_likes enable row level security;
alter table public.comment_likes enable row level security;

-- post_likes: SELECT auth; INSERT self + não-autor (sem auto-curtida); DELETE só a própria.
create policy "post_likes_select_authenticated"
  on public.post_likes for select
  to authenticated
  using (true);

create policy "post_likes_insert_own_not_author"
  on public.post_likes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and auth.uid() <> (select author_id from public.posts where id = post_id)
  );

create policy "post_likes_delete_own"
  on public.post_likes for delete
  to authenticated
  using (user_id = auth.uid());

-- comment_likes: idem.
create policy "comment_likes_select_authenticated"
  on public.comment_likes for select
  to authenticated
  using (true);

create policy "comment_likes_insert_own_not_author"
  on public.comment_likes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and auth.uid() <> (select author_id from public.comments where id = comment_id)
  );

create policy "comment_likes_delete_own"
  on public.comment_likes for delete
  to authenticated
  using (user_id = auth.uid());

-- Feed ordenado por mais curtidos (top N). SECURITY INVOKER + STABLE: respeita RLS.
create function public.top_posts(p_limit int default 10)
returns table (
  id uuid,
  title text,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  like_count bigint
)
language sql
stable
set search_path = ''
as $$
  select
    p.id,
    p.title,
    p.created_at,
    p.author_id,
    pr.name as author_name,
    count(pl.user_id) as like_count
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  left join public.post_likes pl on pl.post_id = p.id
  group by p.id, pr.name
  order by like_count desc, p.created_at desc, p.id desc
  limit p_limit;
$$;
