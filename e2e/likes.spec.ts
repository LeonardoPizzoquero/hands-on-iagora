import { test, expect } from "@playwright/test";
import { signupViaUI } from "./helpers/auth";

async function createPost(
  page: import("@playwright/test").Page,
  title: string,
) {
  await page.goto("/posts/new");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo (markdown)").fill("conteúdo para curtir");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  return page.url();
}

test("curtir incrementa e marca; descurtir reverte", async ({ page }) => {
  // Autor cria o post.
  await signupViaUI(page, "Autor Likes");
  const title = `Curtível ${Date.now()}`;
  const url = await createPost(page, title);

  // Outro usuário curte (autor não pode curtir o próprio).
  await page.context().clearCookies();
  await signupViaUI(page, "Curtidor");
  await page.goto(url);

  const likeBtn = page.getByRole("button", { name: "Curtir" });
  await expect(likeBtn).toBeVisible();
  await likeBtn.click();

  // Agora está curtido (botão vira "Descurtir") e a contagem é 1.
  const unlikeBtn = page.getByRole("button", { name: "Descurtir" });
  await expect(unlikeBtn).toBeVisible();
  await expect(unlikeBtn).toContainText("1");

  // Descurtir reverte.
  await unlikeBtn.click();
  await expect(page.getByRole("button", { name: "Curtir" })).toContainText("0");
});

test("autor não vê controle de curtir no próprio conteúdo", async ({ page }) => {
  await signupViaUI(page, "Autor Sozinho");
  const title = `Meu post ${Date.now()}`;
  const url = await createPost(page, title);
  await page.goto(url);

  // Sem botão de curtir/descurtir; a contagem aparece como texto (▲ 0).
  await expect(page.getByRole("button", { name: "Curtir" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Descurtir" })).toHaveCount(0);
});

test("/feed?sort=top ordena por mais curtidos", async ({ page }) => {
  // Autor cria dois posts distintos.
  await signupViaUI(page, "Autor Top");
  const a = `TOP-A ${Date.now()}`;
  const b = `TOP-B ${Date.now()}`;
  await createPost(page, a);
  const urlB = await createPost(page, b);

  // Outro usuário curte só o B.
  await page.context().clearCookies();
  await signupViaUI(page, "Votante");
  await page.goto(urlB);
  await page.getByRole("button", { name: "Curtir" }).click();
  await expect(page.getByRole("button", { name: "Descurtir" })).toContainText("1");

  // No feed por mais curtidos, B (1 like) vem antes de A (0) entre os nossos posts.
  await page.goto("/feed?sort=top");
  const headings = page.getByRole("heading", { level: 2 });
  const titles = await headings.allInnerTexts();
  const ia = titles.indexOf(a);
  const ib = titles.indexOf(b);
  expect(ib).toBeGreaterThanOrEqual(0);
  expect(ia).toBeGreaterThanOrEqual(0);
  expect(ib).toBeLessThan(ia);
});
