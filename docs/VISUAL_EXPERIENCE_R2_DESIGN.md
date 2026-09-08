# VISUAL EXPERIENCE R2 — design

## Information architecture

The application keeps the thirteen validated workspaces and presents them as six conceptual groups: FOUNDATIONS (Undamped, Damped, Forced SDOF), MULTI-DOF (2DOF, 3DOF, MDOF, Modes), FREQUENCY (FRF, Base), MODAL (Participation, Free-Free), SPECTRA (Response Spectrum, Random), and STRUCTURES (FEM). The header selector remains a direct switch for keyboard and expert use. The rail is the learning sequence and the selector is direct access; neither behaves like a web-page route.

## Workbench anatomy

The shell is a quiet desktop chrome around one large Physics Workspace. The Lab Rail is 60px collapsed and 208px expanded. The Parameter Dock is bounded at 250–310px and collapses below 1100px. The workspace owns the stage, lens toolbar and transport. The Context Inspector is a nonmodal overlay opened by Inspect or object selection. The Analysis Deck is a vertical resizable panel with collapse and independent visibility subscriptions.

## Stage architecture

The production stage is SVG-first. It keeps exact physical geometry, semantic SVG roles, crisp labels at DPR 1–2 and no WebGL requirement. A renderer boundary is documented in `src/visualization/RendererStudy.tsx`; the Three.js 2.5D and spatial prototypes receive the same `modalResponse` state and clock. This lets a future flagship stage add depth without coupling physics to a renderer.

## Visual language

Segoe UI Variable is used for interface text; Cascadia Code is reserved for dense numeric values. Surfaces are opaque graphite and warm paper-light. Borders are one-pixel quiet separators. Radius is 3–8px; shadows are reserved for the inspector and stage depth. The stage uses a restrained radial field and graph grid to give spatial hierarchy without a decorative glow.

Semantic physics colors are fixed: cyan displacement, violet velocity, orange force, green energy, neutral mass, cool grey structure, and focus blue. Every color has a label, outline or line-style companion so meaning does not depend on hue alone.

## Interaction

Direct mass/coordinate selection, mode selection, matrix inspection, response scrubbing and pane resizing remain keyboardable. Module changes interrupt transition state. The clock remains the only continuous time authority. All UI motion is 140–220ms; educational transitions are 250–450ms; no easing is applied to physical position.

## Responsive behavior

At 900×680 the rail remains compact, the parameter dock collapses, and the stage/transport survive. The inspector becomes an overlay and the analysis deck can collapse. At large windows the stage gains scale and the deck gains detail instead of stretching line lengths. SVG remains resolution-independent; Three.js prototypes cap DPR at 2.

## Accessibility and reduced motion

The rail, prototype selector, stage objects and controls have semantic names and visible focus. Reduced motion removes cinematic assembly and decorative stage field variation while preserving static mode shape, exact scrubbing, Step and inspector relationships. Three.js objects always have equivalent text notes and the final workspaces retain accessible lists.

## Module patterns

SDOF foregrounds support–spring–mass and a single lens at a time. Damping introduces the dashpot as a relationship. Forced and FRF modules pair actuator/force semantics with response evidence. Multi-DOF uses one generic node renderer and selected mode. Free-Free removes supports before showing rigid-body basis text. Spectrum and PSD remain separate analysis families. FEM follows element → local matrix → assembly → constraints → global mode and uses the existing Hermite/interpolated stage.
