## MODIFIED Requirements

### Requirement: Session Middleware and Route Protection
O sistema SHALL ter um `middleware.ts` que atualiza (refresh) a sessão do usuário a cada request, protege rotas designadas redirecionando usuários não autenticados para `/login`, e redireciona usuários autenticados para fora das rotas de auth (`/login`, `/signup`).

#### Scenario: Refresh de sessão
- **WHEN** uma request chega com cookies de sessão válidos
- **THEN** o middleware revalida o usuário e propaga os cookies atualizados na response

#### Scenario: Rota protegida sem sessão
- **WHEN** um usuário não autenticado acessa uma rota protegida
- **THEN** o middleware redireciona para `/login`

#### Scenario: Landing pública não é bloqueada
- **WHEN** um visitante não autenticado acessa a landing pública `/`
- **THEN** o middleware permite o acesso sem redirecionar

#### Scenario: Usuário autenticado em rota de auth
- **WHEN** um usuário autenticado acessa `/login` ou `/signup`
- **THEN** o middleware redireciona para a home
