# DESIGN SKILL FOUNDATION R1 — ownership hierarchy

This hierarchy was derived from the research in `DESIGN_SKILL_FOUNDATION_R1_RESEARCH.md`, not assumed beforehand. It is layered on top of — and must never contradict — the project's own pre-existing `docs/ASTRA_SKILL_MATRIX_V1.md`, which remains the authoritative internal competency map. Where a public or custom skill's guidance conflicts with `AGENTS.md` or `ASTRA_SKILL_MATRIX_V1.md`, the project's own documents win.

## Design lead

**`frontend-design`** (anthropics) is the design lead for aesthetic authorship: palette, typography, layout intent, restraint, and the specific discipline of avoiding generic-AI-dashboard tells. It operates *under* two domain constitutions that outrank it on structure:

- **`mdl-cad-workbench`** decides the CAD/CAE information architecture (what panels exist, where the tree lives, what the viewport's minimum share of the screen is). `frontend-design` may not "solve" a layout problem by inventing a card grid where `mdl-cad-workbench` requires a feature tree.
- **`mdl-live-mathematics`** decides the signature geometry-to-equation-to-matrix interaction rule. `frontend-design` may style that interaction; it may not simplify it away.

## Layout specialist

**`better-layout`** (jakubkrehel) reviews grouping, alignment, progressive disclosure, and responsive/RTL behavior of whatever `mdl-cad-workbench` and `frontend-design` produce. It does not decide panel existence or hierarchy — that is `mdl-cad-workbench`'s job — it verifies the resulting spacing/alignment/breakpoint mechanics are sound.

## Typography specialist

**`better-typography`** (jakubkrehel) owns type-scale, wrapping, truncation, and font-loading mechanics. It never decides *which* typeface family expresses MDL's identity — that judgment call belongs to `frontend-design` — it verifies the chosen system is implemented correctly (heading descent, line-height by role, tabular numbers on changing values, which matters for live numeric readouts).

## Color specialist (mechanics vs. semantics split)

**`better-colors`** (jakubkrehel) owns contrast measurement, ramp construction (perceptual lightness steps, hue-hold, token naming/tiering) and gradient interpolation-space choices. **`mdl-scientific-visualization`** owns what a color *means* physically (`--displacement`, `--velocity`, `--force`, `--energy`, `--mode-1`, `--mode-2` in `src/app/tokens.css`). Conflict rule: `better-colors` may fix a failing contrast pair or rebuild a ramp's lightness curve; it may never repurpose a physically-meaningful token for an unrelated UI accent, and it may never introduce a new physical-quantity color without `mdl-scientific-visualization`'s hue-separation check (see that skill's `references/SCIENTIFIC_COLOR_SEMANTICS.md`).

## Accessibility specialist

**`better-accessibility`** (jakubkrehel) is the accessibility authority for markup, keyboard support, ARIA, focus, and `prefers-reduced-motion` mechanics, reinforced by the project's own existing `@axe-core/playwright` dependency. It intersects with `mdl-threejs-scientific-viewport` on one specific point — critical labels must stay in the DOM, never baked into 3D text meshes — where the viewport skill's rule is the one `better-accessibility` should expect and verify, not question.

## Writing specialist

**`better-writing`** (jakubkrehel) owns product copy voice, error-message phrasing, and terminology consistency. It has the lightest footprint of the seven jakubkrehel skills in this project (physics-heavy UI has comparatively little marketing/CTA copy) but still governs error/empty-state text, which `AGENTS.md` section 15 ("Input Safety... explain invalid physics when possible") requires to exist.

## UI polish / interface motion specialist

**`better-ui`** (jakubkrehel) owns micro-interaction polish: radius, shadow, press states, icon transitions, and — critically — the distinction the project itself draws in `AGENTS.md` section 9 between physics motion, interface motion, and educational motion. `better-ui` operates strictly within "interface motion" (button press scale, panel open/close transitions); it must never be asked to animate a physics quantity, which stays inside `SimulationClock`'s domain.

## 3D / viewport specialists (two-tier: architecture over technique)

- **`mdl-threejs-scientific-viewport`** is the architectural authority: one `SimulationClock`, no physics-engine-driven modal motion, restrained camera, capped DPR, DOM-based critical labels, full disposal. It overrides every other Three.js skill on these points.
- **`threejs-core` / `threejs-camera` / `threejs-geometry` / `threejs-materials` / `threejs-lighting` / `threejs-performance`** (alton47) are the implementation-technique authority beneath it: how to correctly set up a scene, configure a camera within the constraints `mdl-threejs-scientific-viewport` sets, build procedural geometry, and dispose resources.
- **`three-best-practices`** (zebbern) is a second-opinion performance/memory review layer over both of the above, not a competing implementation authority — it catches disposal/draw-call/delta-time issues after the fact rather than prescribing the initial architecture.

## Desktop / Tauri specialist

**`tauri-concept`, `tauri-security`, `tauri-framework-security`, `tauri-config`, `tauri-window`, `tauri-build`, `tauri-ipc`, `tauri-app-plugin-permissions`** (pinkpixel-dev) together own packaging, capability/ACL least-privilege, CSP, window lifecycle, and IPC command design. They must never widen `src-tauri/capabilities/main.json` beyond documented V1/R3 need without explicit justification, matching both `AGENTS.md` section 6 and the project's own `ASTRA_SKILL_MATRIX_V1.md` category 27 ("Tauri Security / Native Boundary... no broad filesystem, shell, or network capability without explicit V1 need").

## QA / review layer (three tiers, sequenced not parallel)

1. **`mdl-visual-qa`** is the outermost, project-specific wrapper: it knows MDL's exact screen/size/theme/state matrix and decides which of the layers below to invoke for a given change, so the same finding is not re-litigated three times.
2. **`better-interface`** is the cross-discipline rules-based auditor, routing to the six `better-*` domain skills and producing one consolidated, capped, ranked verdict.
3. **`design-review`** (humbleteam) is an independent, differently-structured scored (0-4) second opinion with heuristic/WCAG citations, run separately rather than chained to `better-interface`.

## Pedagogy specialist

**`mdl-pedagogy`** is the sole owner of teaching sequence and misconception-avoidance decisions. No public skill competes here; it extends the project's own already-implemented lesson grammar and misconception map rather than introducing a new one.

## Live-mathematics specialist

**`mdl-live-mathematics`** is the sole owner of the physical-object <-> force <-> equation-term <-> matrix-contribution <-> result linking rule — the signature interaction of Modal Dynamics Studio. No other installed or custom skill may simplify this chain away in the name of layout or aesthetic cleanliness.

## Scientific visualization specialist

**`mdl-scientific-visualization`** is the sole owner of which 2D evidence view is authoritative for a given physical quantity, and (per the color split above) the semantic half of color ownership.

## CAD / information-architecture specialist

**`mdl-cad-workbench`** is the sole owner of panel/tree/viewport/dock information architecture for the CAD Experience R3 redesign, distilled from Shapr3D/Fusion/SolidWorks/Onshape/Discovery/Inspire/COMSOL/Spline without copying any one of them (see its `references/CAD_REFERENCES.md`).

## Skill-authoring meta-tool

**`skill-creator`** (anthropics) is not a design authority. It is the method every one of the six custom `mdl-*` skills should be revised through (draft -> test prompts -> eval -> iterate) if the CAD Experience R3 phase finds a gap or a miscalibration in them.

## One-paragraph summary of the non-conflict guarantee

Every specialist above either (a) owns a domain no other installed skill touches, or (b) is explicitly subordinate to a named skill on the points where the two could otherwise collide, per `DESIGN_SKILL_FOUNDATION_R1_REPORT.md` section 7 ("Skill conflicts resolved"). No two skills in this stack claim final authority over the same decision.
