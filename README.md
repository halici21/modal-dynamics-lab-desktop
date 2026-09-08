# Modal Dynamics Lab

A local-first **Windows desktop application** for learning modal analysis from physical intuition to modal interpretation.

The V1 learning path is intentionally focused:

\[
\text{Undamped SDOF}
\rightarrow
\text{Damped SDOF}
\rightarrow
\text{2DOF}
\rightarrow
\text{Mode Shapes}
\rightarrow
\text{MDOF}
\rightarrow
\text{Free-Free}
\]

The product direction is **Kinetic Scientific Instrument**: a live engineering/scientific application in which motion, equations, matrices, graphs, and mode shapes remain visually and numerically connected.

---

## Runtime Target

This project is a **desktop application, not a website**.

Frozen V1 runtime direction:

```text
Tauri 2
└── Vite
    └── React
        └── TypeScript
```

Tauri provides the Windows desktop shell and native integration.  
The frontend is rendered locally inside the desktop application.

Core V1 functionality must work **offline**.

Do not introduce:

- Next.js,
- SSR,
- server routes,
- Vercel assumptions,
- browser-hosted deployment architecture,
- mandatory cloud services.

The final application must be buildable as a Windows executable / installer.

---

## Current Status

**Stage:** VISUAL EXPERIENCE R2 (desktop version 0.4.0), built on the validated Full Physics R1 foundation. The latest explicitly authorized scope extends the historical V1 learning path with forcing, FRF, base excitation, spectra, PSD and educational FE. See [R2 completion report](docs/VISUAL_EXPERIENCE_R2_REPORT.md), [R2 design](docs/VISUAL_EXPERIENCE_R2_DESIGN.md), [renderer decision](docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md) and [R2 file inventory](docs/VISUAL_EXPERIENCE_R2_FILES.md). Historical reports remain available.

**Validation:** 81 physics/numerical tests and 96 interaction/accessibility/visual tests pass. Independent NumPy/SciPy oracles cover generalized modes, complex FRFs, record spectra, PSD and FE. Native/build outcomes and measured performance are recorded in the [R2 completion report](docs/VISUAL_EXPERIENCE_R2_REPORT.md).

Windows development: `npm ci`, then `npm run desktop:dev`.
Windows packaging: `npm run desktop:build`. Artifacts are written to `artifacts/`.
Verification: `npm test`, `npm run test:ui`, `npm run typecheck`.

Phase 1 includes analytical undamped free response, SI controls, a draggable mass–spring system, synchronized displacement/energy/phase-space views, linked derivation, inspection and two guided experiments. Phase 2 adds viscous damping, coefficient/ratio authority, three regimes, true decay envelopes, dissipated energy, characteristic roots and two damping experiments. Select DAMPING in the learning trajectory. Phase 3 remains deferred.

Before writing production code, read all authoritative documents under [`docs/`](./docs/).

---

## Authoritative Specifications

1. [`docs/PRODUCT_SPEC_V1.md`](./docs/PRODUCT_SPEC_V1.md)  
   Defines **what the product does**: scope, physics, modules, equations, numerical behavior, validation, edge cases, and phase plan.

2. [`docs/VISUAL_MOTION_SPEC_V1.md`](./docs/VISUAL_MOTION_SPEC_V1.md)  
   Defines **how the product looks, moves, and responds**: visual system, animation architecture, interaction design, graph behavior, performance rules, accessibility, and UI acceptance criteria.

3. [`docs/ASTRA_SKILL_MATRIX_V1.md`](./docs/ASTRA_SKILL_MATRIX_V1.md)  
   Defines **which engineering/design competencies own which decisions** and how work should be routed and validated phase by phase.

4. [`docs/DESKTOP_RUNTIME_SPEC_V1.md`](./docs/DESKTOP_RUNTIME_SPEC_V1.md)  
   Defines the **Windows/Tauri runtime, packaging, offline, DPI, window lifecycle, and native-shell requirements**.

The repository-level [`AGENTS.md`](./AGENTS.md) defines implementation rules for coding agents.

A ready-to-use first implementation prompt is provided at:

[`docs/PHASE_0_IMPLEMENTATION_PROMPT.md`](./docs/PHASE_0_IMPLEMENTATION_PROMPT.md)

---

## Specification Precedence

If implementation choices conflict with the specifications:

1. Physics correctness and frozen V1 scope in `PRODUCT_SPEC_V1.md` take precedence.
2. `DESKTOP_RUNTIME_SPEC_V1.md` governs desktop runtime, packaging, lifecycle, offline behavior, and native integration.
3. `VISUAL_MOTION_SPEC_V1.md` governs interaction, visual, animation, accessibility, and performance behavior.
4. `ASTRA_SKILL_MATRIX_V1.md` governs implementation responsibility, verification flow, and quality gates.
5. `AGENTS.md` governs repository workflow.

