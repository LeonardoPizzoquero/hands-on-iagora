# user-profiles Specification

## Purpose

Define a tabela `profiles` ligada a `auth.users`, a criação automática de perfil no signup, e as policies de RLS para leitura, auto-edição e proteção do `role`.

## Requirements

### Requirement: Profiles Table Linked to Auth Users
O sistema SHALL ter uma tabela `profiles` ligada 1:1 a `auth.users` por `id`, com colunas `name`, `role` (`student` | `teacher`, default `student`) e `created_at`.

#### Scenario: Estrutura da tabela
- **WHEN** o schema é inspecionado após a migration
- **THEN** existe `profiles` com `id` referenciando `auth.users(id)`, `name`, `role` default `student` e `created_at`

### Requirement: Automatic Profile Creation on Signup
O sistema SHALL criar automaticamente um profile quando um novo usuário é cadastrado, com `role` igual a `student`.

#### Scenario: Profile criado no signup
- **WHEN** um novo usuário é criado no Supabase Auth com `name` no metadata
- **THEN** um registro correspondente em `profiles` é criado com aquele `name` e `role='student'`

### Requirement: RLS Enabled on Profiles
A tabela `profiles` MUST ter RLS habilitado com policies explícitas por operação.

#### Scenario: RLS habilitado
- **WHEN** a migration é aplicada
- **THEN** RLS está habilitado em `profiles` e existem policies para SELECT e UPDATE

### Requirement: Profile Read Access
Usuários autenticados SHALL poder ler perfis para exibir nomes de autores; perfis não contêm dados sensíveis.

#### Scenario: Ler nome de autor
- **WHEN** um usuário autenticado consulta `profiles`
- **THEN** ele obtém `id`, `name` e `role` necessários para exibir autoria

### Requirement: Profile Self-Update Only
Um usuário SHALL editar SOMENTE o próprio perfil.

#### Scenario: Edita próprio perfil
- **WHEN** um usuário atualiza o próprio `name`
- **THEN** a atualização é permitida

#### Scenario: Não edita perfil de outro
- **WHEN** um usuário tenta atualizar o perfil de outro usuário
- **THEN** a operação é negada pelo RLS

### Requirement: Role Not Self-Assignable
Um usuário comum MUST NOT alterar o próprio `role`.

#### Scenario: Tentativa de auto-promoção
- **WHEN** um usuário tenta mudar o próprio `role` para `teacher`
- **THEN** a operação é rejeitada (o `role` só muda por operação administrativa que ignora RLS)
