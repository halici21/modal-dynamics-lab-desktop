# CAD Experience R3 — Shell Design Decision (GATE 3 → GATE 4)

Three controlled shell prototypes were implemented as real React code
(`src/app/prototypes/ShellPrototypes.tsx`, reachable at `?r3=shell-a|shell-b|shell-c`
during the prototype phase), not as mockup images. All three rendered the
**same** 2DOF chain solved by the frozen physics engine
(`chain → solveModal → modalResponse`) and animated by the **same**
`SimulationClock` the production app uses, so the comparison isolates
information architecture from physics and from renderer technology.

Screenshots: `docs/validation/cad-experience-r3/screenshots/prototypes/`
(9 frames: 3 shells × 1440×900, 1100×760, 900×680).

## 1. What each prototype was

| | Concept | Shape |
|---|---|---|
| **A** | Shapr3D-heavy minimalist | Full-bleed viewport. Model tree behind an "Items" anchor as a floating overlay. Properties as a floating card. Mathematics behind a button that opens a bottom sheet. Transport floating at the foot. |
| **B** | Fusion/SolidWorks-heavy CAE | Six-group command ribbon, permanent 236 px model browser, permanent 268 px property manager with matrices, permanent 226 px dock with all twelve analysis tabs, status bar. |
| **C** | Modal Dynamics Studio hybrid | Quiet studio bar, compact persistent model browser, dominant viewport carrying its own contextual tool strip / view controls / transport, contextual property manager that appears with selection, first-class equation-and-analysis dock showing only relevant tabs. |

## 2. Objective measurements

Measured with `scripts/measure-shells.mjs` (Playwright, real layout boxes — not
estimates). "Viewport %" is the stage container's area as a fraction of the
window. The brief's target is **55–70 % at ~1440 px**.

| Shell | Size | Viewport % | Stage px | Visible controls | Page overflow | Clipped strips |
|---|---|---|---|---|---|---|
| A | 1440×900 | 100.0 | 1440×900 | 5 | no | 0 |
| A | 1100×760 | 100.0 | 1100×760 | 5 | no | 0 |
| A | 900×680 | 100.0 | 900×680 | 5 | no | 0 |
| B | 1440×900 | **42.0** | 936×582 | **48** | no | 1 |
| B | 1100×760 | **35.3** | 668×442 | 48 | no | 2 |
| B | 900×680 | **27.6** | 468×362 | 48 | no | 2 |
| C | 1440×900 | **60.6** | 1216×646 | 26 | no | 0 |
| C | 1100×760 | 53.0 | 876×506 | 26 | no | 0 |
| C | 900×680 | 47.0 | 676×426 | 26 | no | 0 |

Second pass for C **with a selection active** (property manager occupying
layout):

| Shell | Size | Viewport % | Stage px |
|---|---|---|---|
| C + selection | 1440×900 | **47.4** | 952×646 |
| C + selection | 1100×760 | 54.7 | 904×506 |
| C + selection | 900×680 | 48.9 | 704×426 |

Reading: A over-shoots dominance into exclusivity (nothing else is ever on
screen); B fails the target at every size and clips its own ribbon below
1440 px; C is the only shell inside the target band at the reference width —
**but only while the property manager is closed.** That is a real, measured
defect, carried forward as production constraint **PC-1** below.

## 3. Scores

Eleven criteria from the brief, 0–5 each, scored against the captured frames
and the measurements above.

