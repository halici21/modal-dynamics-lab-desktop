/**
 * CAD EXPERIENCE R3 — GATE 3/4 objective shell metrics.
 *
 * Measures, for each prototype at each evaluated width:
 *   - viewport area as a fraction of the window (the brief's 55-70% target)
 *   - stage pixel width/height actually available to the physical model
 *   - permanently visible interactive controls (clutter proxy)
 *   - horizontal page overflow at the minimum window
 *   - steps needed to reach the mathematics from a cold start
 * Numbers, not impressions, feed the GATE 4 decision table.
 */
import { chromium } from "@playwright/test";
import { setTimeout as delay } from "node:timers/promises";

const BASE = "http://127.0.0.1:1420";
const SIZES = [
  [1440, 900],
  [1100, 760],
  [900, 680],
];
const STAGE_SELECTOR = {
  "shell-a": ".proto-a-viewport",
  "shell-b": ".proto-b-center",
  "shell-c": ".proto-c-viewport",
};

const browser = await chromium.launch();
const page = await browser.newPage();
const rows = [];
for (const shell of ["shell-a", "shell-b", "shell-c"]) {
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`${BASE}/?r3=${shell}`);
    await delay(450);
    const m = await page.evaluate((sel) => {
      const stage = document.querySelector(sel);
      const r = stage?.getBoundingClientRect();
      const svg = document.querySelector(".proto-stage")?.getBoundingClientRect();
      const controls = [
        ...document.querySelectorAll("button, select, input, [role=treeitem]"),
      ].filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0;
      }).length;
      return {
        stageArea: r ? Math.round(r.width * r.height) : 0,
        stageW: r ? Math.round(r.width) : 0,
        stageH: r ? Math.round(r.height) : 0,
        svgW: svg ? Math.round(svg.width) : 0,
        svgH: svg ? Math.round(svg.height) : 0,
        controls,
        overflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        // ribbon/tab strips that clip rather than wrap
        clipped: [...document.querySelectorAll("*")].filter((el) => {
          const s = getComputedStyle(el);
          return (
            s.overflowX === "auto" &&
            el.scrollWidth > el.clientWidth + 2
          );
        }).length,
      };
    }, STAGE_SELECTOR[shell]);
    rows.push({
      shell,
      size: `${w}x${h}`,
      viewportPct: +((m.stageArea / (w * h)) * 100).toFixed(1),
      stage: `${m.stageW}x${m.stageH}`,
      modelSvg: `${m.svgW}x${m.svgH}`,
      visibleControls: m.controls,
      pageOverflow: m.overflow,
      clippedStrips: m.clipped,
    });
  }
}
await browser.close();
console.log(JSON.stringify(rows, null, 2));
