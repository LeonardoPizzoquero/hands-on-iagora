# dev-tooling Specification

## Purpose

Define o ferramental de qualidade e testes do projeto: ESLint, Vitest (unit/integração) e Playwright (E2E).

## Requirements

### Requirement: ESLint Configured
O projeto SHALL ter ESLint configurado e `pnpm lint` SHALL passar sem erros no código de fundação.

#### Scenario: Lint passa
- **WHEN** `pnpm lint` é executado
- **THEN** termina sem erros de lint

### Requirement: Vitest Unit/Integration Setup
O projeto SHALL ter Vitest configurado para testes unitários/integração e `pnpm test` SHALL executar com ao menos um teste passando.

#### Scenario: Teste unitário verde
- **WHEN** `pnpm test` é executado
- **THEN** o Vitest roda e ao menos um teste-semente passa

### Requirement: Playwright E2E Setup
O projeto SHALL ter Playwright configurado para testes E2E e `pnpm test:e2e` SHALL executar com ao menos um teste passando.

#### Scenario: E2E verde na landing
- **WHEN** `pnpm test:e2e` é executado
- **THEN** o Playwright sobe a app e um teste-semente confirma que a landing `/` carrega
