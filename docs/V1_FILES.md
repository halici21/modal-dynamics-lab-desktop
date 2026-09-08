# Phase 1 file inventory

## Created
- src/physics/sdof.ts
- src/visualization/sdofGeometry.ts
- src/visualization/SdofInspection.tsx
- src/components/EquationDerivation.tsx
- src/education/GuidedExperiment.tsx
- tests/unit/sdof.test.ts
- tests/interaction/sdof.spec.ts
- tests/visual/v1-{dark,light,narrow,reduced,forces,energy,phase,math,zero}.png
- scripts/validate-sdof.mjs
- scripts/measure-performance-v1.mjs
- scripts/measure-scrub-v1.mjs
- docs/V1_ARCHITECTURE.md
- docs/V1_FILES.md
- docs/V1_REPORT.md
- docs/validation/v1-numerical.json
- docs/validation/browser-v1-performance.json
- docs/validation/browser-v1-scrub.json
- docs/validation/native-v1-performance.json
- docs/validation/native-v1-scrub.json
- docs/validation/native-v1-lifecycle.json
- docs/validation/native-v1-minimum.json
- docs/validation/native-v1-minimum.png
- docs/validation/v1-first.png and v1-min-preview.png (intermediate QA, not release baselines)

## Modified
- README.md and docs/README.md: current release status.
- package.json, package-lock.json: version 0.1.0 and local KaTeX dependencies.
- src-tauri/Cargo.toml, Cargo.lock, tauri.conf.json: application version.
- src/app/App.tsx: Phase 1 semantic composition.
- src/app/state.ts: Phase Space lens type; V0 reducer contract retained.
- src/app/styles.css: scientific views and compact desktop layout.
- src/components/NumericField.tsx, ParameterSlider.tsx: opt-in strict physical validation.
- src/components/StatusReadout.tsx: simulation terminology.
- src/components/Diagnostics.tsx: actual DOF, sample count and analytical solve duration.
- src/education/content.ts: Phase Space lens routing.
- src/visualization/PhysicsStage.tsx, ResponsePlot.tsx: replace calibration fixture with the validated physical model.
- tests/interaction/foundation.spec.ts: migrate calibration names and values while retaining eight regression scenarios.
- tests/interaction/visual.spec.ts: intentional Phase 1 visual baselines.

The 18 V0 unit tests, SimulationClock, lifecycle/native focus logic, native capabilities, Rust startup and desktop helper remain unchanged. Historical V0 images and measurements remain available.

## Deliverables
- artifacts/modal-dynamics-lab.exe
- artifacts/Modal Dynamics Lab_0.1.0_x64-setup.exe

See V1_REPORT.md for additional final packaged-app smoke evidence.

Final evidence: docs/validation/production-v1-smoke.json and production-v1-offline.png.
