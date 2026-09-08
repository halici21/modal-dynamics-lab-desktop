# DESIGN SKILL FOUNDATION R1 VERDICT

PASS

## 1. Repositories researched

All eight named repositories were shallow-cloned and inspected directly (SKILL.md content, frontmatter, references/scripts, LICENSE, last-commit date) rather than summarized from search results.

1. **anthropics/skills** — accessible, current (last commit 2026-09-03), Apache-2.0 for the example skills used here (`frontend-design`, `skill-creator`; the docx/pdf/pptx/xlsx skills in the same repo are source-available, not open source, and were not touched).
2. **jakubkrehel/skills** — accessible, current (2026-08-29), MIT. Relevant skills: `better-interface`, `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`, `better-writing` (installed); `interface-review`, `explain-interface`, `variant`, `break` (inspected, not installed).
3. **dawitlabs/ui-skills** — accessible, current (2026-05-16), MIT. Ten skills inspected (`design-grill`, `ui-design-principles`, `tokens`, `uicolor`, `a11y`, `animate`, `uiux`, `landing`, `ui-init`, `copy`); none installed — heavy overlap with already-selected alternatives plus a Tailwind/SaaS-web assumption mismatch with this offline, plain-CSS-token desktop app.
4. **alton47/threejs-skills** — accessible, current enough (2026-03-25), MIT. Six of thirteen skills installed (`threejs-core`, `-camera`, `-geometry`, `-materials`, `-lighting`, `-performance`); `-animation`, `-react`, `-shaders`, `-postprocessing`, `-xr`, `-audio`, `-loaders`, `-physics` inspected and rejected as out of scope.
5. **zebbern/claude-code-guide** — accessible, current (2026-09-07), MIT. `three-best-practices` installed as a Three.js performance/memory REVIEW overlay (not a competing implementation authority); `design-system-builder` inspected and rejected (no reference screenshots exist yet to extract a system from). Repository is otherwise a large, mostly unrelated security/pentest skill collection — nothing else in it was inspected or installed.
6. **daymade/claude-code-skills** — accessible (required `git -c core.longpaths=true` on Windows), current (2026-09-08), MIT. `frontend-visual-qa` inspected in full including both bundled scripts (clean security review); not installed — its operating model assumes a deployed, authenticated, multi-environment web/native product this offline single-window desktop app does not have. Its ideas informed `mdl-visual-qa` without copying its content.
7. **humbleteam/design-review** — accessible, current (2026-09-08), MIT. Single skill, installed as an independent scored (0-4) second-opinion visual gate, run separately from `better-interface`.
8. **pinkpixel-dev/tauri-skills** — accessible, current (2026-08-08), Apache-2.0. 8 of 53 skills installed (`tauri-concept`, `tauri-security`, `tauri-framework-security`, `tauri-config`, `tauri-window`, `tauri-build`, `tauri-ipc`, `tauri-app-plugin-permissions`); 45 mobile/plugin skills rejected as unneeded. Quality finding: 50 of 53 skill files (including all 8 installed) carry generic, non-Tauri-specific bilingual filler padding — flagged in every affected skill's `PROVENANCE.md`, not blocking.

Full detail: `docs/DESIGN_SKILL_FOUNDATION_R1_RESEARCH.md`.

## 2. Candidate skill matrix

Full 10-criterion, 1-5 scoring for every installed, custom, and rejected candidate: `docs/DESIGN_SKILL_FOUNDATION_R1_MATRIX.md`.

## 3. Rejected skills

