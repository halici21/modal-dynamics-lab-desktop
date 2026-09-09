import { test, expect } from "@playwright/test";

/**
 * CAD EXPERIENCE R3 — viewport, camera, render architecture and lifecycle.
 */

test("Three.js viewport initialises with WebGL and a capped DPR", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await expect(page.locator(".viewport-canvas")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  await expect(page.locator(".viewport-canvas canvas")).toBeVisible();
  const stats = await page.evaluate(() => window.__studioViewport?.stats());
  expect(stats?.dpr).toBeLessThanOrEqual(2);
  expect(stats?.calls).toBeGreaterThan(0);
});

test("the canvas is hidden from assistive technology and has DOM equivalents", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await expect(page.locator(".viewport-canvas canvas")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  // Everything pickable in 3D is reachable in the tree instead.
  await expect(page.getByRole("treeitem", { name: /Mass m1/ })).toBeVisible();
  await expect(page.getByRole("treeitem", { name: /Spring k2/ })).toBeVisible();
});

test("named views, Fit and Reset are labelled and operable", async ({ page }) => {
  await page.goto("/?study=2");
  for (const name of [
    "Front view",
    "Back view",
    "Left view",
    "Right view",
    "Top view",
    "Bottom view",
    "Isometric view",
    "Fit view",
    "Reset view",
  ])
    await expect(page.getByRole("button", { name })).toBeEnabled();

  await page.getByRole("button", { name: "Top view" }).click();
  await expect(page.getByRole("button", { name: "Top view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(page.getByRole("button", { name: "Front view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("free-free opens isometric because rotation is the point", async ({ page }) => {
  await page.goto("/?study=5");
  await expect(
    page.getByRole("button", { name: "Isometric view" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: "Rigid body motion" })).toBeVisible();
  for (const dof of ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"])
    await expect(page.getByRole("button", { name: dof, exact: true })).toBeVisible();
});

test("camera reorientation never moves simulation time", async ({ page }) => {
  await page.goto("/?study=2");
  await page.evaluate(() => {
    window.__labClock.pause();
    window.__labClock.setTime(1.25);
  });
  await page.getByRole("button", { name: "Isometric view" }).click();
  await page.waitForTimeout(600);
  const t = await page.evaluate(() => window.__labClock.read());
  expect(t).toBeCloseTo(1.25, 6);
  expect(await page.evaluate(() => window.__labClock.getState().playing)).toBe(false);
});

test("SVG fallback renders a semantic stage instead of a blank viewport", async ({
  page,
}) => {
  await page.goto("/?study=2&renderer=svg");
  await expect(page.locator(".viewport-canvas")).toHaveAttribute(
    "data-renderer",
    "svg",
  );
  await expect(page.locator(".studio-svg-stage")).toBeVisible();
  // The stage animates; pause so the click target is stable.
  await page.evaluate(() => window.__labClock.pause());
  await expect(page.locator(".viewport-fallback")).toContainText(
    "Semantic stage active",
  );
  // Selection still works in the fallback.
  await page.getByRole("button", { name: "Select x1" }).click();
  await expect(page.locator(".studio-pane-head h2")).toContainText("m1");
});

test("playback runs on one RAF and commits no React frames", async ({ page }) => {
  await page.goto("/?study=2");
  await page.evaluate(() => window.__labClock.play());
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => window.__labCommits());
  const loops = await page.evaluate(
    () => window.__labClock.diagnostics().activeLoops,
  );
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => window.__labCommits());
  const frames = await page.evaluate(() => window.__labClock.diagnostics().frames);
  expect(loops).toBeLessThanOrEqual(1);
  expect(frames).toBeGreaterThan(20);
  // Steady playback must not push transient physics through React.
  expect(after - before).toBeLessThanOrEqual(1);
});

test("camera gestures during playback do not add a second loop", async ({ page }) => {
  await page.goto("/?study=2");
  await page.evaluate(() => window.__labClock.play());
  await page.getByRole("button", { name: "Isometric view" }).click();
  await page.getByRole("button", { name: "Front view" }).click();
  await page.waitForTimeout(700);
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().activeLoops),
  ).toBeLessThanOrEqual(1);
});

test("repeated study switching does not leak GPU resources", async ({ page }) => {
  await page.goto("/?study=2");
  const read = () => page.evaluate(() => window.__studioViewport?.stats());
  const ready = () =>
    expect
      .poll(() => page.evaluate(() => window.__studioViewport?.stats().geometries))
      .toBeGreaterThan(0);
  await ready();
  const baseline = await read();
  for (let round = 0; round < 3; round++)
    for (const study of ["0", "2", "4", "12", "5"]) {
      await page.getByRole("combobox", { name: "Study" }).selectOption(study);
      await page.waitForTimeout(320);
    }
  await page.getByRole("combobox", { name: "Study" }).selectOption("2");
  await ready();
  const after = await read();
  // Geometry count must return to the same order, not grow with every switch.
  expect(after!.geometries).toBeLessThanOrEqual(baseline!.geometries + 4);
  expect(after!.textures).toBe(0);
});

test("viewport picking selects the same object the tree does", async ({ page }) => {
  await page.goto("/?study=2");
  await page.evaluate(() => window.__labClock.pause());
  await page.evaluate(() => window.__labClock.setTime(0));
  const box = await page.locator(".viewport-canvas").boundingBox();
  // The masses sit either side of centre on the horizontal midline.
  await page.mouse.click(box!.x + box!.width * 0.36, box!.y + box!.height * 0.5);
  await page.waitForTimeout(300);
  const title = await page.locator(".studio-pane-head h2").textContent();
  expect(title).toMatch(/m1|k1|k2|Support/);
});

test("wheel zoom and drag orbit change the view without touching the clock", async ({
  page,
}) => {
  await page.goto("/?study=2");
  await page.evaluate(() => {
    window.__labClock.pause();
    window.__labClock.setTime(0.5);
  });
  const box = await page.locator(".viewport-canvas").boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, -240);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 60, box!.y + box!.height / 2 + 30);
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__labClock.read())).toBeCloseTo(0.5, 6);
});

