## Why

O fórum precisa de moderação: conteúdo impróprio ou fora de tópico deve poder ser removido por um responsável. O professor (`role='teacher'`) exerce esse papel. Hoje só o autor apaga o próprio conteúdo — não há como moderar.

## What Changes

- **Professor pode apagar QUALQUER post**, mesmo não sendo o autor.
- **Professor pode apagar QUALQUER comentário**, mesmo não sendo o autor.
- **RLS (camada final)**: policies de DELETE de `posts` e `comments` passam de "só o autor" para **"autor OU teacher"**. A regra vive no banco — a UI sozinha não basta.
- **Server Actions** de delete deixam de barrar não-autores; a autorização passa a ser delegada ao RLS (autor OU teacher).
- **UI**: ações de moderação (apagar conteúdo de terceiros) aparecem **apenas para teacher**; aluno comum não as vê.
- **Confirmação** antes de apagar conteúdo de outra pessoa.
- **Destaque visual neubrutalism** para comentários feitos por professor.
- **Atribuição de role**: `teacher` é concedido **manualmente via SQL (service role / MCP)** — nada no repositório (público). Documentado, sem seed em código.
- **Escalonamento de privilégio**: garantir que aluno NÃO vira teacher sozinho (reforço/teste — já há trigger `prevent_role_self_change` + signup força `student`).
- **Não incluído**: editar conteúdo de terceiros (edição segue exclusiva do autor); ocultar/fixar/marcar resolvido.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova; moderação é uma extensão de posts/comments. -->

### Modified Capabilities
- `posts`: requisito de RLS de DELETE muda para "autor OU teacher"; novo requisito de moderação (professor apaga qualquer post; UI condicional ao role).
- `comments`: requisito de RLS de DELETE muda para "autor OU teacher"; novos requisitos de moderação (professor apaga qualquer comentário; UI condicional; destaque visual de comentários de professor).

## Impact

- **Banco**: nova migration — função `public.is_teacher(uuid)` (SECURITY DEFINER, lê `profiles.role`) e substituição das policies `posts_delete_own` / `comments_delete_own` por versões "autor OU teacher". Confirma que escalonamento segue bloqueado.
- **App**: helper `isTeacher` no contexto de profile; Server Actions `deletePost`/`deleteComment` removem o gate de não-autor (RLS decide); UI mostra apagar p/ autor OU teacher; `CommentItem` ganha destaque quando autor é professor (precisa expor `role` do autor nas queries).
- **Queries**: `getComments` e `getFeed`/`getPost` passam a trazer `role` do autor (p/ destaque e, no detalhe, decisão de UI).
- **Testes**: Vitest (lógica `isTeacher`, decisão de UI); E2E Playwright (teacher apaga post/comment de aluno; aluno não vê botão; aluno não consegue apagar alheio mesmo forçando).
