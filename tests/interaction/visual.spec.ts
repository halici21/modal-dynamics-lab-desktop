import { test, expect } from "@playwright/test";
for (const state of [
  "dark",
  "light",
  "narrow",
  "reduced",
  "forces",
  "energy",
  "phase",
  "math",
  "zero",
] as const) {
  test("visual SDOF " + state, async ({ page }) => {
    if (state === "narrow")
      await page.setViewportSize({ width: 900, height: 680 });
    if (state === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    if (state === "light")
      await page
        .getByRole("button", { name: "Switch to light appearance" })
        .click();
    if (["forces", "energy", "phase", "math"].includes(state))
      await page
        .getByRole("button", {
          name: {
            forces: "Forces",
            energy: "Energy",
            phase: "Phase Space",
            math: "Mathematics",
          }[state as "forces" | "energy" | "phase" | "math"],
          exact: true,
        })
        .click();
    if (state === "math") {
      await page.getByRole("button", { name: "Next →", exact: true }).click();
      await page
        .getByRole("button", { name: "Link k to spring", exact: true })
        .click();
    }
    if (state === "zero") {
      const k = page.getByRole("textbox", { name: "Stiffness value" });
      await k.fill("0");
      await k.press("Enter");
    }
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot("full-r2-sdof-" + state + ".png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.001,
    });
  });
}
