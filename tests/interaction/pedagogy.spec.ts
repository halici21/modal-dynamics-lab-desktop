import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("first run offers a question, prediction and deterministic experiment", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("What carries the mass through equilibrium after the spring pulls it back?", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start guided lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "QUESTION" })).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Faster", exact: true }).click();
  await page.getByRole("button", { name: "Observe", exact: true }).click();
  await expect(page.getByRole("region", { name: "Learning depth" }).locator(".lesson-question")).toContainText("Displace the mass");
  await page.getByRole("button", { name: "Run the controlled experiment", exact: true }).click();
  await expect(page.getByRole("button", { name: "Experiment applied", exact: true })).toBeVisible();
});

test("Learn, Explore and Inspect are depths of one workspace", async ({ page }) => {
  await page.goto("/");
  await page.locator(".learning-mode-switch").getByText("Inspect", { exact: true }).click();
  await expect(page.getByText("Inspect the model", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Return to Explore", exact: true }).click();
  await expect(page.getByText("What carries the mass through equilibrium after the spring pulls it back?", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start guided lesson", exact: true }).click();
  await expect(page.getByRole("button", { name: "Learn", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("lesson skip persists last lesson without locking direct workspace access", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start guided lesson", exact: true }).click();
  await page.getByRole("button", { name: "Skip lesson", exact: true }).click();
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("7");
  await expect(page.getByRole("heading", { name: "FRF" })).toBeVisible();
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("modal-dynamics-lab:pedagogy:v1") ?? "{}").lastWorkspace);
  expect(persisted).toBe(7);
});

test("corrupted progress falls back to a usable first run", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("modal-dynamics-lab:pedagogy:v1", "{broken"));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start guided lesson", exact: true })).toBeVisible();
});







