import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * CAD EXPERIENCE R3 — shell, panes, density and accessibility.
 * Replaces the R2 workbench/foundation specs, which targeted the retired
 * numbered-rail shell.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset simulation" }).click();
});

test("studio opens with the six CAD regions present", async ({ page }) => {
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeVisible();
  await expect(page.getByLabel("CAD physics viewport")).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Simulation transport" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "View orientation" }),
  ).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Analysis views" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Study" })).toBeVisible();
});

test("the retired numbered rail is gone as primary navigation", async ({ page }) => {
  for (const label of ["01", "02", "03", "04", "05", "06"])
    await expect(page.getByRole("button", { name: label, exact: true })).toHaveCount(0);
  // A compact study selector replaces it.
  await expect(page.getByRole("combobox", { name: "Study" })).toBeVisible();
});

test("viewport keeps majority area at 1440 with a populated property manager", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await expect(page.locator(".studio-properties")).toBeVisible();
  const share = await page.evaluate(() => {
    const r = document.querySelector(".viewport")!.getBoundingClientRect();
    return (r.width * r.height) / (window.innerWidth * window.innerHeight);
  });
  expect(share).toBeGreaterThanOrEqual(0.55);
  expect(share).toBeLessThanOrEqual(0.72);
});

test("model browser collapses and restores without losing selection", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
  await page.getByRole("button", { name: "Browser", exact: true }).click();
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeHidden();
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
  await page.getByRole("button", { name: "Browser", exact: true }).click();
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeVisible();
});

test("property manager closes and reopens on the next selection", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await expect(page.locator(".studio-properties")).toBeVisible();
  await page.getByRole("button", { name: "Close property manager" }).click();
  await expect(page.locator(".studio-properties")).toHaveCount(0);
  await page.getByRole("treeitem", { name: /Mass m2/ }).click();
  await expect(page.locator(".studio-properties")).toBeVisible();
});

test("analysis dock collapses, expands and resizes by keyboard", async ({ page }) => {
  const body = page.locator("#studio-dock-body");
  await expect(body).toBeVisible();
  await page.getByRole("button", { name: "Collapse analysis dock" }).click();
  await expect(body).toBeHidden();
  await page.getByRole("button", { name: "Expand analysis dock" }).click();
  await expect(body).toBeVisible();

  const before = await body.boundingBox();
  const handle = page.getByRole("separator", { name: "Resize analysis dock" });
  await handle.focus();
  await handle.press("ArrowUp");
  await handle.press("ArrowUp");
  const after = await body.boundingBox();
  expect(after!.height).toBeGreaterThan(before!.height);
});

test("dock tabs are filtered to what the active study can populate", async ({
  page,
}) => {
  await page.goto("/?study=0");
  const sdof = await page.getByRole("tab").allInnerTexts();
  expect(sdof).toContain("Equations");
  expect(sdof).not.toContain("Spectrum");
  expect(sdof).not.toContain("PSD");

  await page.goto("/?study=12");
  const fem = await page.getByRole("tab").allInnerTexts();
  expect(fem).toContain("Assembly");
  expect(fem).toContain("Matrices");
});

test("Learn hides solver detail that Inspect reveals", async ({ page }) => {
  await page.goto("/?study=2&density=learn");
  await expect(page.getByRole("tab", { name: "Matrices" })).toHaveCount(0);

  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Matrices" })).toBeVisible();
  await page.getByRole("tab", { name: "Modes" }).click();
  await expect(page.locator(".dock-diagnostics")).toBeVisible();
});

test("density switching preserves the current selection", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("k2");
});

test("keyboard runs playback, selection and pane toggles", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await page.locator("body").press("Escape");
  await expect(page.locator(".studio-properties")).toHaveCount(0);

  await page.locator("body").press("b");
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeHidden();
  await page.locator("body").press("b");
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeVisible();

  await page.evaluate(() => window.__labClock.pause());
  const t0 = await page.evaluate(() => window.__labClock.read());
  await page.locator("body").press("ArrowRight");
  expect(await page.evaluate(() => window.__labClock.read())).toBeGreaterThan(t0);
});

test("minimum window keeps the viewport, transport and dock without page scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.goto("/?study=2");
  await expect(page.getByLabel("CAD physics viewport")).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Simulation transport" }),
  ).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Analysis views" })).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("narrow property drawer does not cover the live geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 720 });
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  const drawer = await page.locator(".studio-properties").boundingBox();
  const viewport = await page.locator(".viewport").boundingBox();
  // PC-2: the viewport's own box ends where the drawer begins.
  expect(viewport!.x + viewport!.width).toBeLessThanOrEqual(drawer!.x + 1);
});

test("theme swap keeps every region and passes contrast-sensitive audit", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("button", { name: /Switch to light appearance/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("tree", { name: "Model browser" })).toBeVisible();
  const light = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(light.violations).toEqual([]);
});

test("dark studio passes an axe audit with a selection and the dock open", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("FEM study passes an axe audit at the minimum window", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.goto("/?study=12");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("model browser is a real tree with arrow-key traversal", async ({ page }) => {
  await page.goto("/?study=2");
  const items = page.getByRole("treeitem");
  expect(await items.count()).toBeGreaterThan(5);
  await items.first().focus();
  await page.keyboard.press("ArrowDown");
  const focused = await page.evaluate(
    () => document.activeElement?.getAttribute("role"),
  );
  expect(focused).toBe("treeitem");
});

test("status line reports DOF count, boundary and the active mode", async ({
  page,
}) => {
  await page.goto("/?study=2");
  const status = page.locator(".studio-status");
  await expect(status).toContainText("2 DOF");
  await expect(status).toContainText("fixed-fixed");
  await expect(status).toContainText("Hz");
});
