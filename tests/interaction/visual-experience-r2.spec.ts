import { test, expect } from "@playwright/test";

test("R2 renderer study mounts A, B and C on one shared physics case", async ({ page }) => {
  await page.goto("/?r2=renderer-study");
  await expect(page.getByRole("button", { name: "A · Refined SVG" })).toBeVisible();
  await expect(page.locator(".r2-prototype-svg")).toBeVisible();
  await page.getByRole("button", { name: "B · Three.js 2.5D" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".r2-renderer-status")).toContainText("shared clock");
  await page.getByRole("button", { name: "C · Spatial Three.js" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".r2-renderer-status")).toContainText("WebGL");
});

test("R2 rail groups the thirteen workspaces without losing direct access", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("12");
  await page.getByRole("button", { name: "Expand Lab Rail" }).click();
  await expect(page.getByText("FOUNDATIONS", { exact: true })).toBeVisible();
  await expect(page.getByText("STRUCTURES", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "03 2DOF", exact: true }).click();
  await expect(page.getByRole("heading", { name: "2DOF" })).toBeVisible();
});

test("R2 minimum workspace preserves stage and avoids horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("4");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Play", exact: true }).or(page.getByRole("button", { name: "Pause", exact: true }))).toBeVisible();
  await expect(page.getByRole("region", { name: "Physics Stage", exact: true })).toBeVisible();
});

test("R2 inspector and analysis deck remain interruptible and keyboardable", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("4");
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Context Inspector" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse Context Inspector" }).press("Enter");
  await expect(page.getByRole("complementary", { name: "Context Inspector" })).toHaveCount(0);
  await page.getByRole("button", { name: "Collapse Analysis Deck" }).click();
  await expect(page.getByRole("button", { name: "Expand Analysis Deck" })).toBeVisible();
});

test("R2 playback keeps transient physics outside React commits", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("4");
  await page.getByLabel("DOF count", { exact: true }).selectOption("10");
  const before = await page.evaluate(() => (window as Window & { __labCommits?: () => number }).__labCommits?.() ?? 0);
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => (window as Window & { __labCommits?: () => number }).__labCommits?.() ?? 0);
  expect(after).toBe(before);
  await expect(page.locator("[data-core-value=x]").first()).toBeVisible();
});

test("R2 reduced motion keeps exact stage and scrub controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("3");
  await page.getByLabel("Physics analysis", { exact: true }).selectOption("Response");
  await expect(page.getByRole("region", { name: "Physics Stage", exact: true })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Scrub simulation time" })).toBeVisible();
});

