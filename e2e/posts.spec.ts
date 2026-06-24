import { test, expect } from "@playwright/test";
import { signupViaUI } from "./helpers/auth";

test("criar post → comentar → editar comentário → apagar post", async ({
  page,
}) => {
  await signupViaUI(page, "Aluno E2E");

  // Criar post
  const title = `Post E2E ${Date.now()}`;
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page
    .getByLabel("Conteúdo (markdown)")
    .fill("Conteúdo **markdown** do teste.");
  await page.getByRole("button", { name: "Publicar" }).click();

  // Detalhe
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Aluno E2E").first()).toBeVisible();

  // Comentar
  await page.getByPlaceholder("Escreva um comentário…").fill("Primeiro comentário");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("Primeiro comentário")).toBeVisible();
  await expect(page.getByText("Comentários (1)")).toBeVisible();

  // Editar comentário
  await page.getByRole("button", { name: "Editar" }).last().click();
  await page
    .getByRole("textbox")
    .last()
    .fill("Comentário editado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Comentário editado")).toBeVisible();

  // Apagar post (confirmação em 2 passos)
  await page.getByRole("button", { name: "Apagar" }).first().click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/feed$/);
});

test("não-autor não vê controles de editar/apagar", async ({ page }) => {
  await signupViaUI(page, "Autor");
  const title = `Post de outro ${Date.now()}`;
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo (markdown)").fill("conteúdo");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const url = page.url();

  // Outro usuário
  await page.context().clearCookies();
  await signupViaUI(page, "Outro");
  await page.goto(url);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
});
