# GPT-6 Astra — Phase 0 Implementation Prompt

You are starting implementation of **Modal Dynamics Lab**, a local-first Windows desktop application for learning modal analysis.

The repository already contains authoritative project specifications.

Before writing any code, read completely:

1. `README.md`
2. `AGENTS.md`
3. `docs/PRODUCT_SPEC_V1.md`
4. `docs/DESKTOP_RUNTIME_SPEC_V1.md`
5. `docs/VISUAL_MOTION_SPEC_V1.md`
6. `docs/ASTRA_SKILL_MATRIX_V1.md`

Treat them as authoritative.

Do not skim them and do not implement from this prompt alone.

Your task in this run is **PHASE 0 ONLY**.

Do not begin Phase 1 or implement the real Undamped SDOF physics module yet.

---

# Runtime Lock

This is a **Windows desktop application, not a website**.

Use:

```text
Tauri 2 + Vite + React + TypeScript
```

Do not use:
- Next.js,
- SSR,
- server-side routes,
- Vercel assumptions,
- hosted SaaS architecture,
- mandatory cloud services.

Core V1 functionality must work offline.

The Phase 0 result must run inside the Tauri desktop shell and must be buildable as a production desktop application.

---

# PHASE 0 — FOUNDATION

The purpose of Phase 0 is to establish the technical, desktop-runtime, visual, motion, interaction, accessibility, and performance foundation on which later physics modules will be built.

## 1. Repository Audit and Setup

- Audit the repository and all specs.
- Initialize the Tauri 2 + Vite + React + TypeScript application.
- Keep the project architecture consistent with the documented responsibility boundaries.
- Do not prematurely implement later-phase physics.

## 2. Architecture

Maintain clear separation between:

- physics,
- animation,
- visualization,
- UI/application state,
- education/content,
- Tauri/native desktop layer.

The native Rust layer should remain minimal in V1.

Do not move trivial low-DOF numerical calculations into Rust without a demonstrated reason.

## 3. Application Shell

Create the initial Modal Dynamics Lab shell establishing:

- Kinetic Scientific Instrument visual direction,
- learning trajectory:
  `SDOF → Damping → 2DOF → Modes → MDOF → Free-Free`,
- dominant Physics Stage,
- parameter/control region,
- theory/result region,
- response/plot region.

This is an architectural shell, not six finished pages.

Avoid generic AI/SaaS dashboard aesthetics exactly as defined in the visual specification.

## 4. Desktop Window Foundation

Establish and validate:

- default window size,
- minimum usable window size,
- resizable layout,
- maximized behavior,
- stable Windows title/window behavior,
- common DPI scaling readiness,
- high-DPI visualization handling,
- offline operation.

Custom title bar is optional and should not be attempted if it risks native window behavior.

## 5. Design System Foundation

Create reusable tokens for:

- typography,
- spacing,
- surfaces,
- borders,
- radius,
- semantic colors,
- physics quantity colors,
- light/dark appearance,
- focus states,
- interface motion,
- educational motion.

Do not scatter arbitrary one-off style values.

## 6. Core Reusable Components

Build only Phase 0 primitives needed now, such as:

- `LearningTrajectory`
- `PhysicsStage`
- `ParameterSlider`
- `NumericField`
- `PlaybackBar`
- `ConceptLensSwitcher` shell
- `StatusReadout`

Do not prebuild every future component.

## 7. Single Simulation Clock

Implement one authoritative animation timing system.

Hard requirements:

- `requestAnimationFrame` driven,
- elapsed-time based using `performance.now()` or equivalent,
- not frame-count based,
- play,
- pause,
- reset,
- step,
- playback rate,
- API ready for scrubbing,
- correct cleanup,
- no duplicate RAF loops,
- no per-frame React `setState()` for continuous visual motion.

Separate semantic application state from transient animation state.

## 8. Physics Stage Animation Skeleton

Create a minimal neutral visual used only to validate the architecture.

It may use a generic oscillator-like placeholder, but it must **not** become the real Phase 1 SDOF implementation.

Purpose:

```text
simulation clock
→ visual transform
→ playback controls
→ synchronized state
```

Do not introduce unvalidated production physics formulas in Phase 0.

## 9. Slider / Input Architecture

`ParameterSlider` must support:

- smooth pointer interaction,
- keyboard control,
- numeric feedback,
- stable layout,
- direct numeric entry where appropriate,
- engineering-unit readiness,
- coalesced updates,
- no unnecessary full-tree rerenders.

