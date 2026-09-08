import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const native = !!process.env.MDL_CDP,
  browser = native
    ? await chromium.connectOverCDP(process.env.MDL_CDP)
    : await chromium.launch();
const page = native
  ? browser.contexts()[0].pages()[0]
  : await browser.newPage({ viewport: { width: 1440, height: 900 } });
if (!native) await page.goto("http://127.0.0.1:1420");
await page.getByRole("button", { name: "Reset", exact: true }).click();
await page.getByRole("button", { name: "Phase Space", exact: true }).click();
await page.locator(".response").scrollIntoViewIfNeeded();
await page.evaluate(() => {
  window.__scrubLatency = [];
  let origin = null;
  const input = document.querySelector(".timeline-scrubber");
  window.__scrubListener = () => {
    origin = performance.now();
  };
  input.addEventListener("input", window.__scrubListener);
  window.__scrubObserver = new MutationObserver(() => {
    if (origin !== null) {
      window.__scrubLatency.push(performance.now() - origin);
      origin = null;
    }
  });
  window.__scrubObserver.observe(document.querySelector(".carriage"), {
    attributes: true,
    attributeFilter: ["transform"],
  });
});
const box = await page.locator(".timeline-scrubber").boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
const start = Date.now();
let i = 0;
while (Date.now() - start < 10000) {
  await page.mouse.move(
    box.x + box.width * (0.5 + 0.4 * Math.sin(i++ / 12)),
    box.y + box.height / 2,
  );
  await page.waitForTimeout(16);
}
await page.mouse.up();
const result = await page.evaluate(() => {
  window.__scrubObserver.disconnect();
  document
    .querySelector(".timeline-scrubber")
    .removeEventListener("input", window.__scrubListener);
  const a = window.__scrubLatency.sort((a, b) => a - b);
  return {
    samples: a.length,
    p95Ms: a[Math.floor(a.length * 0.95)],
    maxMs: a.at(-1),
    diagnostics: window.__labClock.diagnostics(),
    method:
      "input event to SVG mutation, Phase Space lens active; not optical latency",
  };
});
await writeFile(
  "docs/validation/" + (native ? "native" : "browser") + "-v1-scrub.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
