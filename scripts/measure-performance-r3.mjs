/**
 * CAD EXPERIENCE R3 — GATE 19 performance measurement.
 *
 * Measures, per study, with playback running for a fixed window:
 *   FPS, average / worst frame time, RAF loop count, clock subscriber count,
 *   React commits, draw calls, triangles, geometries, scene objects, DPR,
 *   and JS heap where the browser exposes it.
 *
 * Usage: node scripts/measure-performance-r3.mjs [outFile]
 * Set MDL_CDP to attach to the packaged Tauri window over CDP instead of a
 * headless browser (the desktop numbers are the ones that count).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const OUT =
  process.argv[2] ?? "docs/validation/cad-experience-r3/performance-r3.json";
const WINDOW_MS = 6000;

const STUDIES = [
  { id: 0, name: "Undamped SDOF" },
  { id: 2, name: "2DOF" },
  { id: 4, name: "MDOF (10 DOF)", dof: "10" },
  { id: 5, name: "Free-Free 3D" },
  { id: 12, name: "FE beam" },
];

const browser = process.env.MDL_CDP
  ? await chromium.connectOverCDP(process.env.MDL_CDP)
  : await chromium.launch();
const page = process.env.MDL_CDP
  ? browser.contexts()[0].pages()[0]
  : await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
for (const study of STUDIES) {
  if (process.env.MDL_CDP) {
    await page
      .getByRole("combobox", { name: "Study" })
      .selectOption(String(study.id));
  } else {
    await page.goto(`http://127.0.0.1:1420/?study=${study.id}`);
  }
  await page.waitForTimeout(900);

  if (study.dof) {
    await page.getByRole("treeitem", { name: "Study", exact: true }).click();
    await page.getByLabel("DOF count").selectOption(study.dof);
    await page.waitForTimeout(500);
  }

  await page.evaluate(() => {
    window.__labClock.reset();
    window.__labClock.play();
  });
  await page.waitForTimeout(700); // let the first frames settle
  const start = await page.evaluate(() => ({
    commits: window.__labCommits(),
    frames: window.__labClock.diagnostics().frames,
  }));
  await page.waitForTimeout(WINDOW_MS);

  const sample = await page.evaluate(() => {
    const d = window.__labClock.diagnostics();
    const stats = window.__studioViewport?.stats() ?? null;
    const memory = performance.memory
      ? Math.round(performance.memory.usedJSHeapSize / 1048576)
      : null;
    return {
      fps: d.fps,
      averageMs: d.averageMs,
      worstMs: d.worstMs,
      recentMs: d.recentMs,
      activeLoops: d.activeLoops,
      subscribers: d.subscribers,
      frames: d.frames,
      commits: window.__labCommits(),
      renderer: stats ? stats.renderer : "svg",
      calls: stats?.calls ?? null,
      triangles: stats?.triangles ?? null,
      geometries: stats?.geometries ?? null,
      textures: stats?.textures ?? null,
      objects: stats?.objects ?? null,
      dpr: stats?.dpr ?? null,
      heapMB: memory,
    };
  });

  await page.evaluate(() => window.__labClock.pause());
  results.push({
    study: study.name,
    module: study.id,
    windowMs: WINDOW_MS,
    fps: Number(sample.fps.toFixed(1)),
    averageFrameMs: Number(sample.averageMs.toFixed(2)),
    worstFrameMs: Number(sample.worstMs.toFixed(2)),
    framesInWindow: sample.frames - start.frames,
    rafLoops: sample.activeLoops,
    clockSubscribers: sample.subscribers,
    reactCommitsInWindow: sample.commits - start.commits,
    renderer: sample.renderer,
    drawCalls: sample.calls,
    triangles: sample.triangles,
    geometries: sample.geometries,
    textures: sample.textures,
    sceneObjects: sample.objects,
    dpr: sample.dpr,
    heapMB: sample.heapMB,
  });
  console.log(
    `${study.name.padEnd(16)} ${results.at(-1).fps} fps  avg ${results.at(-1).averageFrameMs} ms  worst ${results.at(-1).worstFrameMs} ms  calls ${sample.calls}  tris ${sample.triangles}  commits ${results.at(-1).reactCommitsInWindow}  loops ${sample.activeLoops}`,
  );
}

/* Renderer lifecycle: repeated study switching must not grow GPU resources. */
if (!process.env.MDL_CDP) await page.goto("http://127.0.0.1:1420/?study=2");
await page.waitForTimeout(900);
const leakBefore = await page.evaluate(
  () => window.__studioViewport?.stats() ?? null,
);
for (let round = 0; round < 4; round++)
  for (const id of [0, 2, 4, 12, 5]) {
    await page.getByRole("combobox", { name: "Study" }).selectOption(String(id));
    await page.waitForTimeout(260);
  }
await page.getByRole("combobox", { name: "Study" }).selectOption("2");
await page.waitForTimeout(900);
const leakAfter = await page.evaluate(
  () => window.__studioViewport?.stats() ?? null,
);

const report = {
  release: "CAD EXPERIENCE R3",
  measuredAt: new Date().toISOString(),
  target: process.env.MDL_CDP ? "tauri-webview2" : "chromium-headless",
  viewport: "1440x900",
  budgetMs: 16.7,
  studies: results,
  lifecycle: {
    switches: 20,
    geometriesBefore: leakBefore?.geometries ?? null,
    geometriesAfter: leakAfter?.geometries ?? null,
    texturesAfter: leakAfter?.textures ?? null,
    note: "Geometry count must return to the same order after repeated study switching, not grow with each switch.",
  },
};

await mkdir("docs/validation/cad-experience-r3", { recursive: true });
await writeFile(OUT, JSON.stringify(report, null, 2) + "\n");
console.log(
  `\nlifecycle: geometries ${report.lifecycle.geometriesBefore} -> ${report.lifecycle.geometriesAfter} after 20 switches`,
);
console.log("wrote", OUT);
await browser.close();
