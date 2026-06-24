-- Busca full-text de posts (title + content), config 'portuguese', acento-insensível.
-- Coluna tsvector GERADA + índice GIN. RLS de posts inalterada.

-- Extensão no schema dedicado `extensions` (não em public — advisor de segurança).
create extension if not exists unaccent with schema extensions;

-- unaccent é STABLE; coluna GENERATED e índices exigem IMMUTABLE.
-- Wrapper com dicionário explícito (padrão recomendado pela doc do Postgres).
create function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent', $1);
$$;

revoke execute on function public.f_unaccent(text) from public, anon;

alter table public.posts
  add column search_vector tsvector
  generated always as (
    to_tsvector(
      'portuguese',
      public.f_unaccent(coalesce(title, '') || ' ' || coalesce(content, ''))
    )
  ) stored;

create index posts_search_vector_idx on public.posts using gin (search_vector);

-- Busca rankeada. SECURITY INVOKER (default) + STABLE: roda com os privilégios
-- do chamador, então a RLS de posts/profiles continua valendo (não vaza nada).
create function public.search_posts(q text)
returns table (
  id uuid,
  title text,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  rank real
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
    ts_rank(p.search_vector, websearch_to_tsquery('portuguese', public.f_unaccent(q))) as rank
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where p.search_vector @@ websearch_to_tsquery('portuguese', public.f_unaccent(q))
  order by rank desc, p.created_at desc
  limit 50;
$$;
