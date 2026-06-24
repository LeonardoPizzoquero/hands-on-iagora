# authentication Specification

## Purpose

Define os fluxos de autenticação via Server Actions: signup, login e logout, redirecionamento de usuários autenticados para fora das rotas de auth, e os estados de loading/erro dos formulários.

## Requirements

### Requirement: Signup as Server Action
O sistema SHALL permitir cadastro com nome, email e senha via Server Action, validando e sanitizando o input com Zod antes de tocar o Supabase Auth.

#### Scenario: Cadastro bem-sucedido
- **WHEN** um visitante submete nome válido, email válido e senha com ao menos 8 caracteres
- **THEN** o usuário é criado no Supabase Auth, uma sessão ativa é estabelecida e ele é redirecionado para a home

#### Scenario: Email já cadastrado
- **WHEN** o email informado já pertence a uma conta
- **THEN** a action não cria conta e retorna a mensagem "Email já cadastrado"

#### Scenario: Senha curta
- **WHEN** a senha tem menos de 8 caracteres
- **THEN** a action rejeita o input com mensagem de erro e não chama o Supabase

#### Scenario: Nome obrigatório e sanitizado
- **WHEN** o nome está vazio ou excede o limite de tamanho
- **THEN** a action rejeita o input; quando válido, o nome é trimado/sanitizado antes de ser persistido

### Requirement: Login as Server Action
O sistema SHALL permitir login com email e senha via Server Action.

#### Scenario: Login bem-sucedido
- **WHEN** um usuário submete email e senha corretos
- **THEN** uma sessão é estabelecida e ele é redirecionado para a home

#### Scenario: Credenciais inválidas
- **WHEN** email ou senha estão incorretos
- **THEN** a action retorna a mensagem "Email ou senha inválidos" sem estabelecer sessão

#### Scenario: Campos vazios
- **WHEN** email ou senha estão vazios
- **THEN** a action rejeita com mensagem de campos obrigatórios

### Requirement: Logout as Server Action
O sistema SHALL permitir logout via Server Action que encerra a sessão.

#### Scenario: Logout
- **WHEN** um usuário autenticado aciona o logout
- **THEN** a sessão é encerrada e ele é redirecionado para `/login`

### Requirement: Auth Route Redirects for Authenticated Users
O sistema SHALL redirecionar usuários autenticados para fora das rotas de auth.

#### Scenario: Logado acessa /login
- **WHEN** um usuário autenticado acessa `/login` ou `/signup`
- **THEN** ele é redirecionado para a home

### Requirement: Form Loading and Error States
Os formulários de auth SHALL exibir estado de loading durante a submissão e mensagens de erro claras.

#### Scenario: Loading durante submit
- **WHEN** um formulário de login ou signup está sendo processado
- **THEN** o botão de submit fica em estado de loading/desabilitado até a resposta

#### Scenario: Erro exibido ao usuário
- **WHEN** uma action retorna erro
- **THEN** a mensagem é exibida no formulário de forma legível
