## 1. Banco (FTS)

- [x] 1.1 Migration: `create extension unaccent with schema extensions` (não em public — advisor)
- [x] 1.2 Função `public.f_unaccent(text)` IMMUTABLE (wrapper de `extensions.unaccent` com dicionário explícito)
- [x] 1.3 Coluna `posts.search_vector` GENERATED (`to_tsvector('portuguese', f_unaccent(title||' '||content))`) + índice GIN
- [x] 1.4 RPC `public.search_posts(q text)` STABLE/invoker: `websearch_to_tsquery` + `f_unaccent`, `@@`, ordena por `ts_rank`, retorna id/title/created_at/author_id + nome do autor, limite 50
- [x] 1.5 `get_advisors` — só warning pré-existente de leaked-password; tipos TS regenerados

## 2. Dados e lógica

- [x] 2.1 `searchPosts(q)` em `lib/posts/queries.ts` chamando a RPC; normaliza/trima o termo; vazio → []
- [x] 2.2 Helper `parseSearchQuery`/`hasSearch` (extrai/limpa `q`); testes Vitest

## 3. UI (neubrutalism)

- [x] 3.1 `SearchBar` (client): input + submit → `/feed?q=`; mantém valor de `q`; botão limpar
- [x] 3.2 `/feed` lê `searchParams.q`: se busca → renderiza resultados (PostCard) por relevância; senão feed normal
- [x] 3.3 Estado vazio "nenhum post encontrado para «X»"; resultados mostram autor + data (via PostCard)

## 4. E2E e fechamento

- [x] 4.1 Playwright: busca acha post por título e por conteúdo
- [x] 4.2 Playwright: busca sem acento acha post com acento; estado vazio; `/feed?q=` compartilhável (reload mantém)
- [x] 4.3 Rodar `pnpm lint` e `pnpm test` — verde (lint 0, 33 unit, 11 E2E)
