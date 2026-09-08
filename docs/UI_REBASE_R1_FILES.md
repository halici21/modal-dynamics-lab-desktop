# UI Rebase R1 — file inventory

Scope: existing Phase 2 → Scientific Workbench R1, version 0.2.1. No Git repository is present; this is the explicit task inventory.

## Application source

| File | Change |
|---|---|
| src/app/App.tsx | Compose Workbench slots; retain semantic physics state; isolate splitter shortcuts; relocate parameter/inspection/math content |
| src/app/styles.css | Replace previous shell cascade with responsive workbench, panel, stage, deck and theme styling |
| src/app/tokens.css | Graphite/light semantic palette, sans/tabular typography and shared tokens |
| src/components/Workbench.tsx | New dock/deck/rail/inspector composition and session layout state |
| src/components/WorkbenchReadout.tsx | New exact ref-driven live quantities and contextual physical referents |
| src/components/AnalysisVisibility.ts | New hidden-analysis subscription boundary |
| src/components/LearningTrajectory.tsx | Compact/expanded Lab Rail; future modules disabled |
| src/components/ConceptLensSwitcher.tsx | Compact visible labels while retaining accessible full names |
| src/visualization/PhysicsStage.tsx | Tighter viewBox, restrained instructional labels and formatting |
| src/visualization/ResponsePlot.tsx | Hidden-deck cleanup; envelope interaction interrupts guide; calm labels |
| src/visualization/SdofInspection.tsx | Hidden-deck cleanup and inspection/lens labels |

## Dependency and release metadata

- package.json, package-lock.json: react-resizable-panels 4.12.3; version 0.2.1.
- src-tauri/Cargo.toml, src-tauri/Cargo.lock, src-tauri/tauri.conf.json: application version 0.2.1 only.
- public/R1_THIRD_PARTY_NOTICES.txt: new dependency MIT notice, copied by Vite and embedded in Tauri assets.

## Tests and measurement harnesses

- tests/interaction/sdof.spec.ts, damping.spec.ts: open explicitly relocated inspector/math; retain numerical assertions.
- tests/interaction/visual.spec.ts, damping-visual.spec.ts: R1 snapshot names, historical PNGs retained.
- tests/interaction/workbench.spec.ts: eight new behavior/accessibility/resize/lifecycle checks.
- tests/interaction/workbench-visual.spec.ts: eleven new shell states.
- tests/visual/r1-*.png: 35 new baselines (9 SDOF + 15 damping + 11 workbench).
- scripts/measure-performance-r1.mjs, measure-scrub-r1.mjs: same-method before/after/native evidence paths.
- docs/validation/browser-v2-performance.json and browser-v2-scrub.json: refreshed pre-R1 baseline using the original V2 harness. Original historical raw values were overwritten by that harness; the historical V2 report is untouched. Refreshed baseline copies are explicitly retained as r1/before-*.json. After values are separate.
- docs/validation/r1/: baseline/exploration/production screenshots, before/after/native measurements, engine hash comparison, offline and installer evidence. Intermediate first/min/math captures are exploratory QA, not approved final baselines.

## Design/documentation

- docs/design-reference/r1-option-a.html, r1-option-b.html: isolated compositions, never bundled.
- docs/UI_REBASE_R1_REFERENCE_STUDY.md: ten-repository matrix and dependency assessment.
- docs/UI_REBASE_R1_DESIGN.md: 24-point plan and frozen-shell override supplement.
- docs/UI_REBASE_R1_REPORT.md: 18-section acceptance report.
- docs/UI_REBASE_R1_FILES.md: this inventory.
- docs/UI_REBASE_R1_THIRD_PARTY_NOTES.md: reuse/license record.
- README.md, docs/README.md: current status and R1 index links.

## Generated release outputs

- dist/: production assets and license notice; no prototypes or documentation imported.
- artifacts/modal-dynamics-lab.exe: current 0.2.1 executable (replaces the unversioned current EXE).
- artifacts/Modal Dynamics Lab_0.2.1_x64-setup.exe: new NSIS installer. Earlier versioned installers retained.
- artifacts/R1_THIRD_PARTY_NOTICES.txt: license notice beside the executable.
- %LOCALAPPDATA%/ModalDynamicsLab/build-v0: existing local build staging path, unchanged convention.
- %LOCALAPPDATA%/ModalDynamicsLab/qa-r1-install: per-user installer smoke destination.

## Explicitly unchanged

All src/physics/* and src/animation/* files (seven SHA-256 matches), native capability/event code, numerical tolerances, unit tests, frozen V1 specifications and historical V0/V1/V2 reports. No Phase 3 implementation.
