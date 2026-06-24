# app-shell Specification

## Purpose

Define o shell da aplicação: header global em páginas autenticadas com nome do usuário e menu de perfil/logout, e o comportamento do header em telas públicas.

## Requirements

### Requirement: Global Header on Authenticated Pages
O sistema SHALL exibir um header global nas páginas autenticadas mostrando o nome do usuário logado e um menu/área de perfil com a ação de logout.

#### Scenario: Header autenticado
- **WHEN** um usuário autenticado acessa uma página protegida
- **THEN** o header exibe o nome do usuário e um menu de perfil com a ação de logout

#### Scenario: Logout pelo header
- **WHEN** o usuário aciona logout no menu de perfil
- **THEN** a sessão é encerrada e ele é redirecionado para `/login`

### Requirement: No Profile Block on Public Pages
Em telas públicas (login/signup) o header SHALL não aparecer ou aparecer sem o bloco de perfil.

#### Scenario: Telas públicas sem bloco de perfil
- **WHEN** um visitante não autenticado acessa `/login` ou `/signup`
- **THEN** o header não exibe nome de usuário nem ação de logout
