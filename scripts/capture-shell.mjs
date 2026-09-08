/**
 * CAD EXPERIENCE R3 — shell screenshot capture.
 *
 * Usage: node scripts/capture-shell.mjs <set> [outDir]
 *   set = before | prototypes | after
 *
 * Drives the running dev server with Playwright Chromium and writes PNGs into
 * docs/validation/cad-experience-r3/screenshots/<set>/.
 * This is evidence capture, not a test: it never asserts, it only records.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const BASE = "http://127.0.0.1:1420";
const set = process.argv[2] ?? "before";
const outDir =
  process.argv[3] ?? `docs/validation/cad-experience-r3/screenshots/${set}`;

async function serverUp() {
  try {
    const r = await fetch(BASE, { signal: AbortSignal.timeout(1200) });
    return r.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverUp()) return () => {};
  const child = spawn("npm", ["run", "dev"], {
    shell: true,
    stdio: "ignore",
    detached: false,
  });
  for (let i = 0; i < 60; i++) {
    await delay(1000);
    if (await serverUp()) return () => child.kill();
  }
  child.kill();
  throw new Error("dev server did not start on " + BASE);
}

/** Each entry: [name, viewport, async setup(page)] */
const SETS = {
  before: [
    ["01-sdof-default", [1440, 900], async () => {}],
    [
      "02-sdof-mass-selected",
      [1440, 900],
      async (p) =>
        p
          .getByRole("button", {
            name: "Inspect mass or drag to set initial displacement",
          })
          .click(),
    ],
    [
      "03-sdof-spring-selected",
      [1440, 900],
      async (p) =>
        p.getByRole("button", { name: "Inspect spring", exact: true }).click(),
    ],
    [
      "04-sdof-mathematics",
      [1440, 900],
      async (p) => p.getByRole("button", { name: "Mathematics" }).click(),
    ],
    ["05-damped-sdof", [1440, 900], async (p) => workspace(p, 1)],
    ["06-2dof", [1440, 900], async (p) => workspace(p, 2)],
    ["07-mode-browser-3dof", [1440, 900], async (p) => workspace(p, 3)],
    ["08-mdof", [1440, 900], async (p) => workspace(p, 4)],
    ["09-free-free", [1440, 900], async (p) => workspace(p, 5)],
    ["10-fe-modal", [1440, 900], async (p) => workspace(p, 12)],
    [
      "11-matrices",
      [1440, 900],
      async (p) => {
        await workspace(p, 2);
        await p
          .getByRole("combobox", { name: "Physics analysis" })
          .selectOption("Matrices");
      },
    ],
    ["12-light-theme", [1440, 900], async (p) => p.getByRole("button", { name: /Light appearance/ }).click()],
    ["13-minimum-window", [900, 680], async () => {}],
    ["14-maximized", [1920, 1009], async () => {}],
    ["15-intermediate", [1100, 760], async () => {}],
  ],
  prototypes: ["a", "b", "c"].flatMap((s) =>
    [
      ["1440x900", [1440, 900]],
      ["1100x760", [1100, 760]],
      ["900x680", [900, 680]],
    ].map(([label, vp]) => [
      `shell-${s}-${label}`,
      vp,
      async (page) => {
        await page.goto(`${BASE}/?r3=shell-${s}`);
        await page.waitForTimeout(500);
        if (s === "a")
          await page.getByRole("button", { name: "Items" }).click();
        if (s !== "b")
          await page
            .getByRole("button", { name: "Select mass m1" })
            .click({ force: true });
      },
    ]),
  ),
};

async function workspace(page, index) {
  await page
    .getByRole("combobox", { name: "Physics workspace" })
    .selectOption(String(index));
  await page.waitForTimeout(350);
}

const shots = SETS[set];
if (!shots) throw new Error("unknown capture set: " + set);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const stop = await ensureServer();
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
for (const [name, [w, h], setup] of shots) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(BASE);
  await page.waitForTimeout(400);
  try {
    await setup(page);
  } catch (e) {
    console.warn(`  setup failed for ${name}: ${e.message}`);
  }
  await page.evaluate(() => window.__labClock?.pause?.());
  await page.waitForTimeout(250);
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${outDir}/${name}.png`, animations: "disabled" });
  console.log("captured", name, `${w}x${h}`);
}
await context.close();
await browser.close();
stop();
