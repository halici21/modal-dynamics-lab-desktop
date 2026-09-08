---
name: mdl-visual-qa
description: Project-specific visual QA gate for Modal Dynamics Lab / Modal Dynamics Studio — the exact screen, size, theme, and state matrix to capture and review (13 workspaces, dark/light, 900x680 minimum, 1440x900 default, maximized, reduced motion, Model Browser/Property Manager/Equation Dock states, selection state, playback state). Use before marking any visual change complete, and always before a phase-completion report per AGENTS.md section 19. Wraps and sequences better-interface and design-review rather than duplicating their rules — this skill decides WHAT to capture and WHEN each reviewer runs, not how to judge typography, color, or accessibility.
---

# MDL Visual QA

This skill does not re-derive typography, color, accessibility, or UI-polish rules — those belong to `better-typography`, `better-colors`, `better-accessibility`, `better-ui`, and `better-layout` respectively, orchestrated by `better-interface`. This skill's job is narrower and project-specific: know exactly which screens, sizes, and states matter for Modal Dynamics Lab, and sequence the review layers so they do not redundantly re-litigate the same finding three times.

## The screenshot matrix (source: docs/VISUAL_EXPERIENCE_R2_TEST_MATRIX.md)

Reuse this matrix; do not invent a different one per change.

- **Sizes**: 900x680 (minimum window), 1440x900 (default), maximized.
- **Themes**: dark and light, checked for parity (not just "does light mode exist" but "does the same information hierarchy survive the theme swap").
- **Motion**: normal and `prefers-reduced-motion: reduce` — reduced motion must preserve educational meaning (`AGENTS.md` section 14), not just remove animation.
- **Workspaces**: all thirteen (SDOF, damping, forcing/FRF, mode 1/2/3, N=10 MDOF, base excitation, participation, Free-Free rigid modes, spectrum, PSD, bar/beam/frame FEM) plus any CAD Experience R3 workbench screens added later.
- **States**: dock/deck collapsed and expanded, inspector collapsed, rail collapsed/expanded, freeze/inspect engaged, resize during playback, minimize/restore, offline packaged Tauri build (not just the Vite dev server).
- **CAD-specific additions for R3** (extend the matrix, do not replace it): Model Browser collapsed/expanded, Property Manager empty-selection and populated-selection states, Equation Dock collapsed/expanded, and each Learn/Explore/Inspect density level per `mdl-cad-workbench`.

## Sequencing the review layers

Run in this order, and stop escalating once a layer's verdict is clean — do not run every layer on every trivial change:

1. **Project test suite first.** `npm test`, `npm run test:ui`, `npm run typecheck` — per `docs/VISUAL_EXPERIENCE_R2_TEST_MATRIX.md`'s own acceptance interpretation: "Visual changes never weaken numerical tolerances," and a screenshot is only accepted when labels, focus, semantic stage state, and physical values agree. Automated checks here are the fast, cheap layer; visual review is for what they cannot catch.
2. **better-interface** for anything that touched more than one file or more than one discipline (layout + color, or typography + accessibility) — it consolidates a single ranked verdict across the six `better-*` domains rather than requiring six separate passes.
3. **design-review** (humbleteam) as an independent second opinion, run separately rather than chained to `better-interface`, specifically for the 0-4 scored judgment call ("is this screen actually good") that a rules-based domain audit does not directly answer. Use it especially before a phase-completion report, since `AGENTS.md` section 19 requires a phase verdict of PASS / PASS WITH NOTES / BLOCKED and a scored second opinion sharpens that call.
4. Only escalate to a full manual pass across the entire matrix above for a phase-completion report or a change that touches shared chrome (tokens, the workbench shell, the rail/dock/deck system) that could ripple across all thirteen workspaces at once. A change scoped to one workspace's content does not need all thirteen screenshots re-captured.

## The generic-dashboard tendency test

Before accepting any redesign proposal, run this check explicitly (this is the eval this skill exists to guarantee gets asked): would the proposal produce card grids, a giant top nav bar, a generic shadcn-style shell, or hide the Physics Stage/viewport behind a "feature" abstraction? If yes, it fails regardless of how clean the typography or spacing scores — `AGENTS.md`'s explicit list ("a generic AI dashboard... a collection of disconnected cards... a decorative animation demo") is a harder constraint than any individual `better-*` domain finding.

## Gate

A visual change is not complete until:

- The relevant subset of the screenshot matrix has been captured and actually inspected (not merely generated).
- `better-interface` or `design-review` (or both, per the sequencing above) has produced a verdict, and any `HIGH`/blocker finding is resolved or explicitly deferred with a reason.
- The generic-dashboard tendency test has been asked and answered, not assumed.
- Reduced motion was checked, not only the default motion state.
- The change was checked at 900x680, not only at the comfortable 1440x900 default.

See `references/QA_SCREENSHOT_MATRIX.md` for the full state list and existing screenshot naming convention already used under `tests/visual/`.
