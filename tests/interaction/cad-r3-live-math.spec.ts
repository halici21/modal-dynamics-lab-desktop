import { test, expect } from "@playwright/test";

/**
 * CAD EXPERIENCE R3 — the live-mathematics chain.
 *
 * physical object <-> force <-> equation term <-> matrix contribution <-> result
 * Every link is exercised in BOTH directions, because a one-directional
 * highlight fails `mdl-live-mathematics`'s gate.
 */

test("selecting a spring in the tree links geometry, properties and matrix", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();

  // Property manager leads for a physical selection.
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
  await expect(page.locator(".prop-cells")).toContainText("K11");
  await expect(page.locator(".prop-cells")).toContainText("K12");
  await expect(page.locator(".prop-cells")).toContainText("K21");
  await expect(page.locator(".prop-cells")).toContainText("K22");

  // The coupling term lights in BOTH equations.
  await page.getByRole("tab", { name: "Equations" }).click();
  const lit = page.locator('.equation-term[data-linked]');
  expect(await lit.count()).toBeGreaterThanOrEqual(2);
});

test("a coupling spring lights all four K entries in the matrix view", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  for (const [r, c] of [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
  ])
    await expect(
      page.locator(`.matrix [data-token="matrix:K${r - 1}${c - 1}"][data-linked]`),
    ).toHaveCount(1);
});

test("a grounded spring lights exactly one diagonal K entry", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.getByRole("treeitem", { name: /Spring k1/ }).click();
  await expect(page.locator('.matrix [data-token="matrix:K00"][data-linked]')).toHaveCount(1);
  await expect(page.locator('.matrix [data-token="matrix:K01"][data-linked]')).toHaveCount(0);
  await expect(page.locator('.matrix [data-token="matrix:K11"][data-linked]')).toHaveCount(0);
});

test("clicking an off-diagonal matrix cell resolves back to its spring", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.locator('.matrix [data-token="matrix:K01"]').click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("K12");
  await expect(page.locator(".matrix-provenance")).toContainText("k2");
  // Provenance explains the sign, not just the magnitude.
  await expect(page.locator(".matrix-provenance")).toContainText("negative");
});

test("clicking a diagonal mass entry resolves back to the mass", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.locator('.matrix [data-token="matrix:M00"]').click();
  await expect(page.locator(".matrix-provenance")).toContainText("inertia of mass 1");
});

test("clicking an equation term selects the physical object it stands for", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Equations" }).click();
  await page.locator('.equation-term[data-token="mass:m1"]').first().click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("m1");
});

test("selecting a mass links its inertia term and its own M entry only", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.getByRole("treeitem", { name: /Mass m2/ }).click();
  await expect(page.locator('.matrix [data-token="matrix:M11"][data-linked]')).toHaveCount(1);
  await expect(page.locator('.matrix [data-token="matrix:M00"][data-linked]')).toHaveCount(0);
});

test("selecting a mode in the dock activates it everywhere", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Modes" }).click();
  await page.getByRole("button", { name: "Select mode 2" }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("Mode 2");
  await expect(page.locator(".studio-status")).toContainText("mode 2");
});

test("selecting a mode in the tree matches selecting it in the dock", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mode 2/ }).click();
  await expect(page.locator(".studio-status")).toContainText("mode 2");
  await expect(page.locator(".studio-pane-head h2")).toContainText("Mode 2");
});

test("SDOF derivation walks eight steps and returns via the overview", async ({
  page,
}) => {
  await page.goto("/?study=0");
  await expect(page.locator(".derivation-count")).toContainText("Step 1 of 8");
  await expect(page.locator(".derivation-head h3")).toContainText("Newton");

  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-count")).toContainText("Step 8 of 8");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  // The final step is the closed-form solution the viewport is sampling.
  await expect(page.locator(".equation-block")).toContainText("0.1");

  await page.getByRole("button", { name: "Overview" }).click();
  await expect(page.locator(".derivation-overview")).toBeVisible();
  expect(await page.locator(".derivation-overview li").count()).toBe(8);
  await page.locator(".derivation-overview li button").first().click();
  await expect(page.locator(".derivation-count")).toContainText("Step 1 of 8");
});

