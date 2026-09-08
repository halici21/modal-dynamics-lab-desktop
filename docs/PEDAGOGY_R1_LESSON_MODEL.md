# Pedagogy R1 — lesson model

`LessonDefinition` is the typed content boundary between education and physics. It contains identity, chapter, workspace, prerequisites, question, objectives, physical experiment, equations, misconceptions, checkpoint, next concept, deterministic preset and eight lightweight steps.

The reusable `LearningPanel` renders QUESTION → PREDICT → EXPERIMENT → OBSERVE → EXPLAIN → EQUATION → CHECK → CONTINUE. It is a compact surface above the existing analysis deck, so the stage and controls remain visible. A learner may skip, restart, choose Explore, or switch to Inspect at any point.

A lesson preset is data. SDOF presets set validated parameters through App state; workspace presets select the existing module and leave numerical calculation to the existing CoreWorkbench. No formula is reimplemented in lesson components. User changes interrupt the lesson and remain authoritative.

`LessonMode` values are `learn`, `explore` and `inspect`. Explore preserves the current workbench. Inspect exposes existing matrices, residuals, normalization, FRF, force, energy and FE data. The modes are depths of one workspace.
