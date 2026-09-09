import { test, expect } from "@playwright/test";

/**
 * CAD EXPERIENCE R3 — every study opens with finite physics and the evidence
 * views the brief requires. Replaces the R2 full-physics interaction spec.
 */

const STUDIES = [
  [0, "Undamped SDOF"],
  [1, "Damped SDOF"],
  [2, "2DOF"],
  [3, "Mode Browser / 3DOF"],
  [4, "MDOF"],
  [5, "Free-Free"],
  [6, "Forced SDOF"],
  [7, "FRF"],
  [8, "Base excitation"],
  [9, "Participation / effective mass"],
  [10, "Spectrum fundamentals"],
  [11, "Random vibration"],
  [12, "FE modal playground"],
] as const;

for (const [module, name] of STUDIES)
  test(`study ${module} (${name}) opens with a viewport, tree and no error`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/?study=${module}`);
    await expect(page.getByRole("combobox", { name: "Study" })).toHaveValue(
      String(module),
    );
    await expect(page.getByLabel("CAD physics viewport")).toBeVisible();
    expect(await page.getByRole("treeitem").count()).toBeGreaterThan(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.locator(".studio-status")).toContainText("DOF");
    expect(errors).toEqual([]);
  });

test("every study exposes only tabs it can populate, and each one renders", async ({
  page,
}) => {
  for (const [module] of STUDIES) {
    await page.goto(`/?study=${module}&density=inspect`);
    const tabs = await page.getByRole("tab").allInnerTexts();
    expect(tabs.length).toBeGreaterThan(0);
    for (const tab of tabs) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(page.locator("#studio-dock-body")).not.toBeEmpty();
    }
  }
});

test("2DOF reports both natural frequencies from the frozen solver", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Modes" }).click();
  const rows = page.locator("table[aria-label='Natural modes'] tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("1.5915");
  await expect(rows.nth(1)).toContainText("2.7566");
});

test("MDOF at ten coordinates gives ten modal directions", async ({ page }) => {
  await page.goto("/?study=4");
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await page.getByLabel("DOF count").selectOption("10");
  await page.getByRole("tab", { name: "Modes" }).click();
  await expect(
    page.locator("table[aria-label='Natural modes'] tbody tr"),
  ).toHaveCount(10);
  await expect(page.locator(".studio-status")).toContainText("10 DOF");
});

test("MDOF high and low modes are both selectable and reported", async ({
  page,
}) => {
  await page.goto("/?study=4");
  await page.getByRole("tab", { name: "Modes" }).click();
  await page.getByRole("button", { name: "Select mode 1" }).click();
  const low = await page.locator(".studio-status").innerText();
  await page.getByRole("button", { name: "Select mode 5" }).click();
  const high = await page.locator(".studio-status").innerText();
  expect(low).not.toBe(high);
  expect(high).toContain("mode 5");
});

test("FRF reports a complex value at the excitation frequency", async ({ page }) => {
  await page.goto("/?study=7");
  await page.getByRole("tab", { name: "FRF" }).click();
  await expect(page.getByTestId("frf-current")).toContainText("magnitude");
  await expect(page.getByTestId("frf-current")).toContainText("phase");
  // FRF is an input-output property, and the copy says so.
  await expect(page.locator(".dock-frf")).toContainText("not a mode shape");
});

test("random vibration reports RMS from the PSD integral", async ({ page }) => {
  await page.goto("/?study=11");
  await page.getByRole("tab", { name: "PSD" }).click();
  await expect(page.getByTestId("psd-rms")).toContainText("RMS");
  await expect(page.getByTestId("psd-rms")).toContainText("variance");
});

test("response spectrum and PSD stay distinct views", async ({ page }) => {
  await page.goto("/?study=10");
  await page.getByRole("tab", { name: "Spectrum" }).click();
  await expect(page.locator(".dock-spectrum")).toContainText(
    "not a power spectral density",
  );
  await page.getByRole("button", { name: "Compute response spectrum" }).click();
  await expect(page.locator("table[aria-label='Response spectrum']")).toBeVisible();
});

test("participation reports effective mass and cumulative fraction", async ({
  page,
}) => {
  await page.goto("/?study=9");
  await page.getByRole("tab", { name: "Results" }).click();
  await expect(page.locator("table[aria-label='Effective modal mass']")).toBeVisible();
  await expect(page.locator(".dock-results")).toContainText("Total participating mass");
});

test("study settings still expose every study-level control", async ({ page }) => {
  await page.goto("/?study=4");
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await expect(page.getByLabel("DOF count")).toBeVisible();
  await expect(page.getByLabel("Boundary condition")).toBeVisible();
  await expect(page.getByLabel("Rayleigh α value")).toBeVisible();
  await expect(page.getByLabel("Rayleigh β value")).toBeVisible();
  await expect(page.getByLabel("Visualization scale value")).toBeVisible();

  await page.goto("/?study=12");
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await expect(page.getByLabel("FE element")).toBeVisible();
  await expect(page.getByLabel("Mesh elements")).toBeVisible();
  await expect(page.getByLabel("FE boundary")).toBeVisible();
});

test("editing a mass through the property manager re-solves the model", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  const before = await page.locator(".studio-status").innerText();
  const field = page.getByLabel("Mass m1 value");
  await field.fill("4");
  await field.press("Enter");
  await expect(page.locator(".studio-status")).not.toHaveText(before);
  await expect(page.getByRole("treeitem", { name: /Mass m1/ })).toContainText("4 kg");
});

/**
 * In a symmetric chain the in-phase mode never stretches the coupling spring,
 * so k2 cannot move omega_1 — only omega_2. Asserting BOTH halves is what
 * makes this a physics test rather than a "something changed" test.
 */
test("changing the coupling spring moves only the out-of-phase mode", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Modes" }).click();
  const row = (i: number) =>
    page.locator("table[aria-label='Natural modes'] tbody tr").nth(i).innerText();
  const before1 = await row(0);
  const before2 = await row(1);

  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  const field = page.getByLabel("Stiffness k2 value");
  await field.fill("400");
  await field.press("Enter");
  await page.getByRole("tab", { name: "Modes" }).click();

  expect(await row(0)).toBe(before1);
  expect(await row(1)).not.toBe(before2);
  await expect(
    page.locator("table[aria-label='Natural modes'] tbody tr").nth(1),
  ).toContainText("4.7746");
});

test("invalid input is rejected without producing NaN", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  const field = page.getByLabel("Mass m1 value");
  await field.fill("-5");
  await field.press("Enter");
  await expect(page.locator(".validation").first()).toContainText("supported finite");
  const body = await page.locator(".studio-status").innerText();
  expect(body).not.toContain("NaN");
});

test("FE mesh refinement changes the approximation, not the question", async ({
  page,
}) => {
  await page.goto("/?study=12");
  const before = await page.locator(".studio-status").innerText();
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await page.getByLabel("Mesh elements").selectOption("8");
  await expect(page.locator(".studio-status")).not.toHaveText(before);
  await expect(page.locator(".studio-status")).toContainText("Hz");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("switching studies clears selection and resets simulation time", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await page.evaluate(() => window.__labClock.setTime(2));
  await page.getByRole("combobox", { name: "Study" }).selectOption("12");
  await expect(page.locator(".studio-properties")).toHaveCount(0);
  expect(await page.evaluate(() => window.__labClock.read())).toBeLessThan(0.5);
});
