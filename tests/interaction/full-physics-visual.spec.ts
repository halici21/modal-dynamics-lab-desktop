import { test, expect } from "@playwright/test";
for (const module of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
  test("full physics visual workspace " + module, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await page
      .getByLabel("Physics workspace", { exact: true })
      .selectOption(String(module));
    if (module === 4)
      await page.getByLabel("DOF count", { exact: true }).selectOption("10");
    if (module === 10)
      await page
        .getByRole("button", { name: "Compute response spectrum" })
        .click();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot("full-r2-core-" + module + ".png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.001,
    });
  });
}
test("full physics minimum light and reduced mode", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("3");
  await page
    .getByRole("button", { name: "Switch to light appearance" })
    .click();
  await expect(page).toHaveScreenshot("full-r2-core-minimum-light.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.001,
  });
});
