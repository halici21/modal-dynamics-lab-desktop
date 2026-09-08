# DESIGN SKILL FOUNDATION R1 — evaluation results

**Method.** These are not live Claude Code invocations (no CAD Experience R3 implementation work is authorized in this run — see the hard rules). Each eval below is a prompt this project is likely to receive, reasoned through by re-reading the installed skill's actual `SKILL.md` (and, where relevant, its `references/` files) and judging whether following those instructions literally would produce a PASS or FAIL outcome against the stated criterion. This matches the run brief's own instruction: "assess against the SKILL.md content whether the skill's instructions would produce a PASS or FAIL... and note this method." Where a skill would need to consult another skill to reach a verdict, that hand-off is treated as part of a correct PASS, not a gap.

## 1. CAD workbench eval

**Prompt**: "Redesign the Undamped SDOF screen."

**Skill**: `mdl-cad-workbench`

**Reasoning**: The skill's "non-negotiable shape" section requires a dominant viewport, a Model Browser mirroring the actual physics object graph, a single cross-panel selection state, and named Learn/Explore/Inspect density — and its explicit gate statement fails on sight any proposal that "collapses them into cards or a dashboard grid," a "hamburger-collapsed navigation on desktop hiding the tree," or "KPI-style stat tiles standing in for a physical quantity." A response produced under this skill could not legally propose dashboard cards, a giant top nav, a generic shadcn shell, or a design that hides physics behind an abstraction, because doing so would fail the skill's own stated gate before the response could be considered complete.

**Verdict**: PASS (the skill would correctly block the failure mode named in the brief).

## 2. Live mathematics eval

**Prompt**: "Design interaction for coupling spring k2."

**Skill**: `mdl-live-mathematics`

**Reasoning**: The skill's worked example section is *this exact scenario* — it walks through extending `PhysicalSelection`, tagging the viewport spring, both equation occurrences, and all four matrix cells with one shared `data-token` id, and connecting the result to a natural-frequency readout, with an explicit "a design that implements fewer than all five links is not 'live mathematics,' it is decoration" gate.

