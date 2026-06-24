## Why

O feed só lista posts recentes; conforme o fórum cresce, achar uma dúvida/projeto específico fica difícil. Uma busca por título e conteúdo, rápida e relevante, torna o histórico do fórum útil.

## What Changes

- **Busca full-text** de posts por `title` + `content` usando Postgres FTS (não `LIKE`).
- Coluna **`search_vector` (tsvector) gerada** a partir de `unaccent(title)` + `unaccent(content)` com config `portuguese`, e **índice GIN**.
- **Extensão `unaccent`** habilitada (busca ignora acentos; stemming em português).
- Campo de busca no **feed (`/feed`)**; com `?q=...` o feed exibe resultados da busca, sem `q` mantém o feed paginado normal.
- **Query na URL** (`/feed?q=termo`) — compartilhável e navegável.
- Resultados **ordenados por relevância** (`ts_rank`), preservando **nome do autor** (de `profiles`) e **data**.
- Estado vazio claro: **"nenhum post encontrado para «X»"**.
- Input de busca **sanitizado** via `websearch_to_tsquery` (trata operadores com segurança; sem SQL/injeção de operador).
- **RLS inalterada**: SELECT segue para qualquer autenticado; a busca não expõe nada além do que o feed já mostra.

### Fora de escopo
- Busca em comentários; destaque de trecho (`ts_headline`); filtros por autor/data; paginação dos resultados de busca (retorna top N por relevância).

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova; busca é uma extensão de posts. -->

### Modified Capabilities
- `posts`: novo requisito de busca full-text (coluna tsvector + índice GIN + ordenação por relevância) e comportamento do feed com `?q=`.

## Impact

- **Banco**: migration — `create extension unaccent`; função immutable `unaccent`-wrapper p/ índice; coluna `posts.search_vector` (GENERATED) + índice GIN. Sem mudança de RLS.
- **App**: `searchPosts(q)` em `lib/posts/queries.ts` (Server Component, `websearch_to_tsquery` + `ts_rank`); `/feed` lê `searchParams.q`; componente `SearchBar` (client, atualiza URL); estado vazio.
- **Testes**: Vitest (sanitização/normalização do termo, parsing de `searchParams`); E2E Playwright (buscar acha post por título e por conteúdo; acento; estado vazio; URL compartilhável).
