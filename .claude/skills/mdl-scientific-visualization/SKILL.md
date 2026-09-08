---
name: mdl-scientific-visualization
description: Owns which plot or lens is authoritative evidence for a physical quantity in Modal Dynamics Lab — displacement response, phase space, energy, FRF, spectrum, PSD, effective modal mass/participation, and mode-shape or FEM deformation plots. Use when adding, redesigning, or reviewing any 2D scientific evidence view, when deciding whether a 3D view or a 2D plot should answer a given question, or when assigning color to a physical quantity. Not for the viewport's rendering technique (mdl-threejs-scientific-viewport) or the object-to-equation link (mdl-live-mathematics).
---

# MDL Scientific Visualization

## The core rule

**3D is for physical intuition. 2D is for quantitative evidence.** A 3D or SVG-stage view answers "what is moving and how" at a glance; it is never the place a user reads an exact natural frequency, a damping ratio, or a modal participation factor off a screen. When a redesign proposal puts a numeric claim only inside the 3D/geometry view with no corresponding 2D evidence, that is a defect, not an efficiency.

This mirrors `AGENTS.md` section 8 ("Scientific Visualization... visual encoding must correspond to physical meaning... no decorative chart element that can be mistaken for physical data") and extends it with an explicit 3D/2D division of labor for the CAD Experience R3 viewport work.

## Owned evidence views and what each is authoritative for

- **Displacement response** (time history): the ground truth for "where is the system right now and where has it been." Authoritative over any inferred reading from the stage's instantaneous pose.
- **Phase space** (velocity vs. displacement): authoritative for energy-state and stability questions (spiral toward origin = decaying energy; closed loop = undamped conservative motion) — this is what makes damping regimes visually distinguishable beyond "it looks slower."
- **Energy views** (kinetic/potential/total/dissipated): authoritative for "where did the energy go," directly supporting the damping module's dissipated-energy requirement in `PRODUCT_SPEC_V1.md`.
- **FRF (frequency response function)**: authoritative for "how does the system respond across a frequency sweep," including complex magnitude/phase — never confuse an FRF peak location with a mode shape; the misconception map in `docs/PEDAGOGY_R1_MISCONCEPTIONS.md` explicitly flags "FRF amplitude is a mode shape" as a defect to design against.
- **Spectrum / PSD**: two distinct, separately authoritative views (`src/physics/spectra.ts` implements both an elastic response spectrum and PSD/variance integration) — a response spectrum's maxima and a PSD's density/RMS answer different questions and must never share one plot or one legend as if interchangeable, per the same misconception map ("Response spectrum equals PSD").
- **Effective modal mass / participation**: authoritative for "how much does this mode actually matter for this input direction" — must show the participation factor and cumulative modal mass, not just rank modes by frequency.
- **Mode-shape and FEM deformation plots**: authoritative for relative pattern and sign, explicitly *not* for absolute physical displacement (`AGENTS.md` section 8: "phi_i and -phi_i are the same physical mode"; misconception map: "Mode amplitude is actual displacement" and "FEM display is actual response amplitude"). Any mode-shape or FEM view must carry a visible normalization/scale disclosure, not an implied absolute scale.

## Color semantics are physical, not decorative

`src/app/tokens.css` already assigns physical meaning to color: `--displacement`, `--velocity`, `--force`, `--energy`, `--mode-1`, `--mode-2`. This skill is the authority on what a color *means*; `better-colors` (installed as a third-party skill) is the authority on contrast mechanics and ramp construction. Concretely:

- A color assigned to a physical quantity keeps that meaning across every view it appears in (displacement is always the same hue in the response plot, the phase-space plot, and the stage) — this is `better-colors`'s own "one color, one meaning" rule, applied here to physics instead of UI state.
- `better-colors` may fix a contrast failure or rebuild a ramp's lightness steps; it may not silently repurpose `--force` orange for a UI-only accent, or introduce a new physical-quantity color without checking it is at least 15 degrees of hue away from every existing physical-quantity color (`--mode-1` and `--mode-2` already demonstrate this separation).
- See `references/SCIENTIFIC_COLOR_SEMANTICS.md` for the full token-to-quantity map and the rule for assigning a color to a new quantity (e.g. a future FEM stress field) without colliding with an existing one.

## Gate

Before approving a scientific-visualization change:

- Every numeric claim visible anywhere in the UI traces to a 2D evidence view, not only an inferred 3D pose.
- Mode-shape/FEM views disclose their normalization/scale explicitly.
- FRF, spectrum, and PSD remain three distinct views/legends even when displayed adjacently.
- Every color used for a physical quantity matches its token in `tokens.css`; a new physical color is checked against `references/SCIENTIFIC_COLOR_SEMANTICS.md` before being added.
- No plot element is decorative — everything with a visual encoding must resolve to a value the physics engine actually computed.
