import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const edit = async (page: Page, name: string, value: string) => {
  const input = page.getByRole("textbox", { name: name + " value" });
  await input.fill(value);
  await input.press("Enter");
};
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: /02.*DAMPING/ }).click();
});
test("coefficient and ratio authority preserve physics across edits and toggles", async ({
  page,
}) => {
  await page.evaluate(() => window.__labClock.setTime(0.2));
  await edit(page, "Mass", "4");
  await expect(page.getByTestId("zeta")).toHaveText("0.1000");
  await page
    .getByRole("combobox", { name: "Damping control authority" })
    .selectOption("zeta");
  await expect(
    page.getByRole("textbox", { name: "Damping ratio value" }),
  ).toHaveValue("0.1");
  await edit(page, "Stiffness", "400");
  await expect(page.getByTestId("zeta")).toHaveText("0.1000");
  await page
    .getByRole("combobox", { name: "Damping control authority" })
    .selectOption("c");
  await expect(
    page.getByRole("textbox", { name: "Damping coefficient value" }),
  ).toHaveValue("8");
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0.2);
});
test("presets and zero stiffness remain finite with safe authority fallback", async ({
  page,
}) => {
  for (const [name, regime, z] of [
    ["Undamped", "Undamped", "0"],
    ["Light damping", "Underdamped", "0.1000"],
    ["Moderate damping", "Underdamped", "0.4000"],
    ["Critical damping", "Critical", "1.0000"],
    ["Overdamped", "Overdamped", "2.0000"],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByTestId("regime")).toContainText(regime);
    await expect(page.getByTestId("zeta")).toHaveText(z);
  }
  await page
    .getByRole("combobox", { name: "Damping control authority" })
    .selectOption("zeta");
  await edit(page, "Stiffness", "0");
  await expect(
    page.getByRole("combobox", { name: "Damping control authority" }),
  ).toHaveValue("c");
  await expect(page.getByTestId("zeta")).toHaveText("—");
  await expect(page.getByTestId("regime")).toHaveText("No restoring stiffness");
  await edit(page, "Initial velocity", ".5");
  await page.evaluate(() => window.__labClock.setTime(0.2));
  expect(
    await page
      .locator("output")
      .allTextContents()
      .then((values) => values.join(" ")),
  ).not.toMatch(/NaN|Infinity|undefined/);
});
test("new damping inputs reject invalid drafts and reset deterministically", async ({
  page,
}) => {
  for (const bad of ["-1", "NaN", "Infinity"]) {
    await edit(page, "Damping coefficient", bad);
    const input = page.getByRole("textbox", {
      name: "Damping coefficient value",
    });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await input.press("Escape");
  }
  await page
    .getByRole("slider", { name: "Damping coefficient", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("textbox", { name: "Damping coefficient value" }),
  ).toHaveValue("4.1");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Damping coefficient value" }),
  ).toHaveValue("4");
});
test("forces, energy and phase space use the same frozen analytical sample", async ({
  page,
}) => {
  await page.evaluate(() => window.__labClock.setTime(0.2));
  await page.getByRole("button", { name: "Forces", exact: true }).click();
  const r = await page.evaluate(() => {
    const w = window as any;
    return w.__labSolution.sample(w.__labClock.read());
  });
  expect(r.dampingForce * r.v).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.locator('[data-quantity="dampingForce"]')).toHaveText(
    r.dampingForce.toFixed(4),
  );
  await expect(page.locator(".damping-vector")).toHaveAttribute(
    "visibility",
    "visible",
  );
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  const ke = Number(await page.locator(".kinetic-bar").getAttribute("width")),
    pe = Number(await page.locator(".potential-bar").getAttribute("width"));
  expect(ke + pe).toBeCloseTo((500 * r.total) / 0.5, 7);
  expect(ke + pe).toBeLessThan(500);
  await page.getByRole("button", { name: "Phase Space", exact: true }).click();
  expect(
    await page.locator(".phase-trace").getAttribute("points"),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await page.getByRole("button", { name: "Link c to damper" }).click();
  await expect(page.locator(".damper-object")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
test("scrubbing all regimes preserves static graph and matches stage time", async ({
  page,
}) => {
  for (const name of [
    "Undamped",
    "Light damping",
    "Critical damping",
    "Overdamped",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    const points = await page.locator(".trace").getAttribute("points");
    await page
      .getByRole("slider", { name: "Scrub simulation time" })
      .fill("0.2");
    const expected = await page.evaluate(
      () => (window as any).__labSolution.sample(0.2).x,
    );
    expect(
      Number(await page.locator(".carriage").getAttribute("data-x")),
    ).toBeCloseTo(expected, 10);
    expect(await page.locator(".trace").getAttribute("points")).toBe(points);
  }
  await page.evaluate(() => window.__labClock.setTime(20));
  await expect(page.locator(".cursor").locator("..")).toHaveAttribute(
    "visibility",
    "hidden",
  );
});
test("damping experiments pause, advance, skip and yield to new input", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add damping ↗" }).click();
  await page.getByRole("button", { name: "Pause experiment" }).click();
  await expect(
    page.getByRole("button", { name: "Apply change" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Resume experiment" }).click();
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByTestId("zeta")).toHaveText("0.2000");
  await page.getByRole("button", { name: "Skip / Finish" }).click();
  await page.getByRole("button", { name: "Find critical damping ↗" }).click();
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByTestId("zeta")).toHaveText("1.0000");
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByTestId("zeta")).toHaveText("2.0000");
  await edit(page, "Damping coefficient", "3");
  await expect(
    page.getByRole("region", { name: "Damping guided experiment" }),
  ).toHaveCount(0);
});
test("damped playback stays outside React and retains one loop through module changes", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const w = window as any;
    window.__labClock.play();
    await new Promise((r) => setTimeout(r, 50));
    const before = w.__labCommits();
    const points = document.querySelector(".trace")!.getAttribute("points");
    await new Promise((r) => setTimeout(r, 350));
    const commits = w.__labCommits() - before;
    window.__labClock.pause();
    return {
      commits,
      stable:
        points === document.querySelector(".trace")!.getAttribute("points"),
    };
  });
  expect(result.commits).toBe(0);
  expect(result.stable).toBe(true);
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: /01.*SDOF/ }).click();
    await page.getByRole("button", { name: /02.*DAMPING/ }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.__labClock.diagnostics().activeLoops),
    )
    .toBe(0);
});
test("damping accessibility in both themes and all lenses", async ({
  page,
}) => {
  for (const light of [false, true]) {
    if (light)
      await page
        .getByRole("button", { name: "Switch to light appearance" })
        .click();
    for (const lens of [
      "Motion",
      "Forces",
      "Energy",
      "Phase Space",
      "Mathematics",
    ]) {
      await page.getByRole("button", { name: lens, exact: true }).click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
});

test("damped reduced motion, playback rate and emulated DPI preserve exact state", async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.locator('[data-quantity="time"]')).toHaveText("0.1000");
  const omega = await page.getByTestId("damped-omega").innerText();
  await page
    .getByRole("button", { name: "Collapse Context Inspector" })
    .click();
  await page.getByRole("button", { name: "2×", exact: true }).click();
  expect(await page.getByTestId("damped-omega").innerText()).toBe(omega);
  for (const scale of [1, 1.25, 1.5, 2]) {
    const context = await browser.newContext({
      viewport: { width: 900, height: 680 },
      deviceScaleFactor: scale,
      reducedMotion: "reduce",
    });
    const p = await context.newPage();
    await p.goto("http://127.0.0.1:1420");
    await p.getByRole("button", { name: "Reset", exact: true }).click();
    await p.getByRole("button", { name: /02.*DAMPING/ }).click();
    expect(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await p.locator(".physics-stage").boundingBox())!.width,
    ).toBeGreaterThan(450);
    await context.close();
  }
});
