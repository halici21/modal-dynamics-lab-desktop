import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const browser = process.env.MDL_CDP
  ? await chromium.connectOverCDP(process.env.MDL_CDP)
  : await chromium.launch();
const page = process.env.MDL_CDP
  ? browser.contexts()[0].pages()[0]
  : await browser.newPage({ viewport: { width: 1440, height: 900 } });
if (!process.env.MDL_CDP) await page.goto("http://127.0.0.1:1420");
await page.bringToFront();
await page.getByRole("button", { name: "Reset", exact: true }).click();
await page.getByRole("button", { name: "Play", exact: true }).click();
const baseline = await page.evaluate(() => ({
  commits: window.__labCommits(),
  subscribers: window.__labClock.diagnostics().subscribers,
}));
await page.waitForTimeout(10000);
const normal = await page.evaluate(() => ({
  ...window.__labClock.diagnostics(),
  commits: window.__labCommits(),
  state: window.__labClock.getState(),
}));
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.evaluate(() => window.__labClock.setTime(2));
await page.evaluate(() => {
  window.__latencies = [];
  window.__paintLatencies = [];
  const input = document.querySelector(".instrument-slider");
  const body = document.querySelector(".carriage");
  let started = null;
  input.addEventListener("input", () => {
    started = performance.now();
  });
  window.__latencyObserver = new MutationObserver(() => {
    if (started !== null) {
      const origin = started;
      window.__latencies.push(performance.now() - origin);
      requestAnimationFrame(() =>
        window.__paintLatencies.push(performance.now() - origin),
      );
      started = null;
    }
  });
  window.__latencyObserver.observe(body, {
    attributes: true,
    attributeFilter: ["transform"],
  });
});
const slider = page.getByRole("slider", {
  name: "Scrub simulation time",
  exact: true,
});
const box = await slider.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
const start = Date.now();
let step = 0;
while (Date.now() - start < 10000) {
  const ratio = 0.1 + 0.8 * (0.5 + 0.5 * Math.sin(step++ / 12));
  await page.mouse.move(box.x + box.width * ratio, box.y + box.height / 2);
  await page.waitForTimeout(16);
}
await page.mouse.up();
const latency = await page.evaluate(() => {
  window.__latencyObserver.disconnect();
  const a = window.__latencies.sort((a, b) => a - b);
  const p = window.__paintLatencies.sort((a, b) => a - b);
  return {
    nextFrameP95Ms: p[Math.floor(p.length * 0.95)],
    nextFrameMaxMs: p.at(-1),
    method:
      "input event to SVG mutation, plus next rendering opportunity (not physical display presentation)",
    samples: a.length,
    medianMs: a[Math.floor(a.length * 0.5)],
    p95Ms: a[Math.floor(a.length * 0.95)],
    maxMs: a.at(-1),
  };
});
await page.evaluate(() => {
  for (let i = 0; i < 1000; i++) {
    window.__labClock.play();
    window.__labClock.pause();
  }
});
const after = await page.evaluate(() => window.__labClock.diagnostics());
const result = {
  environment: process.env.MDL_CDP
    ? "Tauri WebView2 development"
    : "Chromium development harness",
  normal: {
    ...normal,
    reactCommitsDuringPlayback: normal.commits - baseline.commits,
  },
  latency,
  after1000Cycles: after,
  baseline,
};
await mkdir("docs/validation", { recursive: true });
await writeFile(
  "docs/validation/" +
    (process.env.MDL_CDP ? "native" : "browser") +
    "-performance.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
if (!process.env.MDL_CDP) await browser.close();
else await browser.close();

