import { test, expect, type Page } from "@playwright/test";

/**
 * CAD EXPERIENCE R3 — visual regression matrix.
 *
 * Naming follows the existing convention with the release prefix bumped
 * (`cad-r3-<workspace>-<state>.png`), so the R1/R2 baselines stay a
 * historical record instead of being overwritten
 * (`mdl-visual-qa/references/QA_SCREENSHOT_MATRIX.md`).
 *
 * WebGL antialiasing is not bit-identical between runs, so the tolerance is
 * a ratio rather than the exact-pixel budget the SVG-only R2 shell used.
 * Everything is captured at a fixed simulation time with playback paused.
 */

const TOLERANCE = { maxDiffPixelRatio: 0.03, animations: "disabled" as const };

async function settle(page: Page, time = 0.35) {
  await page.waitForFunction(
    () => document.querySelector(".viewport-canvas") !== null,
  );
  await page.evaluate((t) => {
    window.__labClock.pause();
    window.__labClock.setTime(t);
  }, time);
  await page.waitForTimeout(450);
  await page.mouse.move(0, 0);
}

async function shot(page: Page, name: string) {
  await settle(page);
  await expect(page).toHaveScreenshot(`cad-r3-${name}.png`, TOLERANCE);
}

/* ---------------- global shell states ---------------- */

test("visual global dark", async ({ page }) => {
  await page.goto("/?study=2");
  await shot(page, "global-dark");
});

test("visual global light", async ({ page }) => {
  await page.goto("/?study=2&theme=light");
  await shot(page, "global-light");
});

test("visual global minimum window", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 680 });
  await page.goto("/?study=2");
  await shot(page, "global-minimum");
});

test("visual global maximized", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1009 });
  await page.goto("/?study=2");
  await shot(page, "global-maximized");
});

test("visual global browser collapsed", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("button", { name: "Browser", exact: true }).click();
  await shot(page, "global-browser-collapsed");
});

test("visual global property manager populated", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await shot(page, "global-properties-open");
});

test("visual global dock collapsed", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("button", { name: "Collapse analysis dock" }).click();
  await shot(page, "global-dock-collapsed");
});

test("visual global dock expanded", async ({ page }) => {
  await page.goto("/?study=2");
  const handle = page.getByRole("separator", { name: "Resize analysis dock" });
  await handle.focus();
  await handle.press("ArrowUp");
  await handle.press("ArrowUp");
  await shot(page, "global-dock-expanded");
});

test("visual global learn density", async ({ page }) => {
  await page.goto("/?study=2&density=learn");
  await shot(page, "global-learn");
});

test("visual global inspect density", async ({ page }) => {
  await page.goto("/?study=2&density=inspect");
  await shot(page, "global-inspect");
});

/* ---------------- SDOF ---------------- */

test("visual sdof default", async ({ page }) => {
  await page.goto("/?study=0");
  await shot(page, "sdof-default");
});

test("visual sdof mass selected", async ({ page }) => {
  await page.goto("/?study=0");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await shot(page, "sdof-mass");
});

test("visual sdof spring selected", async ({ page }) => {
  await page.goto("/?study=0");
  await page.getByRole("treeitem", { name: /Spring k1/ }).click();
  await shot(page, "sdof-spring");
});

test("visual sdof force view", async ({ page }) => {
  await page.goto("/?study=0");
  await page.getByRole("button", { name: "Force", exact: true }).click();
  await shot(page, "sdof-forces");
});

test("visual sdof derivation step 1", async ({ page }) => {
  await page.goto("/?study=0");
  await shot(page, "sdof-derivation-first");
});

test("visual sdof derivation final", async ({ page }) => {
  await page.goto("/?study=0");
  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  await shot(page, "sdof-derivation-final");
});

test("visual sdof response dock", async ({ page }) => {
  await page.goto("/?study=0");
  await page.getByRole("tab", { name: "Response" }).click();
  await shot(page, "sdof-response");
});

/* ---------------- damping ---------------- */

test("visual damping damper selected", async ({ page }) => {
  await page.goto("/?study=1");
  await page.getByRole("treeitem", { name: /Damper c1/ }).click();
  await shot(page, "damping-damper");
});

test("visual damping critical", async ({ page }) => {
  await page.goto("/?study=1");
  await page.getByRole("treeitem", { name: /Damper c1/ }).click();
  const field = page.getByLabel("Damping c1 value");
  await field.fill("20");
  await field.press("Enter");
  await shot(page, "damping-critical");
});

test("visual damping phase", async ({ page }) => {
  await page.goto("/?study=1");
  await page.getByRole("tab", { name: "Phase" }).click();
  await shot(page, "damping-phase");
});

