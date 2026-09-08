import { test, expect } from "@playwright/test";
for (const state of [
  "mass",
  "spring",
  "freeze",
  "rail-expanded",
  "rail-collapsed",
  "parameters-collapsed",
  "inspector-collapsed",
  "deck-expanded",
  "deck-collapsed",
  "maximized",
  "intermediate",
])
  test("visual workbench " + state, async ({ page }) => {
    if (state === "maximized")
      await page.setViewportSize({ width: 1920, height: 1009 });
    if (state === "intermediate")
      await page.setViewportSize({ width: 1100, height: 760 });
    await page.goto("/");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    if (state === "mass")
      await page
        .getByRole("button", {
          name: "Inspect mass or drag to set initial displacement",
        })
        .click();
    if (state === "spring")
      await page
        .getByRole("button", { name: "Inspect spring", exact: true })
        .click();
    if (state === "freeze") {
      await page.evaluate(() => window.__labClock.setTime(0.2));
      await page.getByRole("button", { name: "Inspect", exact: true }).click();
    }
    if (state === "rail-expanded" || state === "rail-collapsed")
      await page.getByRole("button", { name: "Expand Lab Rail" }).click();
    if (state === "rail-collapsed")
      await page.getByRole("button", { name: "Collapse Lab Rail" }).click();
    if (state === "parameters-collapsed")
      await page
        .getByRole("button", { name: "Collapse Parameter Dock" })
        .click();
    if (state === "inspector-collapsed") {
      await page.getByRole("button", { name: "Inspect", exact: true }).click();
      await page
        .getByRole("button", { name: "Collapse Context Inspector" })
        .click();
    }
    if (state === "deck-expanded") {
      const h = page.getByRole("separator", { name: "Resize Analysis Deck" });
      await h.focus();
      await h.press("ArrowUp");
      await h.press("ArrowUp");
    }
    if (state === "deck-collapsed")
      await page
        .getByRole("button", { name: "Collapse Analysis Deck" })
        .click();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot("full-r2-workbench-" + state + ".png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.001,
    });
  });
