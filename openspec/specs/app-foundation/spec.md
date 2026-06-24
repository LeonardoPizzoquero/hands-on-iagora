# app-foundation Specification

## Purpose

Estabelece a fundação do app Next.js: scaffold, estrutura de pastas, scripts pnpm e a landing page no design system neubrutalism.

## Requirements

### Requirement: Next.js App Scaffold
O projeto SHALL ser um app Next.js (última versão, App Router) com TypeScript e Tailwind CSS v4, gerenciado com pnpm, que compila sem erros.

#### Scenario: Build de produção bem-sucedido
- **WHEN** `pnpm build` é executado em uma instalação limpa
- **THEN** o build completa sem erros de TypeScript ou compilação

#### Scenario: Servidor de desenvolvimento sobe
- **WHEN** `pnpm dev` é executado
- **THEN** o servidor Next.js inicia e serve a aplicação em localhost

### Requirement: Folder Structure
O projeto SHALL organizar código em `app/` (rotas) e `lib/` (lógica), com subpastas `lib/supabase/`, `lib/auth/` e `lib/validation/`.

#### Scenario: Estrutura presente
- **WHEN** o repositório é inspecionado após o bootstrap
- **THEN** existem os diretórios `app/`, `lib/supabase/`, `lib/auth/` e `lib/validation/`

### Requirement: pnpm Scripts
O `package.json` SHALL definir os scripts `dev`, `build`, `lint`, `test` e `test:e2e`.

#### Scenario: Scripts disponíveis
- **WHEN** `package.json` é lido
- **THEN** os cinco scripts `dev`, `build`, `lint`, `test`, `test:e2e` estão definidos e executáveis

### Requirement: Neubrutalism Landing Page
A rota raiz `/` SHALL renderizar uma landing page aplicando o design system neubrutalism (bordas pretas grossas, sombras offset, cores de alta saturação, tipografia bold), sem gradientes nem blur.

#### Scenario: Landing carrega no estilo neubrutalism
- **WHEN** um visitante acessa `/`
- **THEN** a página renderiza com elementos de borda sólida e sombra offset característicos do design system, sem necessidade de autenticação

#### Scenario: Tokens do design system aplicados
- **WHEN** os estilos globais são inspecionados
- **THEN** tokens de `--border-width`, `--shadow-offset` e a paleta neubrutalism estão definidos e usados na landing
