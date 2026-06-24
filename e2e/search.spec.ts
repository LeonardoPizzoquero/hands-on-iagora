import { test, expect } from "@playwright/test";
import { signupViaUI } from "./helpers/auth";

/** Cria um post com título/conteúdo únicos e retorna o token usado. */
async function createPost(page: import("@playwright/test").Page, token: string) {
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(`Dúvida sobre ${token}`);
  await page
    .getByLabel("Conteúdo (markdown)")
    .fill(`Tenho uma pergunta a respeito de ${token} no projeto.`);
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(
    page.getByRole("heading", { name: `Dúvida sobre ${token}` }),
  ).toBeVisible();
}

test("busca acha post por título e por conteúdo; estado vazio", async ({
  page,
}) => {
  await signupViaUI(page, "Buscador");
  const token = `xyzzy${Date.now()}`;
  await createPost(page, token);

  // Por título (o token está no título "Dúvida sobre <token>").
  await page.goto(`/feed?q=${token}`);
  await expect(
    page.getByRole("heading", { name: `Dúvida sobre ${token}` }),
  ).toBeVisible();

  // Por conteúdo (termo só presente no corpo).
  await page.goto(`/feed?q=projeto`);
  await expect(page.getByRole("link", { name: /Dúvida sobre/ }).first()).toBeVisible();

  // Estado vazio.
  await page.goto(`/feed?q=termoinexistente${Date.now()}`);
  await expect(page.getByText(/nenhum post encontrado para/)).toBeVisible();
});

test("busca sem acento acha post com acento e a URL é compartilhável", async ({
  page,
}) => {
  await signupViaUI(page, "Buscador 2");
  const token = `acento${Date.now()}`;
  await createPost(page, token);

  // "duvida" (sem acento) deve achar "Dúvida".
  await page.goto(`/feed?q=duvida ${token}`);
  await expect(
    page.getByRole("heading", { name: `Dúvida sobre ${token}` }),
  ).toBeVisible();

  // Reload mantém o resultado (URL carrega o estado).
  await page.reload();
  await expect(
    page.getByRole("heading", { name: `Dúvida sobre ${token}` }),
  ).toBeVisible();
  // O campo mantém o termo.
  await expect(page.getByLabel("Buscar posts")).toHaveValue(`duvida ${token}`);
});
