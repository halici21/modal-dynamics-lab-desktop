# Pedagogy R1 — file inventory

## Education architecture

- `src/education/curriculum.ts` — typed 13-workspace curriculum, prerequisites, presets, equations and steps.
- `src/education/progress.ts` — local-only progress schema, safe persistence and corrupted-state fallback.
- `src/education/glossary.ts` — compact local term definitions kept outside physics ownership.
- `src/education/LearningPanel.tsx` — Learn/Explore/Inspect surface and deterministic lesson flow.
- `src/components/LearningTrajectory.tsx` — direct rail plus Current/Next/Completed/Recommended status labels.
- `src/components/Workbench.tsx` — optional learning surface slot shared by SDOF and core workspaces.
- `src/app/CoreWorkbench.tsx` — existing numerical workspaces with pedagogy surface injection.
- `src/app/App.tsx` — progress, lesson preset authority and workspace routing.
- `scripts/measure-performance.mjs` — current scrub control selector used by the release performance harness.

## Documentation

- `PEDAGOGY_R1_AUDIT.md`
- `PEDAGOGY_R1_CONCEPT_GRAPH.md`
- `PEDAGOGY_R1_CURRICULUM.md`
- `PEDAGOGY_R1_MISCONCEPTIONS.md`
- `PEDAGOGY_R1_NOTATION.md`
- `PEDAGOGY_R1_LESSON_MODEL.md`
- `PEDAGOGY_R1_TEST_MATRIX.md`
- `PEDAGOGY_R1_WALKTHROUGH.md`
- `PEDAGOGY_R1_FILES.md`
- `PEDAGOGY_R1_REPORT.md`
- `validation/pedagogy-r1/validation-summary.json` and `validation/browser-performance.json` — release and performance evidence.

Physics source files are outside this inventory by design and remain frozen.





