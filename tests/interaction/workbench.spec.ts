import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
});
test("rail expands with labels and completed physics labs are reachable", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Expand Lab Rail" }).click();
  await expect(
    page.getByRole("button", { name: "Collapse Lab Rail" }),
  ).toHaveAttribute("aria-expanded", "true");
  for (const n of ["03", "04", "05", "06"])
    await expect(
      page.locator(".trajectory button").filter({ hasText: n }),
    ).toBeEnabled();
  await page.getByRole("button", { name: /02.*DAMPING/ }).click();
  await expect(
    page.getByRole("heading", { name: "Damped SDOF" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Collapse Lab Rail" }).click();
  await expect(page.locator(".lab-rail")).toHaveCSS("width", "60px");
});
test("parameter dock collapse restores values and keyboard resizing preserves time", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Mass value" });
  await input.fill("4");
  await input.press("Enter");
  await page.evaluate(() => window.__labClock.setTime(0.2));
  await page.getByRole("button", { name: "Collapse Parameter Dock" }).click();
  await expect(
    page.getByRole("button", { name: "Show parameters" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Show parameters" }).click();
  await expect(input).toHaveValue("4");
  const handle = page.getByRole("separator", { name: "Resize Parameter Dock" });
  const before = (await page.locator("#parameter-dock").boundingBox())!.width;
  await handle.focus();
  await handle.press("ArrowRight");
  expect(
    (await page.locator("#parameter-dock").boundingBox())!.width,
  ).toBeGreaterThan(before);
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0.2);
});
test("selection opens contextual role and inspector dismiss restores focus", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Inspect spring", exact: true })
    .click();
  await expect(page.locator(".object-context")).toContainText(
    "Restoring force",
  );
  await expect(page.locator("[data-quantity=force]")).toHaveText("-10.0000");
  await page
    .getByRole("button", { name: "Collapse Context Inspector" })
    .click();
  await expect(
    page.getByRole("button", { name: "Inspect", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".spring-object")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
test("analysis collapse preserves envelope and detaches hidden frame work", async ({
  page,
}) => {
  await page.getByRole("button", { name: /02.*DAMPING/ }).click();
  await page.getByRole("button", { name: "Decay envelope" }).click();
  const before = await page.evaluate(
    () => window.__labClock.diagnostics().subscribers,
  );
  await page.getByRole("button", { name: "Collapse Analysis Deck" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.__labClock.diagnostics().subscribers),
    )
    .toBe(before - 1);
  await page.getByRole("button", { name: "Expand Analysis Deck" }).click();
  await expect(
    page.getByRole("button", { name: "Decay envelope" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("slider", { name: "Scrub simulation time" }).fill("0.2");
  expect(await page.evaluate(() => window.__labClock.read())).toBeCloseTo(
    0.2,
    8,
  );
});
test("resizing during playback retains one RAF and no idle React frame commits", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const h = page.getByRole("separator", { name: "Resize Analysis Deck" });
  const b = (await h.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y - 40, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(100);
  const r = await page.evaluate(async () => {
    const before = (window as any).__labCommits();
    await new Promise((r) => setTimeout(r, 400));
    return {
      commits: (window as any).__labCommits() - before,
      loops: window.__labClock.diagnostics().activeLoops,
    };
  });
  expect(r).toEqual({ commits: 0, loops: 1 });
});
test("minimum window preserves workspace and accessible dock/deck controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.reload();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show parameters" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Expand Analysis Deck" }),
  ).toBeVisible();
  expect(
    (await page.locator(".stage-column").boundingBox())!.width,
  ).toBeGreaterThan(750);
  await page.getByRole("button", { name: "Show parameters" }).click();
  await expect(page.getByRole("textbox", { name: "Mass value" })).toBeVisible();
  await page.getByRole("button", { name: "Expand Analysis Deck" }).click();
  await page.getByRole("slider", { name: "Scrub simulation time" }).fill("1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await page.locator(".playback").boundingBox())!.y).toBeLessThan(600);
});
test("expanded inspector and collapsed dock pass axe in both themes", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await page.getByRole("button", { name: "Collapse Parameter Dock" }).click();
  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("button", { name: "Switch to " + theme + " appearance" })
      .click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
test("reduced motion keeps shell changes immediate and exact frozen state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Collapse Analysis Deck" }).click();
  await page.getByRole("button", { name: "Expand Analysis Deck" }).click();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".extremes rect")).toHaveCount(2);
  expect(await page.evaluate(() => window.__labClock.read())).toBeCloseTo(0.1);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});