If two specifications appear genuinely contradictory, do not silently choose one. Record the conflict and resolve it before implementation continues.

---

## Product Principles

> **Nothing moves without meaning.**

> **Nothing mathematical exists without a physical referent.**

The application must not become:

- a generic AI dashboard,
- a collection of disconnected cards,
- a static textbook,
- a decorative animation demo,
- a replacement for a production FEM solver,
- a web-first SaaS product.

The Physics Stage is the center of the experience.

---

## V1 Scope

V1 includes:

- Undamped SDOF
- Damped SDOF
- 2DOF coupled systems
- Eigenvalue/eigenvector derivation
- Mode shapes and normalization
- Simple modal superposition
- 3–10 DOF educational MDOF systems
- Free-free rigid-body modes
- 3D free-free six-DOF concept
- Graph scrubbing
- Freeze & Inspect
- Energy and phase-space lenses
- Equation ↔ geometry linking
- Animated matrix assembly
- A/B parameter comparison
- Responsive desktop-window behavior
- Keyboard-accessible interactions
- Numerical, interaction, visual, desktop-runtime, and performance validation

V1 explicitly excludes full FEM, ANSYS integration, harmonic response, FRF as a full module, random vibration, response spectrum, nonlinear systems, and complex/non-proportional modal analysis.

---

## Development Phases

- **Phase 0** — Desktop foundation / architecture / animation shell
- **Phase 1** — Undamped SDOF
- **Phase 2** — Damped SDOF
- **Phase 3** — 2DOF
- **Phase 4** — Mode Shape Lab
- **Phase 5** — MDOF
- **Phase 6** — Free-Free
- **Phase 7** — Validation & polish

Do not implement later phases early merely because they are convenient.

---

## Core Architecture Rule

\[
\boxed{
\text{Physics Engine}
\neq
\text{Animation Engine}
\neq
\text{UI State}
\neq
\text{Native Desktop Layer}
}
\]

Preferred flow:

```text
physics parameters
        ↓
derived physical solution
        ↓
single requestAnimationFrame simulation clock
        ↓
SVG / Canvas visual transforms
        ↓
Tauri desktop shell
```

The visualization layer must never invent physics.

---

## Desktop-Specific Requirements

V1 must support:

- Windows desktop execution,
- Tauri 2 shell,
- offline core functionality,
- production desktop build,
- window resize,
- Windows DPI scaling,
- multi-monitor movement without blurry Canvas rendering,
- minimize / restore lifecycle without runaway background animation,
- native-safe keyboard shortcuts,
- future-ready file-dialog / save-project architecture without requiring those features in V1.

The app should feel like a scientific desktop instrument, not a browser tab inside a wrapper.

---

## Performance Targets

- 60 FPS-class continuous interaction
- normal frame budget below ~16.7 ms
- input-to-visual latency below ~50 ms
- no duplicated `requestAnimationFrame` loops
- no progressive listener / memory leaks
- no full graph rebuild every animation frame
- stable behavior during rapid slider interaction
- stable window resizing
- correct behavior on high-refresh displays
- no unnecessary background CPU usage when minimized/inactive

---

## Repository Structure

```text
modal-dynamics-lab/
├── docs/
│   ├── PRODUCT_SPEC_V1.md
│   ├── VISUAL_MOTION_SPEC_V1.md
│   ├── ASTRA_SKILL_MATRIX_V1.md
│   ├── DESKTOP_RUNTIME_SPEC_V1.md
│   ├── PHASE_0_IMPLEMENTATION_PROMPT.md
│   └── README.md
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── physics/
│   ├── animation/
│   ├── visualization/
│   └── education/
│
├── src-tauri/
│   ├── src/
│   ├── icons/
│   └── capabilities/
│
├── tests/
├── public/
├── AGENTS.md
├── README.md
└── .gitignore
```

Framework-generated files such as `package.json`, `vite.config.ts`, `Cargo.toml`, and `tauri.conf.json` are created during Phase 0.

---

## Implementation Entry Point

Start with **Phase 0 only**.

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read all authoritative V1 specifications.
4. Read `docs/PHASE_0_IMPLEMENTATION_PROMPT.md`.
5. Audit the repository.
6. Produce a concise architecture plan.
7. Implement Phase 0.
8. Validate Phase 0 against its acceptance gate.
9. Historical Phase 0 stop point; the authorized Phase 2 increment is documented in docs/V2_REPORT.md.

---

## License

No license has been selected yet.