test("resizing during playback keeps one loop and re-renders", async ({ page }) => {
  await page.goto("/?study=4");
  await page.evaluate(() => window.__labClock.play());
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.waitForTimeout(400);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() => window.__labClock.diagnostics().activeLoops),
  ).toBeLessThanOrEqual(1);
  await expect(page.locator(".viewport-canvas canvas")).toBeVisible();
});

test("mode-shape animation always discloses its visualization scale", async ({
  page,
}) => {
  await page.goto("/?study=3");
  await expect(page.locator(".viewport-scale")).toContainText("Visualization scale");
  await expect(page.locator(".viewport-scale")).toContainText(
    "not a physical amplitude",
  );
});

test("viewport labels are DOM text, not baked into the canvas", async ({ page }) => {
  await page.goto("/?study=2");
  const labels = page.locator(".viewport-label");
  await expect(labels).toHaveCount(2);
  await expect(labels.first()).toHaveText("x1");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("camera snaps, physics stays inspectable and step remains available", async ({
    page,
  }) => {
    await page.goto("/?study=2");
    await page.evaluate(() => window.__labClock.setTime(0.4));
    await page.getByRole("button", { name: "Isometric view" }).click();
    // No tween is scheduled, so no camera job is pending.
    await page.waitForTimeout(120);
    expect(
      await page.evaluate(() => window.__labClock.diagnostics().activeLoops),
    ).toBe(0);
    await expect(page.getByRole("button", { name: "Step forward" })).toBeEnabled();
    await expect(page.getByRole("tab", { name: "Response" })).toBeVisible();
    const t = await page.evaluate(() => window.__labClock.read());
    expect(t).toBeCloseTo(0.4, 6);
  });
});
