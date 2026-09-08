# Pedagogy R1 — test matrix

| Area | Coverage | Evidence |
|---|---|---|
| Content contract | 13 module mappings, prerequisites, equations, checkpoints | curriculum unit tests |
| Progress | start, practice, completion, corrupted storage fallback | progress unit tests |
| Lesson flow | prediction gating, experiment, completion, skip, restart | Playwright interaction tests |
| Bypass | Explore and Inspect are always selectable; rail remains direct | workbench interaction test |
| Persistence | localStorage write/read, last workspace and lesson | progress tests |
| Accessibility | named mode buttons, prediction group, focus-visible, axe | UI/a11y suite |
| Reduced motion | static lesson remains actionable with step and equation | interaction test |
| Regression | physics and existing visual suite | npm test / npm run test:ui |
| Runtime | typecheck, Vite build, Tauri build | release validation |

Pedagogy tests are deterministic and do not weaken the physics suite. Lesson state is outside the simulation frame hot path.

Measured release run: npm test = 85 passed; npm run test:ui = 100 passed; npm run test:performance = 60.0 FPS, 16.67 ms average, one active loop, zero React commits during playback; typecheck, Vite build and Tauri build passed.

