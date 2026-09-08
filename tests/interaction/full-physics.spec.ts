import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
});
test("all physics modules open with finite results and visible transport", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (let i = 2; i <= 12; i++) {
    await page
      .getByLabel("Physics workspace", { exact: true })
      .selectOption(String(i));
    await expect(page.locator("h1")).not.toBeEmpty();
    await expect(
      page.getByRole("button", { name: "Reset", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(
      /\bNaN\b|\bInfinity\b/,
    );
  }
  expect(errors).toEqual([]);
});
test("2DOF and 3DOF mode browser exposes independently expected eigenvalues", async ({
  page,
}) => {
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("2");
  await page.getByLabel("Physics analysis").selectOption("Modes");
  const table = page.getByRole("table", { name: "Natural modes" });
  await expect(table).toContainText("100.0000");
  await expect(table).toContainText("300.0000");
  await page
    .getByRole("button", { name: "Select mode 2", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Select mode 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("3");
  await expect(
    page.getByRole("table", { name: "Natural modes" }),
  ).toContainText("58.5786");
});
test("10DOF shared time, scrub, frame lifecycle and cleanup", async ({
  page,
}) => {
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("4");
  await page.getByLabel("DOF count", { exact: true }).selectOption("10");
  await page.getByRole("slider", { name: "Scrub simulation time" }).fill("0.2");
  const r = await page.evaluate(() => {
    const w = window as any;
    return {
      t: w.__labClock.read(),
      x: w.__coreDebug.solution.sample(0.2).x[0],
      actual: Number(
        document.querySelector("[data-core-mass]")!.getAttribute("data-x"),
      ),
    };
  });
  expect(r.t).toBeCloseTo(0.2);
  expect(r.actual).toBeCloseTo(r.x, 10);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(150);
  const a = await page.evaluate(async () => {
    const w = window as any,
      b = w.__labCommits();
    await new Promise((r) => setTimeout(r, 500));
    return {
      commits: w.__labCommits() - b,
      loops: w.__labClock.diagnostics().activeLoops,
    };
  });
  expect(a).toEqual({ commits: 0, loops: 1 });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.__labClock.diagnostics().activeLoops),
    )
    .toBe(0);
  const before = await page.evaluate(
    () => window.__labClock.diagnostics().subscribers,
  );
  for (let i = 0; i < 10; i++) {
    await page
      .getByLabel("Physics workspace", { exact: true })
      .selectOption("2");
    await page
      .getByLabel("Physics workspace", { exact: true })
      .selectOption("4");
  }
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().subscribers),
  ).toBe(before);
});
test("matrix editing rejects bad mass, accepts coupled damping and shows direct FRF", async ({
  page,
}) => {
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("2");
  await page.getByText("Full matrix model", { exact: true }).click();
  const data = {
    M: [
      [1, 0],
      [0, 1],
    ],
    C: [
      [2, 0],
      [0, 0],
    ],
    K: [
      [200, -100],
      [-100, 200],
    ],
    labels: ["x1", "x2"],
  };
  await page.getByLabel("Matrix model JSON").fill(
    JSON.stringify({
      ...data,
      M: [
        [0, 0],
        [0, 1],
      ],
    }),
  );
  await page
    .getByRole("button", { name: "Apply matrix model", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("positive definite");
  await page.getByLabel("Matrix model JSON").fill(JSON.stringify(data));
  await page
    .getByRole("button", { name: "Apply matrix model", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByLabel("Physics analysis").selectOption("FRF");
  await expect(page.getByTestId("frf-current")).toContainText(
    "coupled damping",
  );
});
test("free-free zero modes, participation sum, normalization and sign", async ({
  page,
}) => {
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("5");
  await expect(
    page.getByRole("table", { name: "Natural modes" }),
  ).toContainText("zero");
  await page.getByLabel("Physics analysis").selectOption("Participation");
  await expect(page.locator(".core-analysis")).toContainText("100.000%");
  await page.getByLabel("Mode normalization").selectOption("mass");
  await page.getByRole("button", { name: "Flip mode sign" }).click();
  await expect(page.locator(".core-analysis")).toContainText("100.000%");
});
test("forced resonance, base response, FRF and PSD produce meaningful results", async ({
  page,
}) => {
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("6");
  const c = page.getByRole("textbox", { name: "Viscous damping value" });
  await c.fill("0");
  await c.press("Enter");
  const w = page.getByRole("textbox", { name: "Excitation omega value" });
  await w.fill("10");
  await w.press("Enter");
  await expect(page.locator(".preview-badge")).toContainText(
    "No bounded steady state",
  );
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("8");
  await expect(page.locator(".core-analysis")).toContainText("relative |Z|");
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("7");
  await expect(page.getByTestId("frf-current")).toContainText(
    "direct/modal difference",
  );
  await page
    .getByLabel("Physics workspace", { exact: true })
    .selectOption("11");
  await expect(page.getByTestId("psd-rms")).toContainText("RMS =");
});
test("response spectrum computes from record and rejects invalid samples", async ({
  page,
}) => {
  await page
    .getByLabel("Physics workspace", { exact: true })
    .selectOption("10");
  await page.getByRole("button", { name: "Compute response spectrum" }).click();
  await expect(
    page.getByRole("table", { name: "Response spectrum" }),
  ).toContainText("pseudo-Sa");
  await page.getByLabel("Acceleration samples").fill("1, bad, 0");
  await page.getByRole("button", { name: "Compute response spectrum" }).click();
  await expect(page.getByRole("alert")).toContainText("finite");
});
test("FE refinement, free-free frame and rotated element stage", async ({
  page,
}) => {
  await page
    .getByLabel("Physics workspace", { exact: true })
    .selectOption("12");
  await page.getByLabel("FE element").selectOption("frame");
  await page.getByLabel("FE boundary").selectOption("free-free");
  await page.getByLabel("Physics analysis").selectOption("Modes");
  const table = page.getByRole("table", { name: "Natural modes" });
  expect((await table.innerText()).match(/zero/g)).toHaveLength(3);
  await page.getByLabel("Mesh elements").selectOption("8");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.locator("[data-fe-shape]")).not.toHaveAttribute(
    "points",
    "",
  );
});
test("new controls remain accessible in both themes and minimum window", async ({
  page,
}) => {
  for (const module of ["2", "6", "7", "9", "10", "11", "12"]) {
    await page
      .getByLabel("Physics workspace", { exact: true })
      .selectOption(module);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Switch to light appearance" })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 900, height: 680 });
  await page.reload();
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("4");
  await expect(
    page.getByRole("button", { name: "Reset", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("reduced motion gives a static meaningful mode and permits scrub", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByLabel("Physics workspace", { exact: true }).selectOption("3");
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".stage-caption")).toContainText(
    "Static mode shape",
  );
  await page.getByLabel("Physics analysis").selectOption("Response");
  await page.getByRole("slider", { name: "Scrub simulation time" }).fill("0.1");
  expect(await page.evaluate(() => window.__labClock.read())).toBeCloseTo(0.1);
});
