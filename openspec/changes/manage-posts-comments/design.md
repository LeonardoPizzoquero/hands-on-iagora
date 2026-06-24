## Context

Fórum spec-driven em Next.js (App Router) + TS + Tailwind + Supabase. Já existem: auth (`lib/auth`), profiles (migration `20260623000000_profiles.sql`), clients `@supabase/ssr` (`lib/supabase/{client,server,middleware}.ts`) e um schema-exemplo `lib/validation/post.ts` (title≤140, campo `body`). Este change entrega o conteúdo central: `posts` (markdown + imagens) e `comments` (texto plano). Constraints do projeto: RLS obrigatório, mutations em Server Actions com validação+sanitização, leituras em Server Components, design neubrutalism, segredos fora do client.

## Goals / Non-Goals

**Goals:**
- Tabelas `posts` e `comments` com RLS explícita por operação (SELECT/INSERT/UPDATE/DELETE).
- Feed paginado por cursor `created_at` (newest-first), detalhe, CRUD de posts, CRUD de comments.
- Nome do autor via join com `profiles` em todo lugar.
- Editor markdown + render seguro (subset GFM, sanitizado, sem HTML cru).
- Upload de imagem em Storage com signed URL, limites jpg/png/webp ≤5MB.
- Validação Zod compartilhada client+server.

**Non-Goals:**
- Moderação do professor (UPDATE/DELETE de terceiros) — change separado.
- Respostas aninhadas de comentários (lista plana só).
- Markdown em comentários; reações/likes; busca full-text; edição colaborativa.

## Decisions

- **Paginação cursor sobre `created_at` + `id` (tiebreaker)** vs offset. Cursor é estável sob inserções e escala. Query: `where (created_at, id) < (cursor_ts, cursor_id) order by created_at desc, id desc limit N`. Index `(created_at desc, id desc)`.
- **Markdown: `react-markdown` + `remark-gfm` + `rehype-sanitize`** com schema customizado (allowlist: headings, strong/em, links, listas, code, img). `skipHtml`/sem `rehype-raw` → HTML cru nunca renderiza. Links forçam `rel="noopener noreferrer"`, esquema só http/https. Render em Server Component.
- **Sanitização em duas camadas**: (1) Zod valida tamanho/obrigatoriedade no Server Action; (2) sanitize no render (markdown allowlist p/ posts; escape de texto p/ comments). Defesa final = RLS.
- **Comments = texto plano**: nunca interpretar markdown; render como texto escapado (`whitespace-pre-wrap`). Sem dangerouslySetInnerHTML.
- **Storage**: bucket privado `post-images`, path `{user_id}/{uuid}.{ext}`. Upload validado (MIME real + tamanho) no Server Action; servir via `createSignedUrl`. RLS de Storage: INSERT/UPDATE/DELETE só dono do path; SELECT via signed URL.
- **Mutations em Server Actions** (`app/posts/actions.ts`, `app/posts/[id]/comments/actions.ts`); leituras em Server Components com `createServerClient`. `author_id` setado server-side de `auth.getUser()`, nunca do form.
- **Validação compartilhada**: reescrever `lib/validation/post.ts` → `{ title ≤200, content }` (alinhar spec; campo `content` não `body`); novo `lib/validation/comment.ts` (`content ≤1000`).
- **Componentes neubrutalism**: `PostCard`, `PostEditor`, `MarkdownRenderer`, `ImageUploadButton`, `CommentList`, `CommentItem`, `CommentForm`, `DeleteConfirm`. Aplicar `neubrutalism-DESIGN.md` via skill design-taste-frontend.

## Risks / Trade-offs

- **XSS via markdown/links** → allowlist `rehype-sanitize`, sem `rehype-raw`, esquemas de URL restritos; teste com payloads `<script>`/`javascript:`.
- **MIME spoofing no upload** (extensão mentindo) → validar magic bytes/`Blob.type` server-side + limite de tamanho antes do upload; bucket privado.
- **Signed URL expira** → gerar na renderização do conteúdo (TTL curto); aceitável p/ páginas server-rendered.
- **Cursor com timestamps iguais** → desempate por `id`; evita itens pulados/duplicados.
- **Contagem de comentários cara em feed** → usar `count` agregada na query de detalhe; no feed, contagem opcional/lazy se custo alto.
- **`author_id` forjado** → setado server-side + RLS `with check (author_id = auth.uid())` como rede final.

## Migration Plan

1. Migration `posts` (+ index cursor, trigger `updated_at`, RLS policies por operação).
2. Migration `comments` (+ FK `post_id` on delete cascade, RLS por operação).
3. Migration Storage bucket `post-images` privado + policies.
4. Rollback: drop policies → drop tables → remover bucket (sem dados em prod, change inicial).
5. Rodar `get_advisors` (security) pós-migration.

## Open Questions

- Contagem de comentários no **feed** (não só detalhe)? Assumido: só no detalhe por ora; feed pode adicionar depois sem mudar spec.
- TTL exato da signed URL — definir na implementação (sugestão 1h).
