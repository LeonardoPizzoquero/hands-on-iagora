## Why

O fórum não tem sinal de qualidade/relevância além da data. Curtidas (upvotes) deixam a comunidade destacar boas dúvidas, projetos e respostas, e permitem ordenar o feed pelos posts mais valorizados.

## What Changes

- **Curtir/descurtir (toggle)** posts e comentários: cada usuário autenticado dá no máximo 1 curtida por item.
- **Duas tabelas** `post_likes` e `comment_likes` (FK real ao alvo + ao usuário, `on delete cascade`), com **unique (user_id, post_id)** / **unique (user_id, comment_id)**.
- `user_id` sempre setado server-side; **ninguém curte em nome de outro** (RLS `with check`).
- **Bloquear auto-curtida**: não é possível curtir o próprio post/comentário (RLS + UI).
- **Contagem de curtidas** e estado **"curtido por mim"** exibidos em cada post (feed e detalhe) e comentário.
- **Ordenar feed por mais curtidos** via `?sort=top` (além do padrão **mais recentes**, que permanece o default).
- **UX**: botão com estado de **loading** e **atualização otimista** da contagem.
- Mutations em **Server Actions**; **RLS obrigatório** em ambas as tabelas.

### Fora de escopo
- Downvotes; curtidas em respostas aninhadas (comentários são lista plana); ranking/score ponderado por tempo; notificações.

## Capabilities

### New Capabilities
- `likes`: tabelas `post_likes`/`comment_likes`, toggle, unicidade por usuário, proibição de auto-curtida e curtir-por-outro, RLS por operação, contagem e estado "curtido por mim".

### Modified Capabilities
- `posts`: feed passa a aceitar ordenação por mais curtidos (`?sort=top`); itens do feed e detalhe exibem contagem de curtidas e estado do usuário.
- `comments`: cada comentário exibe contagem de curtidas e estado do usuário, com toggle.

## Impact

- **Banco**: migration — `post_likes`, `comment_likes` (unique + FKs cascade), RLS por operação (SELECT auth; INSERT `user_id=auth.uid()` e `author <> auth.uid()`; DELETE só própria). Sem mudança em posts/comments.
- **App**: Server Actions `togglePostLike`/`toggleCommentLike`; queries do feed/detalhe/comentários trazem `likeCount` + `likedByMe`; ordenação `top` no feed (e na paginação por cursor de curtidas); componente client `LikeButton` (otimista + loading).
- **Tipos**: regenerar tipos TS (tabelas novas).
- **Testes**: Vitest (lógica de toggle/optimistic, permissão); E2E Playwright (curtir/descurtir, contagem, não curtir o próprio, ordenar por top).
