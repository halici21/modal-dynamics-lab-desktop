# Pedagogy R1 — curriculum

| Chapter | Lesson ID | Title | Workspace | Prerequisites | Checkpoint | Next |
|---|---|---|---|---|---|---|
| 1 | sdof-undamped | Why does the mass keep moving? | Undamped SDOF | — | Explain restoring force, inertia and energy exchange. | Damping |
| 2 | sdof-damped | Where does the energy go? | Damped SDOF | sdof-undamped | Identify under, critical and over damping from motion. | Forcing |
| 3 | forced-sdof | When does added energy accumulate? | Forced SDOF | sdof-damped | Predict the response near resonance. | FRF |
| 3 | frf | How does a system answer frequencies? | FRF | forced-sdof | Link a selected FRF point to stage frequency and phase. | 2DOF |
| 4 | two-dof | Why does another coordinate create another frequency? | 2DOF | sdof-undamped | Trace a coupling spring to K entries. | 3DOF/MDOF |
| 4 | mdof | How does the pattern generalize? | MDOF | two-dof | Predict N modes for a standard constrained system. | Modes |
| 5 | modes | What is a mode? | Mode Browser / 3DOF | two-dof | Explain relative shape, sign, normalization and selected-pattern reconstruction. | Base excitation |
| 6 | base-excitation | What if the support moves? | Base Excitation | forcing | Distinguish absolute and relative motion. | Participation |
| 6 | participation | Why do some modes participate more? | Participation / Effective Mass | modes, base-excitation | Explain Γ and cumulative mass. | Free-Free |
| 7 | free-free | What does zero frequency mean? | Free-Free | modes | Identify rigid-body motion without strain. | Spectrum |
| 8 | response-spectrum | How can one record summarize many oscillators? | Response Spectrum | damped SDOF | Distinguish oscillator maxima from time history. | Random vibration |
| 8 | random-vibration | How do we describe excitation statistically? | Random Vibration | FRF | Trace input PSD to output PSD and RMS. | FEM |
| 9 | fem-modal | How does a beam become an eigenproblem? | FE Modal | modes, MDOF | Explain element DOFs, assembly and mesh convergence. | independent FEM |

Each lesson is represented by typed data in `src/education/curriculum.ts`. The Mode Browser / 3DOF workspace is the single physical route for the Mode concept; modal superposition is a deeper concept in the same route. No duplicate physics screen exists.





