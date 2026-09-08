# Modal Dynamics Lab — Pedagogy / Course Flow R1

## 1. Previous baseline regression

Pedagogy / Course Flow R1 is layered on the validated Visual Experience R2 desktop foundation. The R2 workbench, shared simulation clock, renderer study, physics modules, accessibility contract and Tauri shell remain in place. No physics or animation source was changed.

## 2. Pedagogical problems identified

The thirteen workspaces were reachable but behaved like separate calculators. They lacked an explicit prerequisite graph, a prediction before explanation, a shared lesson state, a first-run path, local resume, and a clear expert bypass. R1 addresses those gaps with a data-driven education layer over the existing workbench.

## 3. Final curriculum

The curriculum has nine chapters and thirteen deterministic lessons: restoring force and natural frequency; damping; forced response and FRF; coupled coordinates and MDOF generalization; modes and modal superposition; support motion and participation; free-free systems; response spectra and random vibration; and finite-element modal analysis. Every lesson has prerequisites, objectives, a physical experiment, equations, misconceptions, a checkpoint, a next concept and an eight-step flow.

1. Why systems vibrate — Undamped SDOF.
2. Why motion disappears — Damped SDOF.
3. What happens when we keep forcing it — Forced SDOF, FRF.
4. Why structures have multiple natural frequencies — 2DOF and MDOF/3DOF generalization.
5. What a mode really is — Mode Browser / Modal Superposition.
6. How support motion excites modes — Base Excitation, Participation / Effective Mass.
7. What happens when nothing is fixed — Free-Free.
8. How real environments are represented — Response Spectrum, Random Vibration.
9. How continuous structures become matrices — FEM Modal.

## 4. Concept dependency graph

The dependency path is restoring force → natural frequency → damping → forced response → FRF → coupled coordinates → eigenproblem → mode shapes → normalization/sign → modal superposition → base excitation → participation/effective mass → free-free rigid modes → spectrum/PSD → FEM assembly. The graph and evidence table are in [PEDAGOGY_R1_CONCEPT_GRAPH.md](PEDAGOGY_R1_CONCEPT_GRAPH.md).

## 5. Learn / Explore / Inspect

Learn runs QUESTION → PREDICT → EXPERIMENT → OBSERVE → EXPLAIN → EQUATION → CHECK → CONTINUE. Explore preserves direct manipulation of the current workbench. Inspect exposes the existing matrices, residuals, normalization, FRF, force, energy and FE diagnostics. These are depths of one workspace; none locks the rail or creates a second application.

## 6. First-run experience

A cleared local state opens on moving Undamped SDOF with the question “What carries the mass through equilibrium after the spring pulls it back?” The learner must choose a prediction before Observe and run the deterministic stiffness experiment before Explain. Skip, restart and Explore are visible from the same surface.

## 7. Undamped SDOF

The first lesson makes restoring force, inertia, energy exchange and natural frequency concrete on the stage. Its preset is m=1, k=100, x₀=0.1, v₀=0, and the equation reveal uses mẍ+kx=0 and ωₙ=√(k/m). The lesson explicitly separates playback rate from physical frequency.

## 8. Damping

The damping lesson compares zero, light, critical and overdamped behavior while keeping the analytical SDOF model authoritative. It connects Fᵈ=−cẋ and ζ=c/(2√(km)) to amplitude, velocity and energy decay, and asks which setting returns fastest without overshoot.

## 9. Forced response / FRF

Forced SDOF introduces input energy and the frequency ratio r=Ω/ωₙ, followed by FRF as a linked input-output view H(Ω)=X/F. The experiment sweeps or scrubs frequency and requires a prediction before the response and phase explanation. Existing force, FRF and stage coupling remain the source of computed values.

## 10. 2DOF / 3DOF / MDOF

The coupled-system sequence starts from the physical coupling spring, then reveals Mẍ+Kx=0 and (K−ω²M)φ=0. The 3DOF mode browser and MDOF workspace generalize the idea to multiple patterns and nodal points. Matrix editors and eigensolver diagnostics remain in Inspect.

## 11. Modes / Modal Superposition

Learners distinguish relative shape, sign, normalization and frequency, then connect selected patterns to x=Φq. The curriculum treats the existing Mode Browser / 3DOF workspace as the physical referent and explains that φ and −φ represent the same mode.

## 12. Base Excitation / Participation

The support-motion lesson uses x=y+z to distinguish absolute and relative motion. Participation then changes the influence direction and observes Γᵢ and cumulative effective mass, showing why modes contribute differently without hiding the existing numerical diagnostics.

