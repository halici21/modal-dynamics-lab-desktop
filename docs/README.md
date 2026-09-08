# Modal Dynamics Lab — Documentation Index

## Current release: PEDAGOGY / COURSE FLOW R1 (0.4.0)

The current release adds an offline-first pedagogy and course-flow layer on the validated Visual Experience R2 foundation while preserving the Windows desktop runtime.

- [Pedagogy / Course Flow R1 completion report](PEDAGOGY_R1_REPORT.md) — 32-section course-flow verdict and evidence.
- [Pedagogy audit](PEDAGOGY_R1_AUDIT.md), [curriculum](PEDAGOGY_R1_CURRICULUM.md), [concept graph](PEDAGOGY_R1_CONCEPT_GRAPH.md), [lesson model](PEDAGOGY_R1_LESSON_MODEL.md), [misconceptions](PEDAGOGY_R1_MISCONCEPTIONS.md), [notation](PEDAGOGY_R1_NOTATION.md), [test matrix](PEDAGOGY_R1_TEST_MATRIX.md), [walkthrough](PEDAGOGY_R1_WALKTHROUGH.md), and [files](PEDAGOGY_R1_FILES.md).
- [R2 completion report](VISUAL_EXPERIENCE_R2_REPORT.md) — 30-section visual release verdict and evidence.
- [Architecture](FULL_PHYSICS_R1_ARCHITECTURE.md) — model, rendering and runtime boundaries.
- [Numerics](FULL_PHYSICS_R1_NUMERICS.md) — equations, tolerances and solver assumptions.
- [Finite elements](FULL_PHYSICS_R1_FEM.md) — bar, beam, frame and convergence.
- [Test matrix](FULL_PHYSICS_R1_TEST_MATRIX.md) — independent oracles and integration checks.
- [Files](FULL_PHYSICS_R1_FILES.md) — source and evidence inventory.

The following files are the historical authoritative V1 specifications; explicit later user scope overrides are documented in the current architecture.

## `PRODUCT_SPEC_V1.md`
Defines **what we are building**:
- frozen scope,
- physics,
- modules,
- equations,
- numerical behavior,
- validation,
- phase roadmap.

## `VISUAL_MOTION_SPEC_V1.md`
Defines **how it should look, move, and feel**:
- Kinetic Scientific Instrument direction,
- Physics Stage,
- animation architecture,
- sliders,
- graphs,
- equation/matrix motion,
- performance,
- accessibility,
- desktop-window responsive behavior.

## `ASTRA_SKILL_MATRIX_V1.md`
Defines **which expertise owns which decisions**:
- physics,
- numerical methods,
- animation,
- visualization,
- UI,
- performance,
- desktop runtime,
- testing.

## `DESKTOP_RUNTIME_SPEC_V1.md`
Defines **the Windows desktop runtime**:
- Tauri 2,
- Vite + React + TypeScript,
- offline operation,
- window lifecycle,
- DPI scaling,
- multi-monitor behavior,
- packaging,
- native capability boundaries.

## `PHASE_0_IMPLEMENTATION_PROMPT.md`
Ready-to-use prompt for GPT-6 Astra to implement **Phase 0 only**.

---

## Required Reading Order

1. `../README.md`
2. `../AGENTS.md`
3. `PRODUCT_SPEC_V1.md`
4. `DESKTOP_RUNTIME_SPEC_V1.md`
5. `VISUAL_MOTION_SPEC_V1.md`
6. `ASTRA_SKILL_MATRIX_V1.md`

For implementation, then read the relevant phase prompt.

---

## Change Policy

These documents define the frozen V1 direction.

If scope, runtime, or design changes:
1. update the relevant specification first,
2. document the reason,
3. then update implementation.

Implementation must not silently redefine the product.

## V0 implementation records

- [V0_REPORT.md](V0_REPORT.md): acceptance results and known limitations.
- [V0_ARCHITECTURE.md](V0_ARCHITECTURE.md): state, animation, desktop and build contracts.
- [V0_FILES.md](V0_FILES.md): implementation file inventory.
- [validation/](validation/): measured runtime evidence.

## Phase 1 implementation records

- [V1_REPORT.md](V1_REPORT.md): numerical, desktop, accessibility and performance results.
- [V1_ARCHITECTURE.md](V1_ARCHITECTURE.md): analytical model, interactions and ownership contracts.
- [V1_FILES.md](V1_FILES.md): increment inventory.
- validation/*v1*: current measurements; V0 evidence is retained.

## Phase 2 implementation records

- [V2_REPORT.md](V2_REPORT.md): numerical, regression, desktop and performance validation.
- [V2_ARCHITECTURE.md](V2_ARCHITECTURE.md): damping mathematics, stable boundary strategy and UI contracts.
- [V2_FILES.md](V2_FILES.md): increment inventory.
- validation/*v2*: current measurements; all prior evidence remains historical.

## UI Rebase R1 — on Phase 2

- [UI_REBASE_R1_REPORT.md](UI_REBASE_R1_REPORT.md): current verdict, 39 unit / 68 UI checks, native/performance evidence and limitations.
- [UI_REBASE_R1_DESIGN.md](UI_REBASE_R1_DESIGN.md): Scientific Workbench plan and frozen-shell overrides.
- [UI_REBASE_R1_REFERENCE_STUDY.md](UI_REBASE_R1_REFERENCE_STUDY.md): ten-source research matrix.
- [UI_REBASE_R1_FILES.md](UI_REBASE_R1_FILES.md): task file inventory.
- [UI_REBASE_R1_THIRD_PARTY_NOTES.md](UI_REBASE_R1_THIRD_PARTY_NOTES.md): dependency/license record.
- validation/r1/: explicitly separated before/after/native evidence. R1 keeps Phase 2; Phase 3 remains deferred.
## Visual Experience R2 — foundation release (0.4.0)

- [R2 completion report](VISUAL_EXPERIENCE_R2_REPORT.md) — 30-section release verdict, visual QA and desktop evidence.
- [R2 design](VISUAL_EXPERIENCE_R2_DESIGN.md) — Scientific Workbench information architecture, tokens and workspace patterns.
- [R2 renderer decision](VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md) — A/B/C prototypes and the SVG-first production decision.
- [R2 motion](VISUAL_EXPERIENCE_R2_MOTION.md) — semantic motion, reduced-motion behavior and lifecycle contracts.
- [R2 test matrix](VISUAL_EXPERIENCE_R2_TEST_MATRIX.md) — UI, accessibility, renderer and performance coverage.
- [R2 files](VISUAL_EXPERIENCE_R2_FILES.md) — source and validation inventory.
- [R2 third-party](VISUAL_EXPERIENCE_R2_THIRD_PARTY.md) — dependency and license record.



