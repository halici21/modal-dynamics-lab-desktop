# DESIGN SKILL FOUNDATION R1 — third-party skill installs

All 25 third-party skills below are installed project-locally at `<repo>/.claude/skills/<skill-name>/` — none globally. Every one was cherry-picked individually from its source repository (no full-repository or marketplace installs); the source repository's own skill-count is noted so the selection ratio is visible. Each installed skill folder carries a `PROVENANCE.md` recording the exact statements below, plus either the source's own `LICENSE.txt` or a `LICENSE`/`LICENSE.txt` copied in by this run where the source folder lacked one (noted per row).

| Skill | Repository | Skills in source repo | Path | License | Verbatim / adapted | Notice required |
|---|---|---:|---|---|---|---|
| `frontend-design` | github.com/anthropics/skills | 17 (skills/) | `.claude/skills/frontend-design/` | Apache-2.0 (own `LICENSE.txt`, present in source) | Verbatim | Apache-2.0 NOTICE-style attribution retained via the copied `LICENSE.txt`; no separate NOTICE file existed in source |
| `skill-creator` | github.com/anthropics/skills | 17 (skills/) | `.claude/skills/skill-creator/` | Apache-2.0 (own `LICENSE.txt`, present in source) | Verbatim | Same as above |
| `better-interface` | github.com/jakubkrehel/skills | 11 (skills/) | `.claude/skills/better-interface/` | MIT | Verbatim | MIT copyright notice (Jakub Krehel, 2026) added as `LICENSE` in this folder, copied from repo root |
| `better-accessibility` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-accessibility/` | MIT | Verbatim | Same |
| `better-colors` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-colors/` | MIT | Verbatim | Same |
| `better-layout` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-layout/` | MIT | Verbatim | Same |
| `better-typography` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-typography/` | MIT | Verbatim | Same |
| `better-ui` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-ui/` | MIT | Verbatim | Same |
| `better-writing` | github.com/jakubkrehel/skills | 11 | `.claude/skills/better-writing/` | MIT | Verbatim | Same |
| `design-review` | github.com/humbleteam/design-review | 1 (single-skill repo) | `.claude/skills/design-review/` | MIT (own `LICENSE`, present in source) | Verbatim | MIT copyright notice (Humbleteam, 2026) copied as-is |
| `threejs-core` | github.com/alton47/threejs-skills | 13 (skills/) | `.claude/skills/threejs-core/` | MIT | Verbatim | MIT copyright notice (Allan Alton, 2026) added as `LICENSE` in this folder, copied from repo root |
| `threejs-camera` | github.com/alton47/threejs-skills | 13 | `.claude/skills/threejs-camera/` | MIT | Verbatim | Same |
| `threejs-geometry` | github.com/alton47/threejs-skills | 13 | `.claude/skills/threejs-geometry/` | MIT | Verbatim | Same |
| `threejs-materials` | github.com/alton47/threejs-skills | 13 | `.claude/skills/threejs-materials/` | MIT | Verbatim | Same |
| `threejs-lighting` | github.com/alton47/threejs-skills | 13 | `.claude/skills/threejs-lighting/` | MIT | Verbatim | Same |
| `threejs-performance` | github.com/alton47/threejs-skills | 13 | `.claude/skills/threejs-performance/` | MIT | Verbatim | Same |
| `three-best-practices` | github.com/zebbern/claude-code-guide | ~70+ (skills/, mostly unrelated pentest content) | `.claude/skills/three-best-practices/` | MIT | Verbatim | MIT copyright notice (zebbern, 2025) added as `LICENSE` in this folder, copied from repo root |
| `tauri-concept` | github.com/pinkpixel-dev/tauri-skills | 53 (skills/) | `.claude/skills/tauri-concept/` | Apache-2.0 | Verbatim | Repo-root Apache-2.0 `LICENSE` copied in as `LICENSE.txt` — the skill's own frontmatter claims a per-skill `LICENSE.txt` that does not exist in the source; see PROVENANCE.md for this discrepancy |
| `tauri-security` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-security/` | Apache-2.0 | Verbatim | Same discrepancy note |
| `tauri-framework-security` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-framework-security/` | Apache-2.0 | Verbatim | Same |
| `tauri-config` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-config/` | Apache-2.0 | Verbatim | Same |
| `tauri-window` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-window/` | Apache-2.0 | Verbatim | Same |
| `tauri-build` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-build/` | Apache-2.0 | Verbatim | Same |
| `tauri-ipc` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-ipc/` | Apache-2.0 | Verbatim | Same |
| `tauri-app-plugin-permissions` | github.com/pinkpixel-dev/tauri-skills | 53 | `.claude/skills/tauri-app-plugin-permissions/` | Apache-2.0 | Verbatim | Same |

No skill's body text was edited or adapted — every installed `SKILL.md` and its bundled `references/`/`examples/` files are byte-identical to the source repository at the commit inspected (dates recorded in `DESIGN_SKILL_FOUNDATION_R1_RESEARCH.md`). The only additions this run made inside any installed skill folder are (a) a `PROVENANCE.md` and (b) a `LICENSE`/`LICENSE.txt` file where the skill folder itself lacked one, both clearly separated from the skill's own instructional content.

## Security / supply-chain review, per installed skill group

- **anthropics (`frontend-design`, `skill-creator`)**: `frontend-design` has no scripts at all. `skill-creator` bundles Python scripts that call `subprocess` exactly twice, both times to invoke `claude -p` (the Claude CLI itself, for its own eval-loop automation) or to launch a local static HTML viewer / webbrowser for reviewing eval results — no external network calls, no arbitrary shell execution, no credential handling, no auto-install behavior. Clean.
- **jakubkrehel (7 `better-*` skills)**: zero scripts, zero shell commands, zero network references anywhere in the installed content. Pure markdown instructions with explicit "write every fix in the project's own idiom" framing that itself reduces risk of the skill pushing an unwanted dependency or framework choice. Clean.
- **humbleteam (`design-review`)**: zero scripts. One reference file (`references/review-rubric.md`). Clean.
- **alton47 (6 `threejs-*` skills)**: zero scripts across all six installed folders; each `SKILL.md` is pure markdown with inline code *examples* (not executable files) demonstrating Three.js API usage. Clean.
- **zebbern (`three-best-practices`)**: zero scripts in the installed skill folder itself (all content is markdown rule files under `rules/`). The source repository as a whole contains unrelated penetration-testing tooling in sibling folders that was not inspected and is not installed; this is noted as a repository-hygiene observation, not a finding against the installed skill.
- **pinkpixel-dev (8 `tauri-*` skills)**: zero scripts in any of the eight installed skill folders (each contains only `SKILL.md` and, in some cases, an `examples/usage.md`). One script (`tauri-app-builder/scripts/audit_tauri_project.py`) exists elsewhere in the source repository, in a skill that was **not** installed; it was opened as a courtesy check and found to contain no `subprocess`/`os.system`/network calls. The generic bilingual filler padding present in 50 of 53 source skills (see research doc) was reviewed line-by-line for anything resembling a hidden instruction or an unusual permission ask — it does not contain either; it is inert, generic boilerplate text, not executable or directive content of concern.

**Overall security conclusion**: no shell commands, no network behavior beyond a skill's stated and expected purpose (Playwright browsing a user-given URL, in the one skill that was evaluated but not installed), no destructive operations, no hidden setup scripts, no unusual permission requests, and no global-modification behavior were found in anything installed. Nothing suspicious was found in anything reviewed, installed or not.

## License review summary

- **MIT** (jakubkrehel, alton47, humbleteam, zebbern): permissive, requires retaining the copyright notice — satisfied by copying each source repository's root `LICENSE` into every installed skill folder that lacked its own.
- **Apache-2.0** (anthropics's `frontend-design`/`skill-creator`, all 8 pinkpixel-dev skills): permissive, requires retaining copyright/attribution notices and marking modified files — satisfied by copying the license text verbatim into each folder and explicitly noting in `PROVENANCE.md` that no content modifications were made (so the "mark modified files" clause does not apply).
- No copyleft (GPL/AGPL) licenses were encountered in any of the eight researched repositories.
- No skill was installed without a clearly identified license.
