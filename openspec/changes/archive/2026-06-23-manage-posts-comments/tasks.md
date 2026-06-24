## 1. Banco e RLS

- [x] 1.1 Migration `posts`: colunas (`id`, `title`, `content`, `author_id`→profiles, `created_at`, `updated_at`), trigger `updated_at`, index `(created_at desc, id desc)`
- [x] 1.2 RLS `posts` por operação: SELECT auth; INSERT auth `with check (author_id = auth.uid())`; UPDATE/DELETE só autor
- [x] 1.3 Migration `comments`: colunas (`id`, `content`, `post_id`→posts on delete cascade, `author_id`, `created_at`, `updated_at`), trigger `updated_at`, index `(post_id, created_at)`
- [x] 1.4 RLS `comments` por operação: SELECT auth; INSERT auth `with check (author_id = auth.uid())`; UPDATE/DELETE só autor
- [x] 1.5 Migration Storage bucket privado `post-images` + policies (INSERT/UPDATE/DELETE só dono do path)
- [x] 1.6 Rodar `get_advisors` (security) e gerar tipos TS

## 2. Validação e libs

- [x] 2.1 Reescrever `lib/validation/post.ts`: `{ title: ≤200 obrigatório, content: obrigatório }` (campo `content`)
- [x] 2.2 Criar `lib/validation/comment.ts`: `{ content: ≤1000 obrigatório }`
- [x] 2.3 Criar `lib/validation/image.ts`: MIME jpg/png/webp + tamanho ≤5MB
- [x] 2.4 Adicionar deps markdown: `react-markdown`, `remark-gfm`, `rehype-sanitize`
- [x] 2.5 `MarkdownRenderer` (Server Component): subset GFM, schema sanitize allowlist, sem HTML cru, links rel+esquema seguro
- [x] 2.6 Testes Vitest: validação post/comment/image + sanitização XSS (`<script>`, `javascript:`)

## 3. Posts — Server Actions e Storage

- [x] 3.1 `app/posts/actions.ts`: createPost / updatePost / deletePost (auth, valida, `author_id` server-side, sanitiza)
- [x] 3.2 Upload de imagem: action que valida MIME+tamanho, sobe em `{user_id}/{uuid}.ext`, retorna signed URL
- [x] 3.3 Helper de leitura: feed cursor (`created_at`,`id`), detalhe com join `profiles` + count de comentários
- [x] 3.4 Testes Vitest: cursor (sem dup/gap), enforcement de permissão/autor (RLS → E2E)

## 4. Posts — UI (neubrutalism)

- [x] 4.1 Feed `/feed` (Server Component): lista newest-first, nome autor+data, "load more" cursor, estado vazio "ainda não há posts"
- [x] 4.2 `PostCard` neubrutalism
- [x] 4.3 Detalhe `/posts/[id]`: markdown renderizado, autor+data, count, not-found
- [x] 4.4 `PostEditor` + editor markdown + `ImageUploadButton` (erros upload/validação claros)
- [x] 4.5 Rotas `/posts/new` e `/posts/[id]/edit` (só autor edita)
- [x] 4.6 `DeleteConfirm` antes de apagar post

## 5. Comments — Actions e UI

- [x] 5.1 `app/posts/[id]/comments/actions.ts`: create/update/delete (auth, valida ≤1000, `author_id` server-side, sanitiza)
- [x] 5.2 `CommentList`/`CommentItem` no detalhe: lista plana antiga→nova, nome autor+data, texto plano escapado
- [x] 5.3 `CommentForm`: estado loading ao enviar, erro de validação claro
- [x] 5.4 Editar/apagar próprio comentário + `DeleteConfirm`; contagem no post
- [x] 5.5 Estado vazio "seja o primeiro a comentar"

## 6. E2E e fechamento

- [x] 6.1 Playwright: criar post → comentar → editar → apagar; não-autor bloqueado
- [x] 6.2 Playwright: upload imagem válida + rejeição (tamanho/tipo)
- [x] 6.3 Rodar `pnpm lint` e `pnpm test` — confirmar verde
- [x] 6.4 Verificação visual neubrutalism (Playwright) feed/detalhe/editor
