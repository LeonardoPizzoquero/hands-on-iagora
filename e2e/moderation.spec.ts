import { test, expect } from "@playwright/test";
import { signupViaUI, login, TEACHER } from "./helpers/auth";

test("professor apaga post e comentário de aluno", async ({ page }) => {
  // Aluno cria post e comenta.
  await signupViaUI(page, "Aluno Alvo");
  const title = `Post moderável ${Date.now()}`;
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo (markdown)").fill("conteúdo do aluno");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const url = page.url();
  await page.getByPlaceholder("Escreva um comentário…").fill("comentário do aluno");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("comentário do aluno")).toBeVisible();

  // Professor entra e modera.
  await page.context().clearCookies();
  await login(page, TEACHER);
  await page.goto(url);

  // Apaga comentário do aluno (botão de moderação na seção de comentários).
  const commentsSection = page.locator("section");
  await commentsSection
    .getByRole("button", { name: "Apagar (moderar)" })
    .first()
    .click();
  await commentsSection.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("comentário do aluno")).toHaveCount(0);

  // Apaga o post do aluno (moderação, no cabeçalho do artigo) → volta ao feed.
  await page
    .locator("article")
    .getByRole("button", { name: "Apagar (moderar)" })
    .click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/feed$/);
});

test("aluno não-autor não vê controle de apagar", async ({ page }) => {
  await signupViaUI(page, "Autor A");
  const title = `Post privado ${Date.now()}`;
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo (markdown)").fill("conteúdo");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const url = page.url();

  await page.context().clearCookies();
  await signupViaUI(page, "Aluno B");
  await page.goto(url);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("button", { name: /Apagar/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
});

test("comentário de professor aparece com destaque", async ({ page }) => {
  // Aluno cria o post.
  await signupViaUI(page, "Dono do Post");
  const title = `Post com prof ${Date.now()}`;
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo (markdown)").fill("pergunta do aluno");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const url = page.url();

  // Professor comenta.
  await page.context().clearCookies();
  await login(page, TEACHER);
  await page.goto(url);
  await page.getByPlaceholder("Escreva um comentário…").fill("resposta do professor");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("resposta do professor")).toBeVisible();
  await expect(page.getByText("professor", { exact: true })).toBeVisible();
});
