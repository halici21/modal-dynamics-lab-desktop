# Pedagogy R1 — misconception map

| Misconception | Where it appears | Exposing experiment | Correcting evidence |
|---|---|---|---|
| Higher modal number means larger displacement | Modes/MDOF | switch mode and scale normalization | relative shape and frequency are separate |
| Natural frequency is playback speed | SDOF | change playback rate without parameters | ωₙ readout stays fixed |
| Mode amplitude is actual displacement | Modes/FEM | change visual amplitude | scale label and normalized vector |
| Eigenvector sign changes physics | Modes | flip sign | same relative pattern and frequency |
| Damping directly changes undamped ωₙ | Damping | vary c while holding m,k | ωₙ versus ωd are distinct |
| Critical damping is strongest damping | Damping | compare critical and overdamped return | fastest non-oscillatory return |
| Resonance always occurs exactly at ωₙ | Forced/FRF | change damping and sweep Ω | damped peak can shift |
| A structure has one natural frequency | 2DOF/MDOF | add coordinates | mode count follows coordinates, with zero-mode caveats |
| Every mass moves in the same direction | Modes | animate higher modes | relative sign changes |
| Free-free zero modes are numerical errors | Free-Free | inspect rigid pattern | KφRB=0 and no strain |
| Solver Mode 7 is seventh elastic mode | Free-Free | count rigid modes first | mode index is not elastic class |
| Six rigid modes are exact named vectors | Free-Free | change geometry/reference | basis depends on model geometry |
| Effective mass is one component mass | Participation | vary influence vector | Γ and cumulative modal mass |
| FRF amplitude is a mode shape | FRF | change input frequency | FRF is input-output behavior |
| FEM display is actual response amplitude | FEM | alter display scale | scale is explicitly visual |
| More elements always means more useful modes | FEM | refine mesh and compare convergence | approximation changes, physical question stays |
| Response spectrum equals PSD | Spectra | compare record maxima and density/RMS | separate evidence views and equations |
| A mode exists only under forcing | Modes | free-vibration preview | eigenpatterns exist without external force |

The lesson model keeps each check short and lets the learner manipulate the physical referent before the explanation.
