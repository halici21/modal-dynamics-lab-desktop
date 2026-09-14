# Documentation index

This index is the curated path through the public repository. Start with the short release reports, then open the deeper technical documents when you need equations, tolerances or implementation evidence.

## Start here

- [Public presentation audit](GITHUB_PRESENTATION_R1_AUDIT.md) — what a researcher, student, open-source developer and reviewer can understand from the public repository.
- [Public presentation report](GITHUB_PRESENTATION_R1_REPORT.md) — screenshots, CI, metadata and validation for the current presentation pass.
- [Pedagogy / Course Flow R1 report](PEDAGOGY_R1_REPORT.md) — the current nine-chapter Learn / Explore / Inspect release.
- [Full Physics R1 report](FULL_PHYSICS_R1_REPORT.md) — numerical scope, reference cases and known limitations.

## Architecture and runtime

- [Full Physics architecture](FULL_PHYSICS_R1_ARCHITECTURE.md)
- [Desktop runtime specification](DESKTOP_RUNTIME_SPEC_V1.md)
- [Visual and motion specification](VISUAL_MOTION_SPEC_V1.md)
- [ASTRA skill matrix](ASTRA_SKILL_MATRIX_V1.md)
- [Phase 0 implementation prompt](PHASE_0_IMPLEMENTATION_PROMPT.md)

## Physics and numerics

- [Numerical methods, tolerances and solver assumptions](FULL_PHYSICS_R1_NUMERICS.md)
- [Finite-element models and convergence](FULL_PHYSICS_R1_FEM.md)
- [Independent test matrix and oracle coverage](FULL_PHYSICS_R1_TEST_MATRIX.md)
- [Pedagogy notation](PEDAGOGY_R1_NOTATION.md)
- [Pedagogy concept graph](PEDAGOGY_R1_CONCEPT_GRAPH.md)

## Visualization, UX and pedagogy

- [Visual Experience R2 report](VISUAL_EXPERIENCE_R2_REPORT.md)
- [Visual Experience R2 design](VISUAL_EXPERIENCE_R2_DESIGN.md)
- [Renderer decision](VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md)
- [Pedagogy curriculum](PEDAGOGY_R1_CURRICULUM.md)
- [Pedagogy lesson model](PEDAGOGY_R1_LESSON_MODEL.md)
- [Pedagogy walkthrough](PEDAGOGY_R1_WALKTHROUGH.md)
- [Misconceptions and checkpoints](PEDAGOGY_R1_MISCONCEPTIONS.md)

## Validation evidence

The `validation/` tree contains measured screenshots, JSON summaries and runtime records. The most useful entry points are:

- `validation/pedagogy-r1/`
- `validation/full-physics-r1/`
- `validation/visual-experience-r2/`
- `validation/cad-experience-r3/`
- `validation/r1/` and `validation/v2/` for earlier desktop/runtime evidence

## Historical implementation records

Earlier phase reports remain available for traceability and should be read as historical records rather than the current landing page:

- V0: `V0_REPORT.md`, `V0_ARCHITECTURE.md`, `V0_FILES.md`
- V1: `V1_REPORT.md`, `V1_ARCHITECTURE.md`, `V1_FILES.md`
- V2: `V2_REPORT.md`, `V2_ARCHITECTURE.md`, `V2_FILES.md`
- UI Rebase R1: `UI_REBASE_R1_REPORT.md`, `UI_REBASE_R1_DESIGN.md`, `UI_REBASE_R1_FILES.md`
- GitHub publication: `GITHUB_INITIAL_PUBLISH_REPORT.md`, `GITHUB_PUBLICATION_REPORT.md`

## Public repository rules

The repository is a Windows desktop application. `AGENTS.md` and the authoritative V1 specifications define the runtime boundary, offline requirement, physics ownership, animation lifecycle, accessibility expectations and validation discipline.
