# DESIGN SKILL FOUNDATION R1 — scoring matrix

Scale: 1-5, higher is better, for every criterion except "Overlap with other skills" and "Risk of producing generic UI," where **lower is better** (marked with a dagger, †). Scores are this run's judgment, grounded in the full-content inspection recorded in `DESIGN_SKILL_FOUNDATION_R1_RESEARCH.md`, not a repository's own marketing claims.

## Installed skills

| Skill (source) | Relevance to MDL | Instruction quality | Specificity | Maintenance/currentness | License clarity | Overlap w/ others † | Risk of generic UI † | Tauri/React compat | Offline compat | Future CAD/Three.js use | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `frontend-design` (anthropics) | 5 | 5 | 4 | 5 | 5 | 2 | 1 | 5 | 5 | 4 | Design-authorship lead; explicitly anti-generic-dashboard |
| `skill-creator` (anthropics) | 4 | 5 | 5 | 5 | 5 | 1 | 1 | 5 | 5 | 5 | Meta-tool, not a design authority itself |
| `better-interface` (jakubkrehel) | 5 | 5 | 4 | 5 | 5 | 3 | 1 | 5 | 5 | 3 | Orchestrator only; owns nothing substantive itself |
| `better-accessibility` (jakubkrehel) | 5 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 3 | Exact WCAG values, framework-agnostic |
| `better-colors` (jakubkrehel) | 4 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 3 | Mechanics only; semantics owned by mdl-scientific-visualization |
| `better-layout` (jakubkrehel) | 4 | 5 | 4 | 5 | 5 | 2 | 1 | 5 | 5 | 2 | Generic grouping/alignment; useful for CAD panel review |
| `better-typography` (jakubkrehel) | 4 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 2 | Exact CSS values, framework-agnostic |
| `better-ui` (jakubkrehel) | 4 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 2 | Motion-restraint rules align well with AGENTS.md |
| `better-writing` (jakubkrehel) | 3 | 5 | 4 | 5 | 5 | 1 | 1 | 5 | 5 | 1 | Least physics-relevant, still useful for error copy |
| `design-review` (humbleteam) | 4 | 5 | 4 | 5 | 5 | 3 | 1 | 5 | 5 | 2 | Independent scored second opinion, deliberately not chained to better-interface |
| `threejs-core` (alton47) | 4 | 4 | 4 | 3 | 5 | 2 | 2 | 4 | 5 | 5 | Generic scene/renderer setup; mdl-threejs-scientific-viewport overrides on architecture |
| `threejs-camera` (alton47) | 5 | 4 | 4 | 3 | 5 | 2 | 2 | 4 | 5 | 5 | Directly informs restrained-camera implementation |
| `threejs-geometry` (alton47) | 4 | 4 | 4 | 3 | 5 | 1 | 1 | 4 | 5 | 5 | Procedural geometry technique |
| `threejs-materials` (alton47) | 3 | 4 | 4 | 3 | 5 | 1 | 1 | 4 | 5 | 4 | Must be filtered through the "no game aesthetic" rule |
| `threejs-lighting` (alton47) | 3 | 4 | 4 | 3 | 5 | 1 | 1 | 4 | 5 | 4 | Same filter as materials |
| `threejs-performance` (alton47) | 4 | 4 | 4 | 3 | 5 | 3 | 1 | 4 | 5 | 5 | Overlaps three-best-practices; both kept (authorship vs. review) |
| `three-best-practices` (zebbern) | 3 | 3 | 4 | 4 | 4 | 3 | 1 | 3 | 5 | 4 | Version drift (0.182+ claimed vs 0.180 pinned) noted, non-blocking; review layer only |
| `tauri-concept` (pinkpixel-dev) | 4 | 3 | 3 | 4 | 4 | 2 | 1 | 5 | 5 | 3 | Generic filler padding lowers instruction quality; core content sound |
| `tauri-security` (pinkpixel-dev) | 5 | 3 | 3 | 4 | 4 | 2 | 1 | 5 | 5 | 3 | Directly matches the existing least-privilege capabilities/main.json pattern |
| `tauri-framework-security` (pinkpixel-dev) | 5 | 3 | 3 | 4 | 4 | 2 | 1 | 5 | 5 | 3 | Same filler-padding caveat as tauri-concept |
| `tauri-config` (pinkpixel-dev) | 4 | 3 | 3 | 4 | 4 | 1 | 1 | 5 | 5 | 2 | CSP/lifecycle guidance matches tauri.conf.json already in place |
| `tauri-window` (pinkpixel-dev) | 4 | 3 | 3 | 4 | 4 | 1 | 1 | 5 | 5 | 3 | Window lifecycle/DPI relevant to future viewport work |
| `tauri-build` (pinkpixel-dev) | 3 | 3 | 3 | 4 | 4 | 1 | 1 | 5 | 5 | 1 | Packaging/signing; NSIS already configured |
| `tauri-ipc` (pinkpixel-dev) | 3 | 3 | 3 | 4 | 4 | 1 | 1 | 5 | 5 | 3 | Relevant once CAD viewport needs new Rust commands |
| `tauri-app-plugin-permissions` (pinkpixel-dev) | 4 | 3 | 3 | 4 | 4 | 1 | 1 | 5 | 5 | 2 | Capability-authoring workflow, complements tauri-security |

