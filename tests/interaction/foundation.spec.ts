import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { SimulationClock } from "../../src/animation/SimulationClock";
declare global {
  interface Window {
    __labClock: SimulationClock;
  }
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
});
test("playback, rate, stepping, shared inspection and reset", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "2×", exact: true }).click();
  expect(await page.evaluate(() => window.__labClock.getState().rate)).toBe(2);
  await page.getByRole("button", { name: "Step", exact: false }).click();
  expect(await page.evaluate(() => window.__labClock.getState().playing)).toBe(
    false,
  );
  await page
    .getByRole("button", {
      name: "Inspect mass or drag to set initial displacement",
    })
    .click();
  await expect(page.locator(".carriage")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".response")).toHaveClass(/linked/);
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  await expect(page.locator(".carriage")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0);
  await expect(
    page.getByRole("button", { name: "1×", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("slider keyboard, pointer, numeric validation and shortcut isolation", async ({
  page,
}) => {
  const slider = page.getByRole("slider", {
    name: "Mass",
    exact: true,
  });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1.25");
  const box = await slider.boundingBox();
  await page.mouse.click(box!.x + box!.width * 0.75, box!.y + box!.height / 2);
  expect(Number(await slider.inputValue())).toBeGreaterThan(1);
  const input = page.getByRole("textbox", { name: "Mass value" });
  await input.fill("invalid");
  await input.press("Enter");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText("finite");
  await input.fill("10");
  await input.press("Enter");
  await expect(slider).toHaveValue("10");
  await input.fill("r");
  await input.press("r");
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0);
  await input.press("Escape");
  await expect(input).toHaveValue("10");
});
test("reduced motion preserves static endpoints and permits stepping", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".extremes rect")).toHaveCount(2);
  await page.getByRole("button", { name: "Step", exact: false }).click();
  expect(await page.evaluate(() => window.__labClock.read())).toBeCloseTo(0.1);
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().activeLoops),
  ).toBe(0);
});
test("graph scrubbing synchronizes the stage and keeps a stable plot", async ({
  page,
}) => {
  const scrub = page.getByRole("slider", { name: "Scrub simulation time" });
  await scrub.fill("2");
  const x = await page.locator(".carriage").getAttribute("data-x");
  expect(Number(x)).toBeCloseTo(0.1 * Math.cos(20), 3);
  const points = await page.locator(".trace").getAttribute("points");
  await scrub.fill("1");
  await expect(page.locator(".trace")).toHaveAttribute("points", points!);
});
test("rapid module/lens changes and playback retain one loop and subscribers", async ({
  page,
}) => {
  const before = await page.evaluate(
    () => window.__labClock.diagnostics().subscribers,
  );
  for (let i = 0; i < 12; i++) {
    await page
      .getByRole("button", { name: i % 2 ? "01 SDOF" : "02 DAMPING" })
      .click();
    await page
      .getByRole("button", { name: i % 2 ? "Motion" : "Forces", exact: true })
      .click();
  }
  await page.evaluate(() => {
    for (let i = 0; i < 200; i++) {
      window.__labClock.play();
      window.__labClock.pause();
    }
    window.__labClock.play();
  });
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().activeLoops),
  ).toBe(1);
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().subscribers),
  ).toBe(before);
});
test("themes, keyboard focus and accessibility", async ({ page }) => {
  await page
    .getByRole("button", { name: "Switch to light appearance" })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark appearance" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Play", exact: true }).focus();
  expect(
    await page
      .getByRole("button", { name: "Play", exact: true })
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
});
test("supported sizes and device scales preserve layout without horizontal overflow", async ({
  browser,
}) => {
  for (const scale of [1, 1.25, 1.5, 2]) {
    const context = await browser.newContext({
      viewport: { width: 900, height: 680 },
      deviceScaleFactor: scale,
    });
    const page = await context.newPage();
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await page.locator(".stage-column").boundingBox())!.width,
    ).toBeGreaterThan(450);
    await context.close();
  }
});

test("reset clears invalid numeric drafts even when the committed value is already default", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Mass value" });
  await input.fill("invalid");
  await input.press("Enter");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(input).toHaveValue("1");
  await expect(input).toHaveAttribute("aria-invalid", "false");
});