test("visual damping energy", async ({ page }) => {
  await page.goto("/?study=1");
  await page.getByRole("tab", { name: "Energy" }).click();
  await shot(page, "damping-energy");
});

/* ---------------- 2DOF ---------------- */

test("visual 2dof model", async ({ page }) => {
  await page.goto("/?study=2");
  await shot(page, "2dof-model");
});

test("visual 2dof m1 selected", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mass m1/ }).click();
  await shot(page, "2dof-m1");
});

test("visual 2dof k2 selected", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  await shot(page, "2dof-k2");
});

test("visual 2dof K contribution", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await page.getByRole("treeitem", { name: /Spring k2/ }).click();
  await shot(page, "2dof-k-contribution");
});

test("visual 2dof matrix assembly", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("tab", { name: "Assembly" }).click();
  await shot(page, "2dof-assembly");
});

test("visual 2dof mode 1", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mode 1/ }).click();
  await shot(page, "2dof-mode-1");
});

test("visual 2dof mode 2", async ({ page }) => {
  await page.goto("/?study=2");
  await page.getByRole("treeitem", { name: /Mode 2/ }).click();
  await shot(page, "2dof-mode-2");
});

/* ---------------- MDOF ---------------- */

test("visual mdof ten dof low mode", async ({ page }) => {
  await page.goto("/?study=4");
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await page.getByLabel("DOF count").selectOption("10");
  await page.getByRole("tab", { name: "Modes" }).click();
  await page.getByRole("button", { name: "Select mode 1", exact: true }).click();
  await shot(page, "mdof-10-low");
});

test("visual mdof ten dof high mode", async ({ page }) => {
  await page.goto("/?study=4");
  await page.getByRole("treeitem", { name: "Study", exact: true }).click();
  await page.getByLabel("DOF count").selectOption("10");
  await page.getByRole("tab", { name: "Modes" }).click();
  await page.getByRole("button", { name: "Select mode 9", exact: true }).click();
  await shot(page, "mdof-10-high");
});

/* ---------------- free-free ---------------- */

test("visual free-free Tx", async ({ page }) => {
  await page.goto("/?study=5");
  await page.getByRole("button", { name: "Tx", exact: true }).click();
  await shot(page, "freefree-tx");
});

test("visual free-free Rz", async ({ page }) => {
  await page.goto("/?study=5");
  await page.getByRole("button", { name: "Rz", exact: true }).click();
  await shot(page, "freefree-rz");
});

test("visual free-free isometric body", async ({ page }) => {
  await page.goto("/?study=5");
  await page.getByRole("tab", { name: "Modes" }).click();
  await shot(page, "freefree-iso");
});

/* ---------------- FEM ---------------- */

test("visual fem model tree", async ({ page }) => {
  await page.goto("/?study=12");
  await shot(page, "fem-tree");
});

test("visual fem element selected", async ({ page }) => {
  await page.goto("/?study=12");
  await page.getByRole("treeitem", { name: /beam 2/ }).click();
  await shot(page, "fem-element");
});

test("visual fem local matrices", async ({ page }) => {
  await page.goto("/?study=12");
  await page.getByRole("tab", { name: "Assembly" }).click();
  await page.getByRole("treeitem", { name: /beam 2/ }).click();
  await shot(page, "fem-local-matrix");
});

test("visual fem global matrices", async ({ page }) => {
  await page.goto("/?study=12&density=inspect");
  await page.getByRole("tab", { name: "Matrices" }).click();
  await shot(page, "fem-global-matrix");
});

/** The FE modal group holds eight modes, so it opens collapsed. */
async function openFeModes(page: Page) {
  await page.getByRole("treeitem", { name: "Study · Modal" }).click();
}

test("visual fem mode 1", async ({ page }) => {
  await page.goto("/?study=12");
  await openFeModes(page);
  await page.getByRole("treeitem", { name: /Mode 1/ }).click();
  await shot(page, "fem-mode-1");
});

test("visual fem higher mode", async ({ page }) => {
  await page.goto("/?study=12");
  await openFeModes(page);
  await page.getByRole("treeitem", { name: /Mode 3/ }).click();
  await shot(page, "fem-mode-3");
});

/* ---------------- fallback and reduced motion ---------------- */

test("visual svg fallback", async ({ page }) => {
  await page.goto("/?study=2&renderer=svg");
  await shot(page, "fallback-svg");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("visual reduced motion", async ({ page }) => {
    await page.goto("/?study=2");
    await shot(page, "global-reduced");
  });
});
