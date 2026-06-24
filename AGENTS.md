# IAgora? — Fórum de Alunos

## Objetivo

Fórum onde **alunos** publicam dúvidas e descrevem projetos criados, e **professor** e outros alunos comentam nesses posts. Projeto de aula sobre **spec-driven development**.

## Stack

- **Next.js** (última versão, App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (Postgres + Auth) como backend e banco
- **Vercel** para deploy
- **pnpm** (package manager) · **Vitest** (unit/integração) · **Playwright** (E2E) · **ESLint** (lint)
- Design system: **neubrutalism-DESIGN.md**

> **Idioma:** código, nomes de tabelas/colunas e identificadores **em inglês**. Conteúdo de UI voltado ao usuário pode ser em português.

## Quando usar as skills do projeto

- **design-taste-frontend** — sempre que criar ou alterar UI/telas; aplicar o design system `neubrutalism-DESIGN.md`. Deixe o layout moderno, bonito e com UX/UI impecável.
- **tailwind-design-system** — ao montar tokens, componentes reutilizáveis e padrões de Tailwind.
- **react-best-practices** — após editar componentes `.tsx`, revisar qualidade.
- **vercel-react-best-practices** — ao escrever/refatorar código React/Next visando performance e padrões de deploy na Vercel.
- **supabase** — qualquer tarefa de banco, auth, RLS, migrations ou integração `@supabase/ssr`.
- **execute-plan** — para implementar no código o que foi planejado: lê `steering/{US_ID}/US.md`, `steering/{US_ID}/{TASK_ID}/TASK.md` e `steering/{US_ID}/{TASK_ID}/PLAN.md`.
- **brainstorming → writing-plans** (superpowers) — antes de qualquer feature nova: primeiro design/spec, depois plano.
- **caveman**: use sempre que for implementar o código e definir as especificações

## Quando usar os MCPs

- **supabase** — inspecionar tabelas (`list_tables`), aplicar migrations, rodar SQL, checar advisors/logs antes de mudar schema.
- **context7** — buscar documentação atualizada de Next.js, Tailwind, Supabase e libs antes de codar (não confiar só na memória).
- **playwright** — testes E2E e verificação visual no navegador.
- **vercel** — operações de deploy e configuração na Vercel.

## Restrições e segurança

- **Spec-driven**: nenhuma feature sai do design sem spec aprovada → plano → implementação.
- **Auth**: Supabase Auth com roles `student` e `teacher`. Apenas autenticados criam posts/comentários.
- **RLS obrigatório** em todas as tabelas. Autor edita/apaga só o próprio conteúdo; professor tem permissões de moderação.
- **Segredos**: nunca commitar chaves (.env). `SUPABASE_SERVICE_ROLE_KEY` só no servidor, nunca no client. Client usa apenas a chave anon/publishable.
- Validar e sanitizar todo input do usuário (posts, comentários) — prevenir XSS/injeção.
- Não expor dados de outros usuários além do necessário.
- Não fazer commits com o texto "co author"
- Não usar comandos git que sobrescrevam o trabalho atual (ex: `git reset --hard`, `git push --force`), somente com autorização.
- Chamadas de API protegidas por autenticação e RLS, sem endpoints públicos sem controle de acesso.
- Faça commits pequenos e frequentes, seguindo o padrão de mensagens. Evite grandes mudanças em um único commit, pelo menos 1 por spec.

## Especificações e Tarefas

- Tente ao máximo paralelizar tarefas que não dependem uma da outra usando subagentes.

## Padrões de acesso a dados (Supabase + Next.js)

- Usar `@supabase/ssr` com `createServerClient` (server) e `createBrowserClient` (client).
- **Mutations** (criar/editar/apagar posts e comentários) → **Server Actions**, com validação e sanitização do input antes de tocar no banco.
- **Leituras** de página → Server Components (`createServerClient`).
- A chave anon/publishable PODE ir ao client (é o uso pretendido); a segurança vem do **RLS**, não de esconder a chave. `SUPABASE_SERVICE_ROLE_KEY` jamais no client.
- Server Actions e Route Handlers não dispensam RLS — RLS é a camada de defesa final.

## Padrões

- Commit: conventional commits: mensagem em inglês breve, tipo (feat, fix, chore, etc) e escopo opcional. Ex: `feat(posts): add post editing`.
- Branches: `main` protegida, PRs obrigatórios. Branch de feature: `conventional-commit/task-name`.
- Pull requests: Título seguindo conventional commits em português, descrição com o template abaixo:

```
## Descrição
Breve descrição do que a feature faz e qual problema resolve.
## Tipo de mudança
- [ ] Nova feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
## Checklist
- [ ] Meu código segue as diretrizes de estilo deste projeto
- [ ] Eu fiz uma autoavaliação do meu próprio código
- [ ] Eu comentei meu código, principalmente em partes difíceis de entender
```

## Testes e lint

- Todo código entregue precisa passar em `pnpm lint` e nos testes (`pnpm test`).
- Features com lógica → testes (Vitest). Fluxos principais → E2E (Playwright).
- Não marcar tarefa como concluída sem rodar lint + testes e confirmar que passam.
