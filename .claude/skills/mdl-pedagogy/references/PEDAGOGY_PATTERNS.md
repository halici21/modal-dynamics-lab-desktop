# Pedagogy patterns

## The misconception map (source: docs/PEDAGOGY_R1_MISCONCEPTIONS.md)

Treat `docs/PEDAGOGY_R1_MISCONCEPTIONS.md` as the live source of truth; this table is a working copy for quick reference while authoring lessons, not a fork of it.

| Misconception | Where it appears | Exposing experiment | Correcting evidence |
|---|---|---|---|
| Higher modal number means larger displacement | Modes/MDOF | Switch mode and scale normalization | Relative shape and frequency are separate |
| Natural frequency is playback speed | SDOF | Change playback rate without parameters | omega_n readout stays fixed |
| Mode amplitude is actual displacement | Modes/FEM | Change visual amplitude | Scale label and normalized vector |
| Eigenvector sign changes physics | Modes | Flip sign | Same relative pattern and frequency |
| Damping directly changes undamped omega_n | Damping | Vary c while holding m, k | omega_n versus omega_d are distinct |
| Critical damping is strongest damping | Damping | Compare critical and overdamped return | Fastest non-oscillatory return |
| Resonance always occurs exactly at omega_n | Forced/FRF | Change damping and sweep Omega | Damped peak can shift |
| A structure has one natural frequency | 2DOF/MDOF | Add coordinates | Mode count follows coordinates, with zero-mode caveats |
| Every mass moves in the same direction | Modes | Animate higher modes | Relative sign changes |
| Free-free zero modes are numerical errors | Free-Free | Inspect rigid pattern | K*phi_RB=0 and no strain |
| Solver Mode 7 is seventh elastic mode | Free-Free | Count rigid modes first | Mode index is not elastic class |
| Six rigid modes are exact named vectors | Free-Free | Change geometry/reference | Basis depends on model geometry |
| Effective mass is one component mass | Participation | Vary influence vector | Gamma and cumulative modal mass |
| FRF amplitude is a mode shape | FRF | Change input frequency | FRF is input-output behavior |
| FEM display is actual response amplitude | FEM | Alter display scale | Scale is explicitly visual |
| More elements always means more useful modes | FEM | Refine mesh and compare convergence | Approximation changes, physical question stays |
| Response spectrum equals PSD | Spectra | Compare record maxima and density/RMS | Separate evidence views and equations |
| A mode exists only under forcing | Modes | Free-vibration preview | Eigenpatterns exist without external force |

## Extending the map for CAD Experience R3

When a new module or CAD-workbench feature is proposed, check first whether it exposes a misconception already on this list before assuming a new row is needed. If a genuinely new misconception is identified (e.g. something specific to a Property Manager exposing a parameter for the first time, or a ViewCube-driven view change), add it here and to `docs/PEDAGOGY_R1_MISCONCEPTIONS.md` together — the two must not drift apart.

## Lesson-writing checklist

1. State the QUESTION in terms of the physical phenomenon, not the formula ("why does a heavier mass swing slower?" not "what is omega_n = sqrt(k/m)?").
2. Ask for a PREDICT before revealing the answer — a lesson that shows the result before asking for a guess loses the "phenomenon before formula" value entirely.
3. Design EXPERIMENT around the one parameter that most directly produces the misconception's wrong-vs-right contrast.
4. OBSERVE should point at a specific, nameable readout (a number, a shape, a color) the learner can compare before/after — not a vague "notice what changed."
5. EXPLAIN in plain language before EQUATION in formal notation — the equation should feel like the natural formalization of what was just observed, not a new topic.
6. CHECK should be answerable from the experiment just run, not from outside knowledge.
7. CONTINUE should state the next concept's relationship to this one (e.g. "now that you've seen a single natural frequency, what happens with two masses?") rather than a bare "next" label.
