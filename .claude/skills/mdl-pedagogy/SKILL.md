---
name: mdl-pedagogy
description: Owns Modal Dynamics Lab's teaching sequence and misconception-avoidance for structural dynamics — the QUESTION/PREDICT/EXPERIMENT/OBSERVE/EXPLAIN/EQUATION/CHECK/CONTINUE lesson grammar, Learn/Explore/Inspect depth, and the project's own misconception map. Use when writing or reviewing any lesson content, guided experiment, onboarding sequence, or CAD Experience R3 teaching flow for SDOF, damping, modes, MDOF, FEM, or Free-Free. Not for which plot answers a physics question (mdl-scientific-visualization) or panel layout (mdl-cad-workbench).
---

# MDL Pedagogy

## The lesson grammar already in production — do not invent a new one

`docs/PEDAGOGY_R1_LESSON_MODEL.md` and the implemented `LearningPanel` (`src/education/LearningPanel.tsx`) define the canonical sequence:

```
QUESTION -> PREDICT -> EXPERIMENT -> OBSERVE -> EXPLAIN -> EQUATION -> CHECK -> CONTINUE
```

This is the authoritative grammar for Modal Dynamics Lab and Modal Dynamics Studio alike. It already satisfies `AGENTS.md` section 13's "show phenomenon -> manipulate it -> reveal relationship -> derive mathematics -> generalize" and the more general "phenomenon before formula" principle — treat that phrasing as a compatible restatement of the same rule, never as a second, competing grammar to reconcile. A new lesson skips steps only when a step is genuinely inapplicable (e.g. a CHECK with no meaningful wrong answer to catch), never for brevity alone.

Key implementation facts to preserve when extending lessons into CAD Experience R3:

- `LessonDefinition` is the typed content boundary between education content and physics — a lesson author writes questions, objectives, misconceptions, and step copy; it never reimplements a formula. Physics values flow from the existing solver through the existing app state, exactly as SDOF/damping presets already do.
- A lesson preset is data, not code with embedded numerics. This keeps `AGENTS.md` section 7's "displayed formulas and computed values must come from the same model" true for lesson content too.
- User interaction always wins: a learner's own parameter change interrupts the lesson and remains authoritative rather than being silently overwritten back to the preset.

## Depth, not separate content: Learn / Explore / Inspect

The three `LessonMode` values are depths of one workspace, not three different workspaces or three different narratives:

- **Learn**: the guided QUESTION-through-CONTINUE sequence, current workbench state simplified toward the smallest set of controls needed to answer the question.
- **Explore**: the current workbench preserved, direct manipulation available, no forced sequence.
- **Inspect**: full existing evidence surfaced — matrices, residuals, normalization, FRF, force, energy, FE data — for a user who wants the complete numerical picture.

`mdl-cad-workbench`'s Learn/Explore/Inspect panel-density rule is the structural expression of this same depth model; the two skills must describe one coherent ladder, never two different definitions of what "Inspect" means.

## Misconceptions are the design target, not an afterthought

`docs/PEDAGOGY_R1_MISCONCEPTIONS.md` catalogs the specific wrong beliefs each module must actively expose and correct (reproduced and extended in `references/PEDAGOGY_PATTERNS.md`). A new lesson step is well-designed when it is chosen because it exposes one of these misconceptions through direct manipulation, not because it is the next formula in a textbook's table of contents. Examples already catalogued: "higher modal number means larger displacement," "damping directly changes undamped omega_n," "critical damping is strongest damping," "a structure has one natural frequency," "free-free zero modes are numerical errors," "mode amplitude is actual displacement," "FRF amplitude is a mode shape," "response spectrum equals PSD."

When adding a module (forced response/FRF content, participation, FEM, Free-Free), first ask which misconception in the existing map — or which new one specific to that module — the lesson's EXPERIMENT step is designed to expose, and design the manipulable parameter around producing that exposure directly, not around covering the topic in the abstract.

## Gate

Before approving new or changed lesson content:

- The eight-step grammar is followed or a step's omission is justified in one sentence.
- The EXPERIMENT step lets the learner manipulate the actual physical parameter, not a stand-in control.
- The OBSERVE/EXPLAIN pair names the specific misconception being exposed and corrected (from the map or newly identified).
- The EQUATION step's formula is the same one driving the live computation, not a separately authored illustrative equation.
- Learn-mode simplification never removes the learner's ability to reach Explore/Inspect for the same content.
