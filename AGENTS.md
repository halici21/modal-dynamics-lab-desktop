# AGENTS.md — Modal Dynamics Lab

Repository-level rules for coding agents.

These rules are mandatory unless the user explicitly changes them.

---

## 1. Product Type

This is a **Windows desktop application**.

It is not a website and must not be architected as one.

Frozen V1 runtime:

```text
Tauri 2 + Vite + React + TypeScript
```

Do not introduce Next.js, SSR, Vercel deployment assumptions, mandatory backend services, or browser-hosted product architecture.

Core V1 functionality must work offline.

---

## 2. Read Before Coding

Read completely:

1. `docs/PRODUCT_SPEC_V1.md`
2. `docs/VISUAL_MOTION_SPEC_V1.md`
3. `docs/ASTRA_SKILL_MATRIX_V1.md`
4. `docs/DESKTOP_RUNTIME_SPEC_V1.md`

For Phase 0 also read:

5. `docs/PHASE_0_IMPLEMENTATION_PROMPT.md`

Do not implement from README summaries alone.

---

## 3. Frozen V1 Scope

```text
Undamped SDOF
→ Damped SDOF
→ 2DOF
→ Mode Shapes
→ MDOF
→ Free-Free
```

Do not silently add harmonic response, FRF modules, random vibration, response spectrum, full FEM, ANSYS import, nonlinear analysis, complex modes, cloud features, or unrelated AI features.

---

## 4. Phase Discipline

Work only on the explicitly requested phase.

```text
Phase 0 — Desktop Foundation
Phase 1 — Undamped SDOF
Phase 2 — Damped SDOF
Phase 3 — 2DOF
Phase 4 — Mode Shape Lab
Phase 5 — MDOF
Phase 6 — Free-Free
Phase 7 — Validation & Polish
```

At the end of each phase:
- run tests,
- verify acceptance criteria,
- report files changed,
- report known limitations,
- report measured performance where applicable,
- stop unless explicitly told to continue.

---

## 5. Core Architecture Boundary

Maintain:

```text
physics
animation
visualization
UI/application state
desktop/native layer
```

as separate responsibilities.

### Physics engine
Owns equations, analytical solutions, matrices, eigensolutions, normalization, residuals, validation.

Must not own DOM, CSS, pixels, easing, Tauri APIs.

### Animation engine
Owns simulation clock, playback rate, pause/resume, scrubbing synchronization, per-frame render values, cleanup.

Must not invent physics.

### UI layer
Owns semantic app state, controls, selection, layout, accessibility, theme, inspection state.

Must not push transient 60 FPS values through React state.

### Native/Tauri layer
Owns desktop shell and native capabilities.

Keep it minimal in V1. Do not move tiny V1 numerical calculations into Rust without a demonstrated need.

---

## 6. Desktop Runtime Rules

- Tauri 2 is the native shell.
- Vite + React + TypeScript is the frontend.
- Core functionality is offline.
- The production desktop build must succeed.
- Window resizing must remain stable.
- DPI scaling must be validated.
- Canvas must account for `devicePixelRatio`.
- Minimize/inactive states must not waste significant CPU.
- Native APIs must be exposed through narrow, explicit boundaries.
- Do not grant broad Tauri capabilities without need.

---

## 7. Physics Correctness

Displayed formulas and computed values must come from the same model.

Important V1 identities:

\[
m\ddot{x}+kx=0
\]

\[
m\ddot{x}+c\dot{x}+kx=0
\]

\[
M\ddot{x}+Kx=0
\]

\[
K\phi_i=\omega_i^2M\phi_i
\]

\[
f_i=\frac{\omega_i}{2\pi}
\]

For free-free rigid-body modes:

\[
K\phi_{RB}=0
\]

thus:

\[
f_{RB}\approx0
\]

---

## 8. Numerical Verification

For modal results verify:

\[
r_i=K\phi_i-\omega_i^2M\phi_i
\]

Handle:
- zero modes,
- repeated modes,
- near-degenerate modes,
- singular stiffness,
- invalid mass matrices,
- mode-order swaps.

Remember:

\[
\phi_i
\]

and

\[
-\phi_i
\]

are the same physical mode.

---

## 9. Animation Rules

Use one authoritative simulation time based on elapsed time such as `performance.now()`.

Do not assume 60 Hz.

Synchronize:
- stage,
- spring/damper,
- vectors,
- graph cursor,
- phase-space cursor,
- energy views.

Physics motion never uses decorative UI easing.

---

## 10. Cleanup / Lifecycle

User input always wins.

Never allow:
- duplicate RAF loops,
- stacked timers,
- stale animation callbacks,
- accumulating listeners,
- delayed snap after new interaction.

When the app is minimized or inactive, pause or throttle continuous nonessential animation work appropriately.

---

## 11. Performance

Targets:
- 60 FPS-class experience,
- ~16.7 ms normal frame budget,
- <50 ms input-to-visual latency.

Profile:
- slider drag,
- graph scrub,
- rapid mode switching,
- repeated pause/resume,
- 10DOF animation,
- window resize,
- DPI/multi-monitor scenarios,
- minimize/restore lifecycle.

---

## 12. Visual Direction

Identity:

**Kinetic Scientific Instrument**

Avoid generic AI/SaaS aesthetics:
- card grids,
- glassmorphism,
- purple/blue AI gradients,
- neon glows,
- decorative motion,
- generic chat surfaces.

The Physics Stage is dominant.

---

## 13. Educational Rule

Prefer:

```text
show phenomenon
→ manipulate it
→ reveal relationship
→ derive mathematics
→ generalize
```

Every major mathematical object should have a physical referent.

---

## 14. Accessibility

Support:
- keyboard navigation,
- focus-visible,
- reduced motion,
- adequate contrast,
- touch-capable Windows devices where practical,
- non-color-only encoding.

Reduced motion must preserve educational meaning.

---

## 15. Input Safety

Validate inputs. Never show NaN, Infinity, undefined, or broken plots.

Explain invalid physics when possible.

---

## 16. Testing

Each phase requires:
- physics tests,
- numerical tests where relevant,
- interaction tests,
- animation lifecycle tests,
- desktop runtime/build checks,
- accessibility checks,
- performance checks,
- visual regression for major states.

Do not weaken tests merely to pass.

---

## 17. Documentation

Document:
- assumptions,
- normalization,
- tolerances,
- solver choices,
- mode tracking,
- performance decisions,
- native capability choices,
- known limitations.

---

## 18. Conflict Handling

If specs conflict:
1. identify the conflict,
2. do not silently guess,
3. preserve physics correctness,
4. preserve frozen scope,
5. preserve desktop runtime requirements,
6. report before destructive architectural changes.

---

## 19. Completion Report

Return:

### Phase verdict
`PASS`, `PASS WITH NOTES`, or `BLOCKED`

### What was implemented

### Architecture

### Files changed

### Validation
- tests,
- numerical checks,
- interaction checks,
- desktop build,
- performance observations.

### Known limitations

### Spec deviations

### Next-phase readiness

Do not automatically begin the next phase.
