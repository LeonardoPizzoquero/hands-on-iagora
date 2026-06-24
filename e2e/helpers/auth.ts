import { type Page, expect } from "@playwright/test";

/**
 * Cadastra um novo usuário pela UI. O projeto está com confirmação de email
 * desligada, então o signup já cria sessão e redireciona autenticado.
 * Retorna as credenciais para reuso (ex.: relogar como o mesmo usuário).
 */
export async function signupViaUI(page: Page, name: string) {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = "test-password-123";

  await page.goto("/signup");
  await page.getByLabel("Nome completo").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/Senha/).fill(password);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  // Após cadastro: autenticado (Header mostra link "Feed").
  await expect(page.getByRole("link", { name: "Feed" })).toBeVisible();

  return { email, password, name };
}

/**
 * Conta de professor fixa criada via SQL/MCP (role='teacher'). Usada para
 * exercitar a moderação. Não há UI para promover a teacher (proposital).
 */
export const TEACHER = {
  email: "e2e_teacher@example.com",
  password: "test-password-123",
  name: "Professora E2E",
};

/** Faz login pela UI e espera o estado autenticado. */
export async function login(
  page: Page,
  creds: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel(/Senha/).fill(creds.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("link", { name: "Feed" })).toBeVisible();
}
