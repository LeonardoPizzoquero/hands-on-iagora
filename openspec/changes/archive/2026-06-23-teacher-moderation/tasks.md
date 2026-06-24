## 1. Banco e RLS

- [x] 1.1 Policy "autor OU teacher" via subquery inline em `profiles` (preferida sobre função SECURITY DEFINER, que o advisor sinaliza como RPC exposta)
- [x] 1.2 Substituir policy DELETE de `posts` por "autor OU teacher" (`posts_delete_author_or_teacher`)
- [x] 1.3 Substituir policy DELETE de `comments` por "autor OU teacher" (`comments_delete_author_or_teacher`)
- [x] 1.4 Rodar `get_advisors` (security) — só resta warning pré-existente de leaked-password (auth, fora do escopo)
- [x] 1.5 Conta teacher fixa p/ E2E criada e promovida via SQL/MCP (não versionada)

## 2. Dados e lógica

- [x] 2.1 Expor `role` do autor em `getComments` (e tipo `CommentView.authorRole`)
- [x] 2.2 Helper de UI `canDelete`/`isModerating` (autor OU teacher); testes Vitest
- [x] 2.3 Não-escalonamento: verificado que nenhum código do app escreve `profiles.role`; guarda é o trigger `prevent_role_self_change` (spec user-profiles)

## 3. Server Actions

- [x] 3.1 `deletePost`/`deleteComment` já só exigem sessão e delegam autorização ao RLS (sem gate de autoria na app) — confirmado, sem mudança

## 4. UI (neubrutalism)

- [x] 4.1 Detalhe do post: apagar p/ autor OU teacher; `DeleteConfirm` com pergunta de moderação p/ conteúdo de terceiro
- [x] 4.2 `CommentItem`: apagar p/ autor OU teacher; pergunta de moderação p/ terceiros (editar só autor)
- [x] 4.3 `CommentItem`: destaque neubrutalism quando `authorRole === 'teacher'` (selo "professor" + realce)
- [x] 4.4 Aluno comum NÃO vê controle de moderação (via `canDelete`)

## 5. E2E e fechamento

- [x] 5.1 Playwright: teacher apaga post de aluno; teacher apaga comentário de aluno
- [x] 5.2 Playwright: aluno não-autor não vê botão de apagar em conteúdo alheio
- [x] 5.3 Playwright: comentário de professor aparece com destaque
- [x] 5.4 Rodar `pnpm lint` e `pnpm test` — verde (lint 0, 28 unit, 9 E2E)
