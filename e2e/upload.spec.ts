import { test, expect } from "@playwright/test";
import { signupViaUI } from "./helpers/auth";

// 1x1 PNG transparente
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

test("upload de imagem válida insere markdown no conteúdo", async ({ page }) => {
  await signupViaUI(page, "Uploader");
  await page.goto("/posts/new");

  await page.locator('input[type="file"]').setInputFiles({
    name: "foto.png",
    mimeType: "image/png",
    buffer: PNG_1x1,
  });

  await expect(page.getByLabel("Conteúdo (markdown)")).toHaveValue(
    /!\[imagem\]\(http/,
    { timeout: 15_000 },
  );
});

test("rejeita tipo não permitido", async ({ page }) => {
  await signupViaUI(page, "Uploader");
  await page.goto("/posts/new");

  await page.locator('input[type="file"]').setInputFiles({
    name: "doc.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("não é imagem"),
  });

  await expect(page.getByText(/Tipo não permitido/)).toBeVisible();
});

test("rejeita imagem acima de 5MB", async ({ page }) => {
  await signupViaUI(page, "Uploader");
  await page.goto("/posts/new");

  const big = Buffer.alloc(5 * 1024 * 1024 + 10, 0);
  await page.locator('input[type="file"]').setInputFiles({
    name: "grande.png",
    mimeType: "image/png",
    buffer: big,
  });

  await expect(page.getByText(/Imagem muito grande/)).toBeVisible();
});