test("derivation steps interpolate the live solver values", async ({ page }) => {
  await page.goto("/?study=0");
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 6 states omega_n; the status line states f_n from the same solve.
  await expect(page.locator(".equation-block")).toContainText("10");
  await expect(page.locator(".studio-status")).toContainText("1.5915");
});

test("damped SDOF derivation reports the discriminant and regime", async ({
  page,
}) => {
  await page.goto("/?study=1");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-head h3")).toContainText("Discriminant");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-explain")).toContainText("complex");
});

test("2DOF derivation goes from free bodies to the eigenproblem", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await expect(page.locator(".derivation-head h3")).toContainText("Free body: mass 1");
  const titles: string[] = [];
  for (let i = 0; i < 5; i++) {
    titles.push((await page.locator(".derivation-head h3").innerText()).trim());
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  expect(titles).toContain("Assemble into matrices");
  expect(titles).toContain("Where the coupling spring lands");
  expect(titles).toContain("Eigenproblem");
  await expect(page.locator(".equation-block")).toContainText("1.5915");
});

test("FEM assembly links a selected element to its local matrices and mapping", async ({
  page,
}) => {
  await page.goto("/?study=12");
  await page.getByRole("tab", { name: "Assembly" }).click();
  await expect(page.locator(".dock-assembly")).toContainText("Select an element");
  await page.getByRole("treeitem", { name: /beam 2/ }).click();
  await expect(page.locator(".dock-assembly")).toContainText("maps its local");
  await expect(page.locator(".dock-assembly")).toContainText("node 2 v");
  await expect(page.locator(".matrix-name").first()).toContainText("Kₑ");
  await expect(page.locator(".dock-assembly")).toContainText("constrained DOF");
});

test("FEM derivation follows the element to mode-shape path", async ({ page }) => {
  await page.goto("/?study=12");
  await page.getByRole("treeitem", { name: /beam 1/ }).click();
  await page.getByRole("tab", { name: "Equations" }).click();
  await expect(page.locator(".derivation-head h3")).toContainText("One element at a time");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-head h3")).toContainText("DOF mapping");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-head h3")).toContainText("Boundary conditions");
});

test("free-free derivation states that the zero eigenspace has no named basis", async ({
  page,
}) => {
  await page.goto("/?study=5");
  await expect(page.locator(".equation-block")).toContainText("K");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-explain")).toContainText("zero frequency");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".derivation-explain")).toContainText(
    "not guaranteed to be exactly",
  );
});

test("free-free reports rigid modes at zero hertz", async ({ page }) => {
  await page.goto("/?study=5");
  await expect(page.locator(".studio-status")).toContainText("0 Hz");
  await expect(page.getByRole("treeitem", { name: /Mode 1/ })).toContainText("rigid");
});

test("mode normalization changes numbers but not the relative pattern", async ({
  page,
}) => {
  await page.goto("/?study=2&density=inspect");
  await page.getByRole("tab", { name: "Modes" }).click();
  const before = await page.locator(".mode-vector").first().innerText();
  await page.getByLabel("Mode normalization").selectOption("mass");
  const after = await page.locator(".mode-vector").first().innerText();
  expect(after).not.toBe(before);
  const ratio = (s: string) => {
    const v = s.replace(/[[\]]/g, "").split(",").map(Number);
    return v[0] / v[1];
  };
  expect(ratio(after)).toBeCloseTo(ratio(before), 6);
});

test("flipping the mode sign keeps the same physical mode", async ({ page }) => {
  await page.goto("/?study=2&density=inspect");
  await page.getByRole("tab", { name: "Modes" }).click();
  const before = await page.locator(".mode-vector").first().innerText();
  await page.getByRole("button", { name: "Flip mode sign" }).click();
  const after = await page.locator(".mode-vector").first().innerText();
  expect(after).not.toBe(before);
  await expect(page.locator(".studio-status")).toContainText("1.5915");
});
