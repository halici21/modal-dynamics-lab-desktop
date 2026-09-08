# VISUAL EXPERIENCE R2 — renderer decision

## Prototypes

A (refined SVG) uses the production clock and `modalResponse` state to move three semantic SVG masses. It keeps labels, keyboard/accessibility and the physical reference line in one inspectable DOM. It was captured at `docs/validation/full-physics-r1/r2-prototype-a-before.png`.

B (Three.js 2.5D) uses a fixed orthographic camera, procedural boxes, spring spans, local lights and a capped DPR. It is driven by the same state and calls `renderer.render` from the existing clock subscription. It was captured at `r2-prototype-b-browser.png`.

C (spatial Three.js) uses the same objects with a fixed restrained perspective camera. It adds meaningful depth and orientation without free orbit. It was captured at `r2-prototype-c-browser.png`.

## Score (1–5)

| Criterion | A SVG | B 2.5D | C spatial |
|---|---:|---:|---:|
| Physical clarity | 5 | 4 | 3 |
| Beauty / depth | 3 | 5 | 5 |
| Pedagogy | 5 | 4 | 3 |
| Performance | 5 | 4 | 3 |
| Maintainability | 5 | 4 | 3 |
| Desktop compatibility | 5 | 4 | 3 |
| Accessibility | 5 | 3 | 2 |
| MDOF/FEM scalability | 4 | 4 | 3 |
| Total | 37 | 32 | 25 |

## Decision

A is the production renderer for R2. It provides the clearest cause → object → equation relationship, survives 900×680 and reduced motion without a separate fallback, and preserves semantic inspection. B remains a functioning, source-owned renderer option behind a narrow boundary for a future flagship stage. C remains a deliberately evaluated spatial prototype and is rejected for production because labels, high-density MDOF and minimum-window readability degrade before the depth adds educational value.

This is a hybrid-ready decision: 2D plots and SVG evidence remain authoritative, while B can be promoted for selected hero scenes after a Tauri/WebView2 GPU gate. No production workspace imports the prototype lab as an accidental second stage.
