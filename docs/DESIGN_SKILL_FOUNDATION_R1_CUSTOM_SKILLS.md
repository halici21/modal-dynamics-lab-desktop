# DESIGN SKILL FOUNDATION R1 — custom MDL skills

All six candidate custom skills named in the run's brief were built; the gap analysis below is why each was justified, checked against the public-skill inventory researched in this run before any of them was written. Each follows the progressive-disclosure method taught by the installed `skill-creator`: a concise `SKILL.md` (34-49 lines of body content, well under the ~500-line guideline) plus one `references/*.md` file for detail that does not need to load every time the skill triggers. No scripts were bundled with any of them — none of the six needs repeatable automation; they are judgment/architecture skills, not data-transform skills.

## mdl-cad-workbench

**Gap found**: no public skill in the eight researched repositories knows what a *non-generic* CAD/CAE information architecture looks like (Model Browser, Property Manager, feature tree, ViewCube, Learn/Explore/Inspect density). `frontend-design` teaches aesthetic restraint but not CAD-specific structure; `better-layout` reviews spacing/alignment mechanics but does not decide panel existence. Filled with a skill distilled from Shapr3D, Fusion 360, SolidWorks, Onshape, ANSYS Discovery, Altair Inspire, COMSOL, and Spline — what to borrow and what to deliberately not borrow from each, recorded in `references/CAD_REFERENCES.md`.

**Purpose**: sole domain authority for the *structure* of a CAD/CAE-like screen — which panels exist, where they live, and the three-level Learn/Explore/Inspect density ladder, matched to the project's already-implemented `LessonMode` values so pedagogy and IA describe one coherent ladder rather than two.

## mdl-live-mathematics

**Gap found**: this is the project's own stated signature product concept (physical object <-> force <-> equation term <-> matrix contribution <-> result), and it appears in no public design, accessibility, or Three.js skill anywhere in the research — it is not a generic UI pattern.

**Purpose**: owns the five-link chain end to end, grounded in what is already implemented (`PhysicalSelection` in `src/visualization/PhysicsStage.tsx`, the `data-token` FLIP-animation convention in `src/components/EquationDerivation.tsx`) rather than invented conventions, with a worked coupling-spring `k2` example and a Free-Free boundary-condition example in `references/LIVE_MATH_GRAMMAR.md`.

## mdl-threejs-scientific-viewport

**Gap found**: `threejs-core/camera/geometry/materials/lighting/performance` (alton47) teach correct generic Three.js technique, and `three-best-practices` (zebbern) reviews performance/memory hygiene, but none of them know MDL's specific architectural invariants: one authoritative `SimulationClock` (no second render loop), no physics engine (Rapier/Cannon-es) driving modal motion, a restrained (not free-orbit) camera, capped DPR, and DOM-based critical labels instead of 3D text. These invariants come directly from `AGENTS.md`'s architecture boundary and `docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md`'s renderer scoring, not from any public source.

**Purpose**: the architectural authority that sits above the generic Three.js skills and overrides them on conflict; `references/VIEWPORT_RULES.md` maps every invariant to its exact existing implementation line in `src/visualization/RendererStudy.tsx` and adds a GPU/WebView2 promotion checklist plus the selection-wiring work still missing before that prototype could become production.

## mdl-scientific-visualization

**Gap found**: no public skill anywhere addresses domain-specific FRF/PSD/response-spectrum/mode-shape/participation-factor visualization semantics, or the specific misconception risks this project has already catalogued (e.g. "FRF amplitude is a mode shape," "response spectrum equals PSD," "mode amplitude is actual displacement"). `better-colors` covers contrast/ramp mechanics but not what a color *means* physically.

**Purpose**: states the "3D for physical intuition, 2D for quantitative evidence" rule explicitly, names which evidence view is authoritative for which physical question, and owns the semantic half of color assignment (paired with `better-colors`'s mechanical half), grounded in the actual `--displacement`/`--velocity`/`--force`/`--energy`/`--mode-1`/`--mode-2` tokens already in `src/app/tokens.css` (reproduced with a hue-separation rule for new colors in `references/SCIENTIFIC_COLOR_SEMANTICS.md`).

## mdl-pedagogy

**Gap found**: no public skill teaches structural-dynamics-specific pedagogy. The project already has excellent internal material (`docs/PEDAGOGY_R1_LESSON_MODEL.md`'s eight-step grammar, `docs/PEDAGOGY_R1_MISCONCEPTIONS.md`'s eighteen-row misconception table, and a working `LearningPanel` implementation) that was simply never packaged as an invocable Agent Skill.

**Purpose**: makes the existing QUESTION/PREDICT/EXPERIMENT/OBSERVE/EXPLAIN/EQUATION/CHECK/CONTINUE grammar and Learn/Explore/Inspect depth model load automatically whenever lesson content is touched, explicitly treating the brief's own suggested phenomenon-first phrasing as a compatible restatement rather than authoring a second, competing grammar. `references/PEDAGOGY_PATTERNS.md` carries a working copy of the misconception table plus a seven-step lesson-writing checklist.

## mdl-visual-qa

**Gap found**: `better-interface` and `design-review` are excellent generic critique tools but know nothing about MDL's specific 13-workspace, 900x680/1440x900/maximized, dark/light/reduced-motion screenshot matrix (`docs/VISUAL_EXPERIENCE_R2_TEST_MATRIX.md`) or which of them to run when, so without a wrapper every visual change risks re-running every layer redundantly or, worse, skipping the project-specific matrix entirely in favor of whatever the generic skill happens to check.

**Purpose**: a thin, project-specific wrapper that states the exact matrix (extended with CAD-specific states for R3: Model Browser/Property Manager/Equation Dock density), sequences the review layers (automated tests first, then `better-interface` for multi-discipline changes, then `design-review` as an independent second opinion, full manual matrix only for shared-chrome or phase-completion work), and hard-codes the "generic-dashboard tendency test" as an explicit, mandatory check rather than an implicit hope that the other layers catch it. `references/QA_SCREENSHOT_MATRIX.md` documents the existing `tests/visual/` naming convention so new screenshots extend it instead of starting a parallel one.

## What was deliberately not built

No seventh custom skill was added beyond the six named in the brief. The gap analysis in step 2 of the brief's "additional skills search" (charts/data-viz, math/equation UX, information architecture, desktop app design, canvas/WebGL accessibility, visual regression, pedagogy, screenshot-based design-system extraction) is fully covered by the combination of the six custom skills above and the installed third-party set — nothing surfaced a missing domain that would justify a seventh.