Target:

\[
\text{input-to-visual latency}<50\text{ ms}
\]

under normal Phase 0 conditions.

## 10. Motion System

Establish three categories:

### A. Physics motion
No UI easing.

### B. Interface motion
Fast, subtle transitions.

### C. Educational motion
Slightly slower transitions for comprehension.

Create shared motion tokens/utilities.

## 11. Performance Diagnostics

Development-only diagnostics should expose enough to observe:

- FPS,
- recent/average frame time,
- active animation-loop count,
- playback state,
- optional placeholder timing hooks for future solver duration.

Do not implement a real eigensolver in Phase 0.

Targets:

- 60 FPS-class experience,
- normal frame budget ~<16.7 ms,
- no progressively increasing CPU usage,
- no duplicate RAF loops.

## 12. Desktop Lifecycle

Verify:

- repeated play/pause does not create extra loops,
- window/module changes clean up correctly,
- minimize/inactive state does not waste unnecessary continuous work,
- restore does not duplicate the simulation clock,
- resize remains stable.

## 13. DPI / Rendering

Prepare for:

- 100%, 125%, 150%, 200% Windows scaling,
- high-DPI Canvas where Canvas is used,
- SVG crispness,
- high-refresh displays,
- multi-monitor scale changes where practical.

Do not assume exactly 60 Hz.

## 14. Accessibility

Implement:

- keyboard-operable controls,
- focus-visible,
- adequate contrast,
- reduced-motion support,
- touch-friendly hit targets where practical,
- no essential hover-only information.

Reduced-motion mode must still show a meaningful static Physics Stage.

## 15. Offline Requirement

Phase 0 shell must work without runtime network access.

Do not require CDN-hosted:
- fonts,
- scripts,
- equation rendering,
- icons,
- visualization assets.

## 16. Tauri Capability Discipline

Use least privilege.

Do not enable broad:
- filesystem,
- shell,
- network,
- system access

unless a Phase 0 requirement explicitly needs it.

## 17. Testing

Add meaningful Phase 0 tests for at least:

- simulation clock start/pause/resume/reset,
- playback rate,
- cleanup / duplicate-loop prevention,
- basic control interaction,
- reduced-motion behavior where practical,
- Tauri/frontend build integration,
- offline shell assumptions where practical.

Do not add fake tests that only mirror implementation details.

---

# BEFORE IMPLEMENTING

First produce a concise but concrete Phase 0 plan containing:

1. repository audit,
2. final stack confirmation,
3. directory/module architecture,
4. state ownership map,
5. simulation-clock design,
6. rendering strategy,
7. Tauri/native boundary,
8. component plan,
9. testing strategy,
10. performance strategy,
11. desktop/DPI/lifecycle strategy,
12. risks or real spec conflicts.

If an actual contradiction exists between specification files, stop and report it.

Do not invent a conflict where there is none.

Once the plan is coherent, proceed with Phase 0 implementation without waiting for additional approval.

---

# PHASE 0 ACCEPTANCE GATE

Phase 0 is PASS only if:

- project builds,
- type checking passes,
- tests pass,
- Tauri development application launches,
- production desktop build succeeds,
- application works as a desktop app rather than relying on a browser,
- core shell works offline,
- Physics Stage is visually dominant,
- Kinetic Scientific Instrument direction is visible,
- UI does not resemble a generic AI dashboard,
- window resize remains stable,
- DPI/high-DPI rendering is usable,
- slider interaction is smooth,
- playback controls work,
- one authoritative simulation clock exists,
- continuous animation does not use React state every frame,
- no duplicate RAF loops exist,
- cleanup works,
- minimize/restore lifecycle does not duplicate animation work,
- reduced-motion behavior works,
- performance diagnostics remain stable,
- no real Phase 1 SDOF implementation has been prematurely added.

---

# FINAL REPORT

Stop at the end of Phase 0 and provide:

## PHASE 0 VERDICT
`PASS` / `PASS WITH NOTES` / `BLOCKED`

## 1. What was implemented

## 2. Architecture created

## 3. Desktop/Tauri setup

## 4. Files created/modified

## 5. Tests run and results

## 6. Production desktop build result

## 7. Performance observations

## 8. Window / DPI / lifecycle checks

## 9. Visual / accessibility checks

## 10. Known limitations

## 11. Spec deviations, if any

## 12. Readiness for Phase 1

Do **not** automatically start Phase 1.