## 13. Free-Free

Free-Free introduces rigid-body motion as a physical zero-strain phenomenon. The lesson checks KφRB=0 and fRB≈0, and asks the learner to switch between rigid and elastic patterns. Zero modes are explained as a boundary-condition result rather than a solver failure.

## 14. Response Spectrum / Random Vibration

Response Spectrum explains a record-to-family-to-maximum transformation for damped oscillators. Random Vibration follows with the frequency-domain relationship Sₓ=|H|²Sᶠ and RMS interpretation. The lessons explicitly distinguish spectrum maxima from PSD density and output variance.

## 15. FEM Modal

FE Modal closes the course by connecting element DOFs and element matrices to global K and M, then to Kφ=ω²Mφ. Mesh refinement and convergence are the controlled experiment; the existing bar, beam and frame implementations remain the calculation authority.

## 16. Misconceptions addressed

Each lesson names a misconception before the equation reveal. Covered cases include “playback speed is frequency,” “critical means strongest damping,” “resonance is always exactly ωₙ,” “one structure has one frequency,” “modal amplitude is displacement,” “base motion equals mass motion,” “zero modes are solver errors,” “spectrum equals PSD,” and “drawn deformation is actual response.”

## 17. Guided experiments

Experiments are deterministic data presets, not reimplemented physics. SDOF presets update validated App state; workspace presets route to the existing module and lens. User edits remain authoritative and interrupt a lesson, so the learner can compare a controlled change with a free exploration.

## 18. Challenges / checkpoints

Every lesson has one short checkpoint asking what changed, what stayed fixed and why the result follows. Prediction is gated before observation, experiment execution is gated before explanation, and completion is local state. Skip and restart allow challenge-free inspection without removing the checkpoint from the guided path.

## 19. Glossary / notation

The notation guide and local glossary define x, y, z, m, c, k, Ω, ωₙ, ζ, F₀, H, M, K, φ, Φ, q, Γ, M_eff, PSD, RMS, FEM, DOF, elements, nodes and boundary conditions. Symbols are introduced at the physical referent, then connected to equations and the existing inspector. See [PEDAGOGY_R1_NOTATION.md](PEDAGOGY_R1_NOTATION.md).

## 20. Progress / resume

Progress is local-only under `modal-dynamics-lab:pedagogy:v1`. It records started, practiced, completed, status, last lesson, last workspace and mode. Reads are schema-safe; corrupted JSON falls back to an empty first run. The rail reports Completed, Current, Next and Recommended prerequisite while preserving direct navigation. A returning learner can resume the persisted last workspace without being trapped there. No account, cloud sync or AI tutor is introduced.

## 21. Files

The implementation inventory is in [PEDAGOGY_R1_FILES.md](PEDAGOGY_R1_FILES.md). The core files are `src/education/curriculum.ts`, `src/education/progress.ts`, `src/education/glossary.ts`, `src/education/LearningPanel.tsx`, `src/components/LearningTrajectory.tsx`, `src/components/Workbench.tsx`, `src/app/CoreWorkbench.tsx`, and `src/app/App.tsx`. Physics and animation files are intentionally absent from the change set.

## 22. Tests

Validation completed with `npm test` (7 files, 85 tests passed), `npm run test:ui` (100 tests passed), `npm run typecheck`, `npm run build`, `npm run test:performance`, and `npm run desktop:build`. The UI suite includes prediction gating, mode bypass, skip persistence, corrupted storage, accessibility, reduced motion, visual snapshots and the full pre-R1 physics regression set.

## 23. Physics immutability

The SHA-256 manifest for the current physics and animation sources is recorded below; it is unchanged by this pass.

