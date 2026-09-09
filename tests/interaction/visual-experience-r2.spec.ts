import { test, expect } from "@playwright/test";

/**
 * VISUAL EXPERIENCE R2 — the renderer-decision evidence page survives R3.
 *
 * The five shell-level tests that used to live here targeted the retired R2
 * workbench (numbered rail, parameter dock, analysis deck). Their coverage
 * moved to cad-r3-shell.spec.ts and cad-r3-viewport.spec.ts; what remains
 * here is the one thing R3 must not break — the recorded evidence behind
 * docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md.
 */

test("R2 renderer study mounts A, B and C on one shared physics case", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?r2=renderer-study");
  await expect(page.getByRole("heading", { name: "Renderer decision lab" })).toBeVisible();
  for (const name of ["A · Refined SVG", "B · Three.js 2.5D", "C · Spatial Three.js"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("button", { name })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await expect(page.locator(".r2-three-host canvas")).toBeVisible();
  expect(errors).toEqual([]);
});

test("R2 renderer study keeps its own styling after the shell swap", async ({
  page,
}) => {
  await page.goto("/?r2=renderer-study");
  const padded = await page.evaluate(() => {
    const el = document.querySelector(".r2-study-stage");
    return el ? parseFloat(getComputedStyle(el).padding) : 0;
  });
  expect(padded).toBeGreaterThan(0);
});