- **dawitlabs/ui-skills (all ten)** — overlap with `frontend-design` + the jakubkrehel `better-*` suite, plus a structural mismatch: its own design-intake interview assumes SaaS/consumer-web/marketing-site product categories and its examples are Tailwind-utility-coupled, while MDL is an offline Tauri desktop instrument styled with hand-authored CSS custom properties.
- **daymade/claude-code-skills -> frontend-visual-qa** — excellent, cleanly-reviewed content, wrong operating model (deployed/authenticated/multi-environment web-and-native audit machinery this product does not have yet).
- **zebbern/claude-code-guide -> design-system-builder** — nothing to extract a design system from until CAD R3's reference-study phase collects actual comparison screenshots.
- **alton47 -> threejs-animation/-react/-shaders/-postprocessing/-xr/-audio/-loaders/-physics** — GLTF/skeletal animation, React Three Fiber, bloom/custom-shader effects, VR/AR, external audio, external asset loading, and rigid-body physics are all outside V1/R3 scope or directly conflict with `AGENTS.md`'s "no game aesthetic" / "no second physics engine" rules.
- **jakubkrehel -> interface-review, explain-interface, variant, break** — user-invoked-only tools; `interface-review` specifically needs a git diff/branch, and this directory has no `.git` yet.
- **pinkpixel-dev -> the other 45 tauri-app-* plugin skills** — none map to a stated V1/R3 requirement (biometric, NFC, barcode scanner, single-instance, updater, SQL, stronghold, WASM, sidecar, etc.).

## 4. Final installed third-party skills

25 skills, all project-local under `.claude/skills/<name>/`. Full per-skill repository/license/path/responsibility table: `docs/DESIGN_SKILL_FOUNDATION_R1_THIRD_PARTY.md`. Summary by responsibility:

