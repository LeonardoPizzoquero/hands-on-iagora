## Context

Posts e comments existem com RLS e feed por cursor (`created_at,id`) em `lib/posts/queries.ts` + `/feed` (já com busca `?q=`). Comentários têm `getComments`. Falta sinal de relevância. Requisito: curtir/descurtir posts e comentários (toggle), 1 por usuário (unique), contagem + "curtido por mim", ordenar feed por mais curtidos, sem curtir o próprio, sem curtir por outro — tudo com RLS.

## Goals / Non-Goals

**Goals:**
- `post_likes` / `comment_likes` com unique por usuário, FKs cascade, RLS por operação.
- Toggle via Server Action; `user_id` server-side; auto-curtida e curtir-por-outro bloqueados no banco.
- `likeCount` + `likedByMe` em feed, detalhe e comentários.
- Feed `?sort=top` (mais curtidos); default segue recentes.
- `LikeButton` com loading + update otimista.

**Non-Goals:**
- Downvotes; paginação por cursor do modo `top` (retorna top N); ranking ponderado por tempo; notificações.

## Decisions

- **Duas tabelas** `post_likes(user_id, post_id, created_at)` e `comment_likes(user_id, comment_id, created_at)`, PK composta ou id próprio + `unique (user_id, post_id)` / `(user_id, comment_id)`. FKs `on delete cascade` p/ `profiles`/`posts`/`comments`.
- **RLS por operação**:
  - SELECT: `to authenticated using (true)` (contagem é pública entre autenticados).
  - INSERT: `with check (user_id = auth.uid() and auth.uid() <> (select author_id from posts where id = post_id))` — garante self como liker E proíbe auto-curtida. Análogo p/ comment_likes via `comments`.
  - DELETE: `using (user_id = auth.uid())` — só a própria.
  - Sem UPDATE (like é imutável; toggle = insert/delete).
- **Toggle** (`togglePostLike(postId)` / `toggleCommentLike(commentId)`): lê `auth.getUser()`; tenta `delete` da própria like; se nada apagado, `insert`. Retorna `{ liked, count }` (conta após a operação) p/ reconciliar o otimista. Erros de RLS (auto-curtida) viram mensagem clara.
- **Contagem + likedByMe (recent feed / detalhe / comentários)**: queries em lote para evitar N+1 — dado o conjunto de ids da página: `select target_id, count(*) ... group by target_id` e `select target_id where user_id = me`. Anexa em memória. Mantém o cursor atual de `created_at,id` inalterado p/ o default.
- **Modo `top`**: RPC `top_posts(p_limit int)` `STABLE`/invoker que retorna campos do post + `author_name` + `like_count`, `order by like_count desc, created_at desc, id desc limit N`. Sem cursor (top N; LoadMore desativado em `top`). `likedByMe` anexado por query em lote. Decisão: top sem scroll infinito (não-goal) — simplicidade; spec exige só a ordenação.
- **UI**: `LikeButton` (client) recebe `target` (tipo+id), `count`, `liked`, `canLike` (false p/ autor/anon). Otimista: ao clicar, ajusta `liked`/`count` localmente, chama a action em `useTransition`, reconcilia com o retorno; loading desabilita o botão. Esconde/disabilita quando `canLike` é false (autor não curte o próprio). `/feed` ganha toggle "Recentes | Mais curtidos" (links `?sort=` ) — default sem param.
- **Onde aparece**: `PostCard` (feed), detalhe do post, `CommentItem`. Reusa `LikeButton`.

## Risks / Trade-offs

- **Auto-curtida via subquery na policy INSERT** → custo de 1 lookup por insert; trivial. Garante a regra no banco (não só UI).
- **Contagem em lote vs N+1** → batelada por página resolve; aceitável no volume de aula. Alternativa (coluna desnormalizada + trigger) é overkill aqui.
- **`top` sem cursor** → top N fixo; documentado como não-goal. Evita cursor composto frágil por contagem mutável.
- **Update otimista divergir do servidor** → a action retorna a contagem real; o componente reconcilia ao resolver.
- **Corrida no toggle (duplo clique)** → unique constraint + botão desabilitado no loading; insert duplicado falha sem dano.

## Migration Plan

1. Migration: `post_likes`, `comment_likes` (unique, FKs cascade, indexes por target), RLS por operação (SELECT/INSERT/DELETE).
2. RPC `top_posts(p_limit int)` (invoker, stable) com `like_count`.
3. `get_advisors` security; regenerar tipos TS.
4. Rollback: drop RPC, drop tables (cascade).

## Open Questions

- Nenhuma — modelo (2 tabelas), auto-curtida (bloqueada), ordenação default (recentes) e escopo (posts+comentários) decididos com o usuário.