| File | SHA-256 |
|---|---|
| `src/physics/common.ts` | `CB43AE65BF6DC339898B6516EC4226B253B6EEA9321D25B8091B1B4D93B37F82` |
| `src/physics/contracts.ts` | `DA62BACDCD8AD11833045BEE9983323596835380EB54E6E07C581941EEAD9CA7` |
| `src/physics/dampedEquations.ts` | `91D0FEC661317F697A9A642B1D041439159697DC627E8517C6DF78FD92EA35D9` |
| `src/physics/dampingControl.ts` | `61E42F73864E710F02BAC37B60F7C6E202B1203DBBF25FDC3029354E8E540B3E` |
| `src/physics/dynamics.ts` | `5E9CC16100A9A042275B0A1211D5576682C1C362285F0ECD99ED71ADFFC88A4C` |
| `src/physics/fem.ts` | `CD9DE1A38B44DA798C74FDB8544B6594C5C40591AEBDC86DE0B65AFB97AFF3BA` |
| `src/physics/frequency.ts` | `1DC6B9A406D599F8CAC0089A3F7EF1EA9D4BB951AF1463EA6D082FE968198F0A` |
| `src/physics/modal.ts` | `2E05D99C061F78B548C38A70B388DC808738D90D68C7D77AE36E4697BFD8CC67` |
| `src/physics/rigid.ts` | `00FBECC483394C78628F073F812B7F1CB7868E6646A8E1A9CD609F0EA791D6A6` |
| `src/physics/sdof.ts` | `E42C9F8F3BC8A35AAD61ACF41417620571D23E7655B64A0F0468E55F13243D9E` |
| `src/physics/spectra.ts` | `5F1103501D2D9CA8A0948350BCC4521148914736F4CFE79161BC45EA630E9036` |
| `src/physics/systems.ts` | `702FA5EF9C020411DEA99D3092FCD5D9E34BF4A2916B184A15A062A5F3113EE0` |
| `src/animation/SimulationClock.ts` | `CF9BE7BF2557A656CBBDA3E4247FADD93101E39465B72A69156CD84A3BE95996` |
| `src/animation/lifecycle.ts` | `CF4BCA8275BE9A8D6D1C471F24474A1779C4D5AB0C379993DD4C6E4A1ABD27E8` |
| `src/animation/motion.ts` | `DBC61082AD1F522DF493CEE96652896E914D225823EAFDBFC35F1F750A02C853` |

## 24. Performance

Lesson state is outside the 60 FPS simulation frame path. The current Chromium harness measured 60.0 FPS, 16.67 ms average frame time, 16.8 ms worst frame, zero React commits during playback, one active loop and four subscribers. The 1000 play/pause cycle check left zero active loops. The new interactions are click-rate state changes and do not add per-frame work.

## 25. Desktop validation

`npm run desktop:build` produced the Windows executable and NSIS installer for Tauri 2 at `artifacts/modal-dynamics-lab.exe` and `artifacts/Modal Dynamics Lab_0.4.0_x64-setup.exe`. A packaged launch smoke test kept the executable alive for four seconds before clean termination. Offline/local-first behavior and narrow native boundaries remain unchanged.

## 26. Accessibility / reduced motion

Learning modes, prediction choices, checkpoints and transport controls have accessible names and keyboard paths. Focus-visible styling, both themes, status labels and axe checks remain covered. Reduced motion preserves the stage, scrub, step and lesson meaning while removing continuous decorative motion.

## 27. Visual QA

The full visual suite passed in dark, light, narrow, reduced-motion, force, energy, phase, math and workbench states. Snapshots were regenerated against the current learning surface and the existing R2 shell; no visual regression was accepted without the full UI run.

## 28. Internal walkthrough

The internal walkthrough covers beginner, engineering-student and expert personas. Beginner flow starts on SDOF and predicts before revealing equations; the student jumps to 2DOF or FRF and switches to Inspect; the expert bypasses lessons and uses matrices, residuals and FE diagnostics directly. See [PEDAGOGY_R1_WALKTHROUGH.md](PEDAGOGY_R1_WALKTHROUGH.md).

## 29. Known limitations

The lessons are intentionally concise and do not replace a full derivation. Existing workspaces remain the depth source for advanced equations and diagnostics. There is no cloud synchronization, account layer, AI tutor, authoring CMS or human usability study in this increment. Vite also reports the existing large Three.js chunks during production build; this is retained from the R2 renderer study and is not a pedagogy runtime regression.

## 30. Spec deviations

No frozen V1 physics scope, desktop runtime rule or animation contract was changed. FRF and workspace lesson presets route through existing modules; a new FRF-to-stage coupling algorithm, new solver, or new native capability was deliberately not added. This is a documented product-layer limitation, not a hidden physics change.

## 31. Pedagogy completion statement

“Can a learner now progress coherently from first-principles SDOF intuition through modal analysis and educational FEM using the application?” **YES.** The progression, prediction loop, deterministic experiments, local progress and expert bypass are implemented and validated on the existing workbench.

## 32. Release readiness

**PASS WITH NOTES.** Pedagogy / Course Flow R1 is ready for the requested final release polish and QA pass. That next pass has not been started automatically. The current release remains offline-first, Windows desktop, physics-preserving and locally resumable.