- **Design authorship**: `frontend-design` (anthropics).
- **Skill-authoring meta-tool**: `skill-creator` (anthropics).
- **Cross-discipline UI critique**: `better-interface`, `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`, `better-writing` (jakubkrehel).
- **Independent scored visual gate**: `design-review` (humbleteam).
- **Three.js implementation technique**: `threejs-core`, `threejs-camera`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-performance` (alton47).
- **Three.js performance/memory review**: `three-best-practices` (zebbern).
- **Tauri desktop/security**: `tauri-concept`, `tauri-security`, `tauri-framework-security`, `tauri-config`, `tauri-window`, `tauri-build`, `tauri-ipc`, `tauri-app-plugin-permissions` (pinkpixel-dev).

## 5. Ownership hierarchy

Full derivation and conflict-resolution detail: `docs/DESIGN_SKILL_FOUNDATION_R1_OWNERSHIP.md`. Summary:

- **Design lead**: `frontend-design`, subordinate to `mdl-cad-workbench` (structure) and `mdl-live-mathematics` (signature interaction) on domain correctness.
- **Layout specialist**: `better-layout`. **Typography specialist**: `better-typography`. **Color specialist**: `better-colors` (mechanics) + `mdl-scientific-visualization` (physical semantics). **Accessibility specialist**: `better-accessibility`. **Writing specialist**: `better-writing`. **UI-polish/interface-motion specialist**: `better-ui`.
- **3D specialists**: `mdl-threejs-scientific-viewport` (architecture, overrides on conflict) over `threejs-core/camera/geometry/materials/lighting/performance` (technique), reviewed by `three-best-practices`.
- **QA specialist**: three-tier, sequenced — `mdl-visual-qa` (project-specific matrix + sequencing) -> `better-interface` (rules-based domain audit) -> `design-review` (independent scored second opinion).
- **Tauri specialist**: the 8 installed `tauri-*` skills, bound by the existing least-privilege `capabilities/main.json`.
- **Pedagogy, live mathematics, and CAD information architecture**: sole-owned by the three matching custom `mdl-*` skills; no public skill competes in these domains.

## 6. Custom MDL skills

All six named in the brief were built, each with a gap analysis against the public-skill research before being written. Full detail: `docs/DESIGN_SKILL_FOUNDATION_R1_CUSTOM_SKILLS.md`.

- **mdl-cad-workbench** — CAD/CAE information architecture (Model Browser, Property Manager, Equation Dock, analysis dock, Learn/Explore/Inspect), distilled from 8 reference products without copying any one of them.
- **mdl-live-mathematics** — the five-link physical-object <-> force <-> equation <-> matrix <-> result chain, grounded in the actual `PhysicalSelection`/`data-token` conventions already in production.
- **mdl-threejs-scientific-viewport** — the architectural invariants (one clock, no physics engine, restrained camera, capped DPR, DOM labels, full disposal) that override generic Three.js advice, mapped line-by-line to the existing `RendererStudy.tsx` prototype.
- **mdl-scientific-visualization** — "3D for intuition, 2D for evidence," which plot is authoritative for which physical question, and the semantic half of color ownership over the existing `tokens.css` physical-quantity colors.
- **mdl-pedagogy** — packages the project's own already-implemented QUESTION/PREDICT/EXPERIMENT/OBSERVE/EXPLAIN/EQUATION/CHECK/CONTINUE grammar and 18-row misconception map as an invocable skill.
- **mdl-visual-qa** — wraps the project's real 13-workspace/900x680/1440x900/dark-light/reduced-motion screenshot matrix and sequences the three QA layers, with an explicit mandatory generic-dashboard tendency test.

All six follow progressive disclosure (34-49 line `SKILL.md` bodies, one `references/*.md` each, no bundled scripts since none needed repeatable automation).

## 7. Skill conflicts resolved

- `better-colors` (contrast/ramp mechanics) vs. `mdl-scientific-visualization` (physical color meaning) — split by mechanics-vs-semantics; `better-colors` may never repurpose a physically-meaningful token.
- `frontend-design` (generic aesthetic authorship) vs. `mdl-cad-workbench`/`mdl-live-mathematics` (domain structure) — the two custom skills outrank `frontend-design` on structural/domain correctness; `frontend-design` governs taste within those constraints.
- `threejs-core/camera/geometry/materials/lighting/performance` (generic technique, would happily suggest free-orbit `OrbitControls` or an uncapped DPR) vs. `mdl-threejs-scientific-viewport` (project architecture) — the custom skill explicitly overrides on camera freedom, DPR, clock ownership, and label rendering.
- `three-best-practices`'s claimed `three@0.182.0+` vs. this project's pinned `three@0.180.0` — recorded as non-blocking version drift; the APIs in play (scene/camera/renderer lifecycle, disposal, delta-time, draw calls) are stable across that gap.
- `better-interface` vs. `design-review` vs. `mdl-visual-qa` (three plausible QA entry points) — resolved by explicit sequencing (project matrix -> rules-based audit -> independent scored opinion) rather than parallel, redundant invocation.
- jakubkrehel `better-*` skills' Tailwind-flavored code examples vs. this project's plain-CSS-token system — no real conflict; the skills are framework-agnostic by explicit design ("write every fix in the project's own idiom"), noted as a translation nuance in each skill's `PROVENANCE.md`, not a rejection reason.

## 8. Security / supply-chain review

Every skill installed was inspected for shell commands, network behavior, destructive operations, hidden setup scripts, unusual permissions, and auto-install behavior before installation. Findings: zero scripts in 22 of 25 installed skills; `skill-creator`'s scripts only ever invoke the Claude CLI itself or a local webbrowser/HTTP viewer; no installed skill contains `exec`/`spawn`/`child_process`/arbitrary shell execution, unexpected network calls, or destructive filesystem operations. One skill was fully reviewed and rejected on fit grounds despite a clean security result (`daymade/frontend-visual-qa`, including its 2238-line Playwright script). One repository-hygiene observation was recorded without being a security finding against what was installed: `zebbern/claude-code-guide` and `pinkpixel-dev/tauri-skills` both contain large amounts of unrelated or low-quality content in skills that were not installed. Nothing suspicious was found anywhere. Full detail: `docs/DESIGN_SKILL_FOUNDATION_R1_THIRD_PARTY.md`.

## 9. License review

MIT: `better-*` (7), `design-review`, `threejs-*` (6), `three-best-practices` — copyright notices preserved by copying each source's root `LICENSE` into every installed folder that lacked its own. Apache-2.0: `frontend-design`, `skill-creator` (own `LICENSE.txt` present in source), all 8 `tauri-*` skills (root `LICENSE` copied in as `LICENSE.txt` to resolve a dangling frontmatter reference in the source repo — recorded as a relocation, not a fabrication). No copyleft licenses encountered. No skill installed without a clearly identified license. Full detail: `docs/DESIGN_SKILL_FOUNDATION_R1_THIRD_PARTY.md`.

## 10. Evaluation results

Seven representative prompts reasoned through against actual `SKILL.md` content (method: no live Claude Code invocation was run, since CAD Experience R3 implementation is out of scope for this run; each verdict is derived from whether following the skill's literal stated rules would produce the required behavior). All seven PASSED, including an explicit adversarial "make it feel more SaaS" generic-dashboard-tendency prompt caught independently by three different layers (`mdl-cad-workbench`, `mdl-visual-qa`, `frontend-design`'s own named tells). Full detail and reasoning: `docs/DESIGN_SKILL_FOUNDATION_R1_EVALS.md`.

## 11. Files created

31 new skill folders (25 third-party, cherry-picked and copied verbatim plus this run's own `PROVENANCE.md`/license files; 6 custom, fully authored) under a newly-created `.claude/skills/` directory, plus 8 new documentation files under `docs/`. Nothing outside `.claude/skills/` and `docs/` was created, edited, or deleted. Full file-by-file accounting: `docs/DESIGN_SKILL_FOUNDATION_R1_FILES.md`.

## 12. Production-code impact

**NONE.** No file under `src/`, `src-tauri/`, `tests/`, `scripts/`, `public/`, or any pre-existing `docs/*.md` was touched. No physics, renderer, animation, or Tauri production code changed. No dependency manifest (`package.json`, `Cargo.toml`) or runtime config (`tauri.conf.json`, `capabilities/main.json`) changed. The repository was **not** `git init`'d — this was a deliberate decision: nothing installed strictly required version control (the one skill that does, `interface-review`, was deliberately not installed for exactly this reason), and initializing a git repository is a meaningful infrastructure change the brief did not ask for, so it was left for the user to decide.

## 13. Final recommended skill stack

CAD Experience R3 should invoke, by task:

- **New visual/structural design work**: `mdl-cad-workbench` -> `mdl-live-mathematics` (if math/geometry linking is involved) -> `frontend-design` for aesthetic execution.
- **3D viewport work**: `mdl-threejs-scientific-viewport` (architecture) -> `threejs-core`/`threejs-camera`/`threejs-geometry`/`threejs-materials`/`threejs-lighting`/`threejs-performance` (technique) -> `three-best-practices` (review).
- **Scientific evidence views**: `mdl-scientific-visualization`, cross-checking color against `better-colors`.
- **Lesson/teaching content**: `mdl-pedagogy`.
- **Desktop/Tauri work**: `tauri-concept`, `tauri-security`, `tauri-framework-security`, `tauri-config`, `tauri-window`, `tauri-build`, `tauri-ipc`, `tauri-app-plugin-permissions` as relevant to the specific change.
- **Before marking any visual change complete**: `mdl-visual-qa`, sequencing into `better-interface` and/or `design-review` per its own rules.
- **Skill maintenance**: `skill-creator`, if any of the six custom skills need revision once real CAD R3 usage surfaces a gap.

## 14. Missing capability

No adequate skill (public or newly authored) fully covers **accessible alternatives for canvas/WebGL content** beyond `better-accessibility`'s native-element guidance and `mdl-threejs-scientific-viewport`'s "critical labels stay in the DOM" mitigation — neither prescribes, for example, a structured non-visual equivalent of a 3D mode shape for a screen-reader user beyond keeping numeric labels in HTML. This is mitigated by design (2D evidence views remain authoritative per `mdl-scientific-visualization`, so no physical conclusion depends on seeing the 3D scene), but it is not solved outright, and is worth a dedicated look once CAD Experience R3's viewport carries real interactive weight. Separately, screenshot-based design-system extraction (`design-system-builder`) has no input to operate on yet and should be revisited once reference product screenshots are actually collected for the CAD R3 reference-study phase.

## 15. CAD EXPERIENCE R3 readiness

"Is the project now equipped with a coherent, non-conflicting skill stack for the Modal Dynamics Studio CAD/CAE redesign?"

**YES.**
