## Why

O fórum precisa do seu conteúdo central: alunos publicam dúvidas/projetos em **posts** (markdown rico com imagens) e a comunidade responde em **comments**. Sem isso, autenticação e profiles não têm propósito. Esta é a feature que entrega o valor do produto.

## What Changes

### Posts
- Modelo `posts`: `title`, `content` (markdown), `author_id`, `created_at`, `updated_at`.
- Feed listando posts (mais recentes primeiro) com **paginação por cursor** em `created_at`.
- Página de detalhe do post.
- Criar / editar / apagar post (apenas autenticados; editar/apagar só o autor).
- Em todo lugar que post aparece: **nome do autor** (de `profiles`) + data.
- Editor markdown na criação/edição.
- Renderização **segura** do markdown (subset GFM, sanitização anti-XSS, sem HTML cru).
- **Upload de imagem** para o conteúdo via Supabase Storage, servida por **signed URL**. Limites: jpg/png/webp, máx **5MB**.
- Validações: `title` obrigatório ≤200, `content` obrigatório, ambos sanitizados.
- Estados: feed vazio ("ainda não há posts"), erro de upload/validação com mensagem clara, confirmação antes de apagar.

### Comments
- Modelo `comments`: `content` (texto plano, SEM markdown), `post_id`, `author_id`, `created_at`, `updated_at`.
- Na página de detalhe: lista **plana** de comentários, ordem **mais antigo → mais novo**.
- Cada comentário: nome do autor (de `profiles`) + data.
- Criar comentário; editar/apagar só o próprio.
- **Contagem de comentários** exibida no post.
- Validações: `content` obrigatório ≤1000, sanitizado (anti-XSS).
- Estados: vazio ("seja o primeiro a comentar"), erro de validação, confirmação antes de apagar, loading ao enviar.

### Segurança (ambos)
- **RLS obrigatório** cobrindo cada operação explicitamente (ler/criar/editar/apagar).
- Mutations em **Server Actions** (validação + sanitização antes do banco). Leituras em **Server Components**.
- Moderação do professor fica fora deste change (prompt separado).

## Capabilities

### New Capabilities
- `posts`: criação/edição/remoção, feed paginado por cursor, detalhe, autoria de `profiles`, editor + render seguro de markdown, upload de imagem em Storage com signed URL, RLS por operação.
- `comments`: comentários em texto plano por post, lista plana ordenada, contagem, edição/remoção pelo autor, RLS por operação.

### Modified Capabilities
<!-- Nenhum requisito de spec existente muda. posts/comments consomem user-profiles e authentication mas não alteram seus requisitos. -->

## Impact

- **Banco**: novas tabelas `posts`, `comments` + policies RLS; bucket de Storage para imagens de post + policies.
- **App**: rotas de feed (`/`), detalhe (`/posts/[id]`), criar/editar (`/posts/new`, `/posts/[id]/edit`); Server Actions de posts e comments; componentes neubrutalism (PostCard, PostEditor, MarkdownRenderer, CommentList, CommentForm).
- **Deps**: lib de markdown + sanitizer (ex. `react-markdown` + `rehype-sanitize` / `remark-gfm`).
- **Consome**: `profiles` (nome do autor), Supabase Auth (sessão), `@supabase/ssr`.
- **Testes**: Vitest (validação/sanitização, cursor, permissões), Playwright (criar post→comentar→editar→apagar).