| Criterion | A | B | C | Evidence |
|---|---|---|---|---|
| Viewport dominance | 3 | 1 | 4 | A = 100 % (exclusivity, not dominance); B = 27.6–42 %, below target everywhere; C = 60.6 % default, 47.4 % with properties open |
| Clutter | 5 | 1 | 4 | Visible-control count 5 / 48 / 26; B shows all twelve dock tabs regardless of workspace |
| CAD familiarity | 2 | 5 | 4 | All eight reference products keep a tree visible when there is room; A hides it in a transient overlay |
| Modernity | 5 | 2 | 4 | B's ribbon reads as legacy CAD chrome; A and C read current |
| Learning suitability | 2 | 1 | 4 | A gives a beginner no visible starting point; B opens at SolidWorks density, which `mdl-cad-workbench` explicitly refuses |
| Mathematics discoverability | 1 | 3 | 5 | A puts the derivation two interactions deep behind a sheet — this *is* R3 problem #1; B has a dock but buries Equations among twelve peers; C makes Equations the first tab of an always-present dock |
| MDOF scalability | 2 | 4 | 4 | A 10-DOF tree inside a floating overlay is unusable; B and C both have a persistent scrolling tree |
| FEM scalability | 1 | 4 | 4 | Nodes / elements / material / section / constraints cannot live in a transient overlay |
| Minimum-window (900×680) | 4 | 1 | 3 | B clips 2 strips and drops to a 468×362 stage; C keeps 676×426 with no clipping but its property overlay occludes the second mass (defect **PC-2**) |
| Accessibility | 2 | 3 | 4 | A's tree is not persistently reachable; B is all real DOM but the tab order runs through 48 controls before the model; C keeps `role="tree"`/`treeitem` persistent with a short path to the model |
| Maintainability | 4 | 2 | 4 | B carries ribbon + two panes + dock + status bar; A and C carry less chrome |
| **Total (/55)** | **31** | **27** | **44** | |

## 4. Decision

**Shell C — the Modal Dynamics Studio hybrid — is selected.**

It is the only prototype that satisfies the reference grammar derived in
`CAD_EXPERIENCE_R3_REFERENCE_STUDY.md` §4 simultaneously: viewport dominant
(R1), tree persistent and semantic (R2), one selection across surfaces (R3),
mathematics as a first-class region rather than a lens (R4), contextual
commands over a stationary core (R5).

The expected winner was C, and the prototypes confirmed rather than
rubber-stamped it: they produced two concrete defects that would otherwise have
shipped, and they falsified the intuition that "more minimal is better" (A
scored best on clutter and worst on the thing R3 exists to fix).

What each loser contributes to the winner:

- **From A**: the transport belongs *inside* the viewport, not in a separate
  strip; panel toggles belong at fixed anchors; a default screen should carry
  very few permanent controls.
- **From B**: the tree, the property manager and the dock must all be *real*
  persistent regions; a status line stating DOF count / boundary / damping
  class / residual is genuinely useful and costs one row.

## 5. Production constraints carried out of the prototype phase

These are binding on the GATE 5–17 implementation:

- **PC-1 — Dominance must survive a selection.** At 1440×900 with the property
  manager populated, the viewport must still reach ≥55 % of window area.
  Prototype C reached only 47.4 %. Production budget: studio bar 40 px, model
  browser 196 px, property manager 216 px, analysis dock 156 px default →
  1028×704 = **55.8 %**, and ~68 % with the property manager closed and the
  dock collapsed to its tab strip. The dock is user-resizable in both
  directions from there, so a user may still choose to give the mathematics
  most of the screen.
- **PC-2 — A narrow-width property overlay must not occlude the model.** At
  900×680, prototype C's overlay drawer covered the second mass. Production
  must either inset the model within the remaining width or dim-and-offset the
  drawer, never let it sit over live geometry.
- **PC-3 — Dock tabs are filtered per workspace.** B's twelve-tab strip is the
  anti-pattern; only tabs the active study can actually populate are rendered.
- **PC-4 — No horizontal page overflow at 900×680.** All three prototypes
  passed this; B only passed it by internally clipping its ribbon, which is not
  an acceptable production behaviour.
- **PC-5 — The model tree is never a transient overlay at desktop widths.**

## 6. Disposal of rejected paths

Per the brief, rejected shell runtime paths are removed after the decision.
`src/app/prototypes/` (all three shells, A and B included, plus C which is
superseded by the production implementation) and its `?r3=` entry point are
deleted in the GATE 5 commit. The screenshots, the measurements above, and this
document remain as the record. Commit `972ed6a` is the last commit in which the
prototypes are runnable.
