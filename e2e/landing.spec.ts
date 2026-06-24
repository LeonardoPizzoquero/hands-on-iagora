import { test, expect } from "@playwright/test";

test("landing carrega e é pública", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("IAgora?").first()).toBeVisible();
});
