/**
 * CAD EXPERIENCE R3 — physics immutability manifest.
 *
 * Usage:
 *   node scripts/physics-manifest.mjs write <outFile>   record current hashes
 *   node scripts/physics-manifest.mjs check <refFile>   compare against a manifest
 *
 * The frozen set is every module that computes structural dynamics, plus the
 * animation clock that owns simulation time. Presentation code is not listed.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

export const FROZEN = [
  ...readdirSync("src/physics")
    .filter((f) => f.endsWith(".ts"))
    .map((f) => "src/physics/" + f),
  "src/animation/SimulationClock.ts",
  "src/animation/lifecycle.ts",
  "src/animation/motion.ts",
];

export function hashes() {
  const out = {};
  for (const f of FROZEN)
    out[f] = createHash("sha256").update(readFileSync(f)).digest("hex");
  return out;
}

const mode = process.argv[2];
if (mode === "write") {
  const out = process.argv[3];
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const tauri = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
  const manifest = {
    release: "CAD EXPERIENCE R3",
    snapshotOf: "pre-R3 baseline",
    gitBaselineCommit: "963ca83",
    capturedAt: new Date().toISOString(),
    packageVersion: pkg.version,
    tauriVersion: tauri.version,
    packagedArtifacts: readdirSync("artifacts").filter((f) =>
      f.endsWith(".exe"),
    ),
    tests: {
      vitest: {
        command: "npm test",
        files: 7,
        passed: 85,
        failed: 0,
        note: "Measured 2026-09-08 on commit 963ca83. The brief quoted an 81-test physics baseline; the repository actually runs 85 vitest tests (63 physics/numerical in sdof+damping+full-physics, 22 clock/lifecycle/foundation/pedagogy).",
      },
      playwright: {
        command: "npm run test:ui",
        passed: 100,
        failed: 0,
        note: "Measured 2026-09-08 on commit 963ca83. The brief quoted 96; the repository actually runs 100 interaction/accessibility/visual tests.",
      },
    },
    physicsFrozenFiles: hashes(),
    screenshots: {
      before: "docs/validation/cad-experience-r3/screenshots/before/",
      note: "15 pre-R3 frames at 1440x900, 900x680, 1920x1009 and 1100x760. Two setup steps (mass selection, theme toggle) did not apply before their capture, so those frames show the default state.",
    },
    backup: {
      path: "backups/",
      gitignored: true,
      note: "Timestamped copy of src/ before R3 edits.",
    },
  };
  writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote", out, "with", FROZEN.length, "hashed files");
} else if (mode === "check") {
  const ref = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const now = hashes();
  const rows = [];
  let changed = 0;
  for (const f of Object.keys(ref.physicsFrozenFiles)) {
    const before = ref.physicsFrozenFiles[f];
    const after = now[f] ?? "MISSING";
    const ok = before === after;
    if (!ok) changed++;
    rows.push({ file: f, before, after, status: ok ? "UNCHANGED" : "CHANGED" });
  }
  for (const f of Object.keys(now))
    if (!(f in ref.physicsFrozenFiles)) {
      changed++;
      rows.push({
        file: f,
        before: "ABSENT",
        after: now[f],
        status: "ADDED",
      });
    }
  console.log(JSON.stringify({ changed, rows }, null, 2));
  process.exitCode = changed ? 1 : 0;
} else {
  console.error("usage: physics-manifest.mjs write|check <file>");
  process.exitCode = 2;
}
