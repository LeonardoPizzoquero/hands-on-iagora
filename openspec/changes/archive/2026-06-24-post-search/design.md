## Context

`posts` (title, content, author_id, timestamps) já existe com RLS (SELECT authenticated) e feed paginado por cursor em `lib/posts/queries.ts` + `/feed`. Falta busca. Requisito: FTS Postgres (não LIKE), relevância, acento-insensível PT, `?q=` na URL, RLS intacta.

## Goals / Non-Goals

**Goals:**
- Coluna `search_vector` (tsvector) gerada de title+content, config `portuguese`, sem acento, índice GIN.
- `searchPosts(q)` ordenando por `ts_rank`, com autor+data.
- `/feed?q=` compartilhável; sem `q` → feed normal.
- Input sanitizado; RLS inalterada.

**Non-Goals:**
- Busca em comentários; `ts_headline`/highlight; filtros (autor/data); paginação dos resultados (top N).

## Decisions

- **Wrapper IMMUTABLE `public.f_unaccent(text)`**: `unaccent` é `STABLE`, então não pode ser usado direto em coluna GENERATED nem em índice. Crio `f_unaccent` `IMMUTABLE` que chama `unaccent('public.unaccent', $1)` (dicionário explícito). Padrão recomendado pela doc do Postgres.
  - Alternativa: trigger mantendo a coluna — mais código e risco de divergência. GENERATED é declarativo e sempre consistente.
- **Coluna gerada**: `search_vector tsvector generated always as (to_tsvector('portuguese', f_unaccent(coalesce(title,'') || ' ' || coalesce(content,'')))) stored`. `to_tsvector` com regconfig literal é IMMUTABLE. Title e content juntos; relevância vem do `ts_rank` (poderia ponderar com setweight, mas mantenho simples — não-goal).
- **Índice**: `create index posts_search_vector_idx on posts using gin (search_vector)`.
- **Query** (`searchPosts`): `websearch_to_tsquery('portuguese', f_unaccent(q))` como query; `where search_vector @@ query` (passado via `.textSearch` do supabase-js ou RPC). Ordena `ts_rank(search_vector, query) desc`, limite top N (ex. 50). Mostra `author:profiles(name)` e `created_at`.
  - **supabase-js**: usar `.textSearch('search_vector', q, { type: 'websearch', config: 'portuguese' })`. Mas precisamos do `f_unaccent` no termo p/ casar a coluna sem acento. Decisão: **RPC `search_posts(q text)`** (SQL function, `security invoker`/`stable`) que aplica `f_unaccent` + `websearch_to_tsquery` + `ts_rank` e respeita RLS (invoker). Retorna id,title,created_at,author_id e nome do autor. Mais robusto que montar no client.
- **RLS**: `search_posts` é `SECURITY INVOKER` (default) e `STABLE` → executa com privilégios do chamador, então o RLS de `posts`/`profiles` continua valendo. Não vaza nada além do feed.
- **Sanitização**: `websearch_to_tsquery` parseia a sintaxe de busca web (aspas, OR, -) sem permitir injeção de operador tsquery cru nem SQL (vai como parâmetro). Termo também trimado; vazio → sem busca.
- **UI**: `/feed` Server Component lê `searchParams.q`. Se `q` não-vazio → `searchPosts(q)` e renderiza resultados (reusa `PostCard`) + estado vazio "nenhum post encontrado para «q»". Senão → feed atual. `SearchBar` client: input + submit que faz `router.push('/feed?q='+encodeURIComponent(term))` (ou `replace`), mantém valor de `q`.

## Risks / Trade-offs

- **`f_unaccent` IMMUTABLE mentindo sobre imutabilidade** (unaccent depende do dicionário) → é o padrão oficial documentado; o dicionário não muda em runtime. Aceito.
- **Coluna gerada em posts existentes** → STORED preenche no ALTER; custo único trivial no volume de aula.
- **`ts_rank` sem `setweight`** → título e conteúdo pesam igual; aceitável (não-goal ponderar).
- **RPC vs query inline** → RPC adiciona uma função, mas centraliza FTS e garante RLS por invoker; melhor que lógica de tsquery no client.
- **Top N sem paginação** → resultados grandes truncam; logar/limitar em 50 é suficiente p/ o escopo (documentado como não-goal).

## Migration Plan

1. `create extension if not exists unaccent;`
2. `f_unaccent(text)` IMMUTABLE; coluna `search_vector` GENERATED; índice GIN.
3. RPC `search_posts(q text)` retornando resultados rankeados (invoker, stable).
4. `get_advisors` security; regenerar tipos TS (RPC/coluna nova).
5. Rollback: drop function search_posts, drop index, drop column, drop f_unaccent, (extensão pode ficar).

## Open Questions

- Nenhuma — idioma (portuguese+unaccent), escopo (só posts), highlight (não) e rota (/feed?q=) já decididos com o usuário.
