import { test, expect } from "@playwright/test";
for (const state of [
  "undamped",
  "light-damping",
  "moderate",
  "critical",
  "overdamped",
  "zero",
  "forces",
  "energy",
  "phase",
  "math",
  "dark",
  "light",
  "narrow",
  "reduced",
  "envelope",
]) {
  test("visual damped " + state, async ({ page }) => {
    if (state === "narrow")
      await page.setViewportSize({ width: 900, height: 680 });
    if (state === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await page.getByRole("button", { name: /02.*DAMPING/ }).click();
    const preset: Record<string, string> = {
      undamped: "Undamped",
      "light-damping": "Light damping",
      moderate: "Moderate damping",
      critical: "Critical damping",
      overdamped: "Overdamped",
    };
    if (preset[state])
      await page
        .getByRole("button", { name: preset[state], exact: true })
        .click();
    if (state === "light")
      await page
        .getByRole("button", { name: "Switch to light appearance" })
        .click();
    if (state === "zero") {
      for (const [name, value] of [
        ["Stiffness", "0"],
        ["Initial velocity", ".5"],
      ]) {
        const i = page.getByRole("textbox", { name: name + " value" });
        await i.fill(value);
        await i.press("Enter");
      }
    }
    const lens: Record<string, string> = {
      forces: "Forces",
      energy: "Energy",
      phase: "Phase Space",
      math: "Mathematics",
    };
    if (lens[state])
      await page
        .getByRole("button", { name: lens[state], exact: true })
        .click();
    if (state === "math") {
      await page.getByRole("button", { name: "Next →", exact: true }).click();
      await page.getByRole("button", { name: "Link c to damper" }).click();
    }
    await page.evaluate(() => window.__labClock.setTime(0.2));
    if (state === "envelope")
      await page.getByRole("button", { name: "Decay envelope" }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(50);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot("full-r2-damping-" + state + ".png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.001,
    });
  });
}

