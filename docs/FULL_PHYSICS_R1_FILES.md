# FULL PHYSICS R1 — file inventory

Version 0.3.0. This workspace has no Git repository; this is the implementation inventory, not a claimed Git diff. Earlier UI Rebase R1 files and historical evidence remain available.

## New numerical core

- src/physics/common.ts — matrix operations, validation, SPD factorization and symmetric eigensolver adapter.
- src/physics/systems.ts — generic assembly, boundaries and Rayleigh damping.
- src/physics/modal.ts — generalized modes, normalization, tracking, projection, participation and modal response.
- src/physics/frequency.ts — complex solves, direct/modal FRF and base response.
- src/physics/dynamics.ts — analytical forcing and Newmark integration.
- src/physics/spectra.ts — recorded response spectra and PSD/RMS.
- src/physics/rigid.ts — 2D/3D rigid bases and geometry-preserving transformations.
- src/physics/fem.ts — bar, Euler–Bernoulli beam, planar frame and assembly.

## Application integration

- src/app/CoreWorkbench.tsx — new physics controls, analysis panels and validation.
- src/visualization/CoreViews.tsx — shared-clock modal/FE stage, physical readouts and plots.
- src/app/App.tsx — workspace selector and routing.
- src/app/styles.css — new functional controls and analysis styles.
- src/components/Workbench.tsx — optional inspector hint for core modules.
- src/components/LearningTrajectory.tsx — enable completed labs.

Existing physics and animation source hashes are unchanged for all seven baseline files; see validation/full-physics-r1/engine-regression.json.

## Tests and reproducibility

- tests/unit/full-physics.test.ts — 42 new numerical cases.
- tests/fixtures/full-physics-oracle.json — independent deterministic NumPy/SciPy references.
- scripts/generate-physics-oracles.py — reference generation.
- scripts/measure-physics.ts — numerical timing harness.
- tests/interaction/full-physics.spec.ts — 10 functional/accessibility/lifecycle cases.
- tests/interaction/full-physics-visual.spec.ts — 12 new workspace visual cases.
- tests/interaction/damping.spec.ts — name-specific damping selector.
- tests/interaction/sdof.spec.ts — settled paused-loop assertion.
- tests/interaction/workbench.spec.ts — completed rail assertion.
- tests/interaction/{visual,damping-visual,workbench-visual}.spec.ts — current-release snapshot names.
- tests/visual/full-r1-*.png — 47 current-release baseline states; historical snapshots retained.

## Runtime and licensing

- package.json, package-lock.json — version, pinned ml-matrix and validation scripts.
- src-tauri/Cargo.toml, src-tauri/Cargo.lock, src-tauri/tauri.conf.json — version 0.3.0; runtime/security boundaries unchanged.
- public/FULL_PHYSICS_R1_THIRD_PARTY_NOTICES.txt — local numerical dependency notices.
- artifacts/FULL_PHYSICS_R1_THIRD_PARTY_NOTICES.txt — distributable notice copy.
- dist/ — generated offline frontend assets, fonts and notices.
- artifacts/modal-dynamics-lab.exe — current production Windows executable.
- artifacts/Modal Dynamics Lab_0.3.0_x64-setup.exe — current NSIS installer including offline WebView2 installer.

## Documentation and evidence

- README.md, docs/README.md — current release status and index.
- docs/FULL_PHYSICS_R1_REPORT.md — 30-section completion report.
- docs/FULL_PHYSICS_R1_ARCHITECTURE.md — responsibilities and API inventory.
- docs/FULL_PHYSICS_R1_NUMERICS.md — equations, conventions, tolerances and limitations.
- docs/FULL_PHYSICS_R1_FEM.md — element definitions, assembly and convergence.
- docs/FULL_PHYSICS_R1_TEST_MATRIX.md — validation coverage and commands.
- docs/FULL_PHYSICS_R1_FILES.md — this inventory.
- docs/validation/full-physics-r1/ — numerical maxima, engine comparison, numerical/browser/native timings, desktop/installer/offline evidence, screenshots and final artifact hashes. fe-first.png is an intermediate debugging capture, not an accepted final visual.

No frozen specification, desktop capability expansion, cloud service, Three.js or WebGPU implementation was introduced.
