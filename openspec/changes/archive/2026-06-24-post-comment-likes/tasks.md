## 1. Banco e RLS

- [x] 1.1 Migration `post_likes` (PK (user_id,post_id), FKs cascade, index post_id)
- [x] 1.2 Migration `comment_likes` (PK (user_id,comment_id), FKs cascade, index comment_id)
- [x] 1.3 RLS por operação (ambas): SELECT auth; INSERT `user_id=auth.uid()` AND não-autor do alvo; DELETE só a própria; sem UPDATE
- [x] 1.4 RPC `top_posts(p_limit int)` STABLE/invoker: post + author_name + like_count, ordenado por like_count desc
- [x] 1.5 `get_advisors` — só warning pré-existente de leaked-password; tipos TS regenerados

## 2. Dados e lógica

- [x] 2.1 Server Actions `togglePostLike`/`toggleCommentLike` (auth, user server-side, delete-ou-insert, retorna `{liked,count}`, erro de auto-curtida claro)
- [x] 2.2 `getFeed` aceita `sort`; recent = cursor atual; `top` = RPC. Anexa `likeCount` em lote
- [x] 2.3 Anexar `likeCount`+`likedByMe` em lote a feed, detalhe (`getPost`) e `getComments`; helper `canLike(viewer, authorId)`
- [x] 2.4 Testes Vitest: `canLike` (autor/anon não curte), reconciliação otimista (lógica pura do toggle)

## 3. UI (neubrutalism)

- [x] 3.1 `LikeButton` (client): count + estado curtido, loading, update otimista, escondido/desabilitado p/ autor/anon
- [x] 3.2 `PostCard` e detalhe do post: `LikeButton` com contagem
- [x] 3.3 `CommentItem`: `LikeButton` com contagem
- [x] 3.4 `/feed`: toggle "Mais recentes | Mais curtidos" (`?sort=top`), default recentes

## 4. E2E e fechamento

- [x] 4.1 Playwright: curtir incrementa e marca "curtido"; descurtir reverte
- [x] 4.2 Playwright: autor não vê controle de curtir no próprio conteúdo
- [x] 4.3 Playwright: `/feed?sort=top` ordena por mais curtidos
- [x] 4.4 Rodar `pnpm lint` e `pnpm test` — verde (lint 0, 39 unit, 14 E2E)