## Custom MDL skills

| Skill | Relevance to MDL | Instruction quality | Specificity | Maintenance/currentness | License clarity | Overlap w/ others † | Risk of generic UI † | Tauri/React compat | Offline compat | Future CAD/Three.js use |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `mdl-cad-workbench` | 5 | 5 | 5 | 5 (authored this run) | 5 (project-owned) | 1 | 1 | 5 | 5 | 5 |
| `mdl-live-mathematics` | 5 | 5 | 5 | 5 | 5 | 1 | 1 | 5 | 5 | 5 |
| `mdl-threejs-scientific-viewport` | 5 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 5 |
| `mdl-scientific-visualization` | 5 | 5 | 5 | 5 | 5 | 1 | 1 | 5 | 5 | 4 |
| `mdl-pedagogy` | 5 | 5 | 5 | 5 | 5 | 1 | 1 | 5 | 5 | 3 |
| `mdl-visual-qa` | 5 | 5 | 5 | 5 | 5 | 2 | 1 | 5 | 5 | 3 |

Custom-skill overlap scores are low (1-2) by construction: each one explicitly names what it does *not* own and defers to the specific skill that does, per the ownership hierarchy in `DESIGN_SKILL_FOUNDATION_R1_OWNERSHIP.md`.

## Rejected candidates (scored for the record, not installed)

| Skill (source) | Relevance to MDL | Instruction quality | Specificity | Maintenance/currentness | License clarity | Overlap w/ others † | Risk of generic UI † | Tauri/React compat | Offline compat | Future CAD/Three.js use | Rejection reason |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `design-grill` (dawitlabs) | 2 | 4 | 3 | 4 | 5 | 5 | 3 | 3 | 4 | 1 | SaaS/consumer-web product taxonomy mismatch; overlaps design-review/frontend-design |
| `ui-design-principles` (dawitlabs) | 2 | 3 | 2 | 4 | 5 | 5 | 3 | 3 | 4 | 1 | Blog-compiled generic knowledge; heavy overlap with better-colors/better-typography |
| `tokens`, `uicolor`, `a11y`, `animate`, `uiux`, `landing`, `ui-init`, `copy` (dawitlabs) | 2 | 3 | 3 | 4 | 5 | 5 | 3 | 3 | 4 | 1 | Same overlap/mismatch pattern as above, not individually re-scored |
| `frontend-visual-qa` (daymade) | 3 | 5 | 5 | 5 | 5 | 4 | 1 | 2 | 3 | 2 | Excellent content, wrong operating model (deployed/authenticated multi-environment web, not an offline single-window desktop app) |
| `design-system-builder` (zebbern) | 2 | 4 | 4 | 4 | 4 | 2 | 2 | 4 | 5 | 3 | No reference screenshots exist yet to extract a system from; revisit at CAD R3 reference-study phase |
| `threejs-animation` (alton47) | 2 | 4 | 4 | 3 | 5 | 2 | 2 | 4 | 5 | 2 | Built around AnimationMixer/GLTF/skeletal motion; MDL's motion is solver-driven |
| `threejs-react` (alton47) | 1 | 4 | 4 | 3 | 5 | 3 | 2 | 1 | 5 | 1 | Assumes React Three Fiber, not a dependency in this project |
| `threejs-shaders`, `threejs-postprocessing` (alton47) | 1 | 4 | 4 | 3 | 5 | 1 | 4 | 4 | 5 | 1 | Bloom/DOF/custom-shader techniques conflict with the "no neon/game aesthetic" rule |
| `threejs-xr`, `threejs-audio`, `threejs-loaders`, `threejs-physics` (alton47) | 1 | 4 | 4 | 3 | 5 | 1 | 2 | 4 | 5 | 1 | No VR/AR, audio, external asset loading, or rigid-body physics in V1/R3 scope |
| `interface-review` (jakubkrehel) | 3 | 5 | 4 | 5 | 5 | 3 | 1 | 5 | 5 | 2 | Reviews a git diff/branch/PR; project has no `.git` yet |
| `explain-interface`, `variant`, `break` (jakubkrehel) | 2 | 4 | 4 | 5 | 5 | 2 | 1 | 5 | 5 | 1 | User-invoked iteration tools, out of scope for a foundation-only run |

Rejected dawitlabs skills beyond the two fully read were not individually re-scored line-by-line; the same three disqualifying factors (product-taxonomy mismatch, Tailwind-coupled examples, overlap with already-selected alternatives) apply uniformly across the remaining eight, as recorded in the research matrix.