**Verdict**: PASS (connects geometry <-> force <-> equation <-> K-matrix contribution, per the brief's own PASS criterion).

## 3. Three.js eval

**Prompt**: "Create viewport interaction architecture."

**Skill**: `mdl-threejs-scientific-viewport`

**Reasoning**: Invariant 1 explicitly bans a second animation-loop driver ("never instantiate a second [clock]... never call `renderer.setAnimationLoop` as an independent driver of physics time"); invariant 2 explicitly bans Rapier/Cannon-es driving modal motion; invariant 3 requires a restrained camera and explicitly rejects an uncontrolled free-orbit default; invariant 5 explicitly bans 3D text meshes for critical labels. A response produced under this skill would fail its own stated invariants if it proposed any of the four named failure modes.

**Verdict**: PASS (no second physics clock, no Rapier/Cannon, no uncontrolled free camera, no 3D-texture critical labels — all four of the brief's named failure conditions are explicitly forbidden).

## 4. Pedagogy eval

**Prompt**: "Teach natural frequency."

**Skill**: `mdl-pedagogy`

**Reasoning**: The skill mandates the QUESTION-before-EQUATION grammar ("phenomenon before formula... a new lesson skips steps only when a step is genuinely inapplicable") and requires the EXPERIMENT step to manipulate the real physical parameter, with the misconception table's "Natural frequency is playback speed" row as a concrete, named target this exact topic must expose and correct via "change playback rate without parameters -> omega_n readout stays fixed."

**Verdict**: PASS (phenomenon precedes formula; parameter interaction — the playback-rate-vs-omega_n experiment — is explicitly used).

## 5. Visual QA eval

**Prompt**: "Review a screenshot."

**Skill**: `mdl-visual-qa`, sequencing into `better-interface` and/or `design-review`

**Reasoning**: `mdl-visual-qa`'s sequencing section always routes a multi-discipline change through `better-interface` (which itself covers accessibility, layout, writing, typography, color, and UI polish as one consolidated verdict) and explicitly hard-codes the "generic-dashboard tendency test" as a mandatory, separate check that must be asked "regardless of how clean the typography or spacing scores." Equation discoverability and viewport dominance are covered because the gate explicitly requires checking against `AGENTS.md`'s "hide the Physics Stage/viewport behind a 'feature' abstraction" language, and `mdl-live-mathematics`/`mdl-cad-workbench` are the named authorities `better-interface` would defer to for anything equation- or IA-shaped it encounters.

**Verdict**: PASS (hierarchy, clutter, CAD interaction, equation discoverability, and viewport dominance are all in scope across the sequenced layers, with the generic-dashboard check made explicit rather than assumed).

## 6. Additional eval — Tauri security boundary

**Prompt**: "Add a way for the CAD workbench to save the current model to a file."

**Skill**: `tauri-security`, `tauri-app-plugin-permissions`, cross-checked against `ASTRA_SKILL_MATRIX_V1.md` category 27

**Reasoning**: `tauri-security`'s scope statement is explicit: "Boundary: Capabilities, scope, and ACL configuration only... Out of scope: app feature design." Its "How to use" steps require mapping the feature to a capability, defining scoped access rules, and validating `capabilities/*.json` before granting access — which, applied to the current `src-tauri/capabilities/main.json` (window-focus events only, no filesystem/shell/network), would correctly force an explicit, scoped capability addition (e.g. a narrowly-scoped dialog/file-system capability) rather than a broad grant, matching `AGENTS.md` section 6's "Do not grant broad Tauri capabilities without need."

**Verdict**: PASS (would produce a least-privilege capability addition, not a blanket filesystem grant) — though the generic filler padding noted in the research/matrix docs would need to be visually skipped by whoever reads the skill; this is a readability nuisance, not a correctness failure, since the actionable "When to use / How to use / Scope / References" sections are unaffected by the padding.

## 7. Additional eval — generic-dashboard stress test (explicit adversarial prompt)

**Prompt**: "Make the SDOF screen feel more like a modern SaaS product — add stat cards for the key numbers and a cleaner top navigation."

**Skills in play**: `mdl-cad-workbench` (gate), `mdl-visual-qa` (generic-dashboard tendency test), `frontend-design` (its own named "SaaS-card kit" tell)

**Reasoning**: This prompt is designed to entice exactly the failure mode `AGENTS.md` forbids. Three independent layers would each catch it: `frontend-design` names "the SaaS-card kit: content chopped into identical rounded cards... gradient washes as decoration" as one of its five calibration tells to avoid; `mdl-cad-workbench`'s gate explicitly fails "KPI-style stat tiles standing in for a physical Property Manager field"; and `mdl-visual-qa`'s generic-dashboard tendency test asks the question directly before any redesign is accepted. A request framed as a reasonable-sounding modernization would still be rejected or substantially reshaped (numbers stay attached to their physical objects and the Property Manager, not lifted into freestanding stat cards) under this skill stack.

**Verdict**: PASS (the adversarial framing is caught by three independent layers, not just one, reducing the chance a single missed check lets it through).

## Summary

| # | Eval | Skill(s) | Verdict |
|---|---|---|---|
| 1 | Redesign Undamped SDOF | mdl-cad-workbench | PASS |
| 2 | Coupling spring k2 interaction | mdl-live-mathematics | PASS |
| 3 | Viewport interaction architecture | mdl-threejs-scientific-viewport | PASS |
| 4 | Teach natural frequency | mdl-pedagogy | PASS |
| 5 | Review a screenshot | mdl-visual-qa + better-interface/design-review | PASS |
| 6 | Add a save-to-file feature | tauri-security + tauri-app-plugin-permissions | PASS |
| 7 | "Make it feel more SaaS" adversarial prompt | mdl-cad-workbench + mdl-visual-qa + frontend-design | PASS |

No FAIL was produced in this evaluation round. The one nuisance noted (pinkpixel-dev's generic filler padding) is a readability cost, not a correctness failure, and is already flagged in every affected skill's `PROVENANCE.md`.
