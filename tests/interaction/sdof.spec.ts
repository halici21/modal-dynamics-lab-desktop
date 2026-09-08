import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
});
test("physical controls preserve time and reject invalid constraints", async ({
  page,
}) => {
  await page.evaluate(() => window.__labClock.setTime(0.2));
  for (const [label, bad] of [
    ["Mass", "0"],
    ["Stiffness", "-1"],
    ["Initial displacement", "Infinity"],
    ["Initial velocity", "bad"],
  ]) {
    const input = page.getByRole("textbox", { name: label + " value" });
    await input.fill(bad);
    await input.press("Enter");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await input.press("Escape");
  }
  const k = page.getByRole("textbox", { name: "Stiffness value" });
  await k.fill("400");
  await k.press("Enter");
  await expect(page.getByTestId("omega")).toHaveText("20.0000");
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0.2);
  expect(
    Number(await page.locator(".carriage").getAttribute("data-x")),
  ).toBeCloseTo(0.1 * Math.cos(4), 8);
});
test("zero stiffness gives free drift, finite outputs and no false period", async ({
  page,
}) => {
  const v = page.getByRole("textbox", { name: "Initial velocity value" });
  await v.fill(".3");
  await v.press("Enter");
  const k = page.getByRole("textbox", { name: "Stiffness value" });
  await k.fill("0");
  await k.press("Enter");
  await expect(page.getByTestId("period")).toHaveText("—");
  await expect(page.getByTestId("frequency")).toHaveText("0");
  await page.evaluate(() => window.__labClock.setTime(2));
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.locator('[data-quantity="x"]')).toHaveText("0.7000");
  await expect(page.locator('[data-quantity="force"]')).toHaveText("0");
  expect(await page.locator("main").innerText()).not.toMatch(
    /NaN|Infinity|undefined/,
  );
});
test("energy and phase cursor agree with one frozen sample", async ({
  page,
}) => {
  await page.evaluate(() => window.__labClock.setTime(Math.PI / 20));
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.locator('[data-quantity="kinetic"]')).toHaveText("0.5000");
  await expect(page.locator('[data-quantity="potential"]')).toHaveText("0");
  expect(
    Number(await page.locator(".kinetic-bar").getAttribute("width")),
  ).toBeCloseTo(500, 6);
  await page.getByRole("button", { name: "Phase Space", exact: true }).click();
  expect(
    Number(await page.locator(".phase-dot").getAttribute("cx")),
  ).toBeCloseTo(300, 5);
  expect(
    Number(await page.locator(".phase-dot").getAttribute("cy")),
  ).toBeCloseTo(170, 3);
  await page.getByRole("button", { name: "Forces", exact: true }).click();
  await expect(page.locator(".force-vector")).toHaveAttribute(
    "visibility",
    "visible",
  );
});
test("mass drag pauses and sets bounded initial displacement at time zero", async ({
  page,
}) => {
  await page.evaluate(() => window.__labClock.setTime(0.2));
  const mass = page.locator(".carriage"),
    box = (await mass.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 45, box.y + box.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  expect(await page.evaluate(() => window.__labClock.read())).toBe(0);
  expect(await page.evaluate(() => window.__labClock.getState().playing)).toBe(
    false,
  );
  const x = Number(
    await page
      .getByRole("textbox", { name: "Initial displacement value" })
      .inputValue(),
  );
  expect(x).toBeLessThan(0.1);
  expect(x).toBeGreaterThanOrEqual(-0.2);
  expect(Number(await mass.getAttribute("data-x"))).toBeCloseTo(x, 4);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Initial displacement value" }),
  ).toHaveValue("0.1");
});
test("equation links persist and educational transitions do not queue", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await page
    .getByRole("button", { name: "Link k to spring", exact: true })
    .click();
  await expect(page.locator(".spring-object")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await page
    .getByRole("button", { name: "Link k to spring", exact: true })
    .click();
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".derivation")!.getAnimations({ subtree: true })
          .length,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await expect(page.locator(".derivation")).toHaveClass(/step-0/);
});
test("guided experiments are user-controlled and new input interrupts", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Increase stiffness ↗" }).click();
  await page
    .getByRole("button", { name: "Pause experiment", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Apply change" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Resume experiment", exact: true })
    .click();
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByTestId("omega")).toHaveText("20.0000");
  await page.getByRole("button", { name: "Skip / Finish" }).click();
  await page.getByRole("button", { name: "Increase mass ↗" }).click();
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByTestId("omega")).toHaveText("5.0000");
  const k = page.getByRole("slider", { name: "Stiffness", exact: true });
  await k.focus();
  await k.press("ArrowRight");
  await expect(
    page.getByRole("region", { name: "Guided experiment" }),
  ).toHaveCount(0);
});
test("all lenses remain accessible in both appearances", async ({ page }) => {
  for (const light of [false, true]) {
    if (light)
      await page
        .getByRole("button", { name: "Switch to light appearance" })
        .click();
    for (const lens of ["Forces", "Energy", "Phase Space", "Mathematics"]) {
      await page.getByRole("button", { name: lens, exact: true }).click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
});
test("continuous frames do not rebuild the graph or commit React", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const w = window as unknown as { __labCommits(): number };
    const path = document.querySelector(".trace")!,
      points = path.getAttribute("points");
    window.__labClock.play();
    const before = w.__labCommits();
    await new Promise((r) => setTimeout(r, 350));
    window.__labClock.pause();
    return {
      commits: w.__labCommits() - before,
      stable: points === path.getAttribute("points"),
    };
  });
  expect(result.commits).toBeLessThanOrEqual(1);
  expect(result.stable).toBe(true);
});





