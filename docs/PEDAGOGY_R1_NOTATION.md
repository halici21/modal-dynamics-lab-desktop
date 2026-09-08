# Pedagogy R1 — notation and units

| Symbol | Meaning | Unit |
|---|---|---|
| m, M | scalar mass / mass matrix | kg |
| k, K | stiffness / stiffness matrix | N/m (or rotational equivalent) |
| c, C | viscous damping / damping matrix | N·s/m |
| x, v, a | displacement, velocity, acceleration | m, m/s, m/s² |
| ωₙ, ωd | undamped and damped angular frequency | rad/s |
| f | cyclic frequency | Hz |
| T | period | s |
| ζ | damping ratio | — |
| φ, Φ | mode vector / modal matrix | normalized representation |
| q | modal coordinate | depends on normalization |
| λ | eigenvalue ω² | rad²/s² |
| Γ | participation factor | depends on influence vector |
| H | frequency response function | output/input |
| PSD, RMS | power spectral density, root mean square | declared per Hz / signal unit |
| FEM | finite element method | — |

The UI always labels Hz separately from rad/s. Frequency-domain axes name their unit. Notation is shared across equation, inspector, matrix and lesson content; prose does not replace values produced by the physics API.

## Compact glossary

The local glossary in `src/education/glossary.ts` keeps explanations short and contextual: DOF is an independent coordinate; natural frequency is the free-vibration frequency of a mode; angular frequency is measured in rad/s; period is one cycle; c is the viscous damping coefficient; ζ is damping ratio; critical damping is the oscillatory boundary; a mode pairs frequency and pattern; mode shape is relative; eigenvalue is λ=ω²; eigenvector supplies φ; normalization rescales representation; orthogonality separates modal directions; q is a modal coordinate; modal superposition combines patterns; FRF maps input to output by frequency; resonance is a large sensitive forced response; phase is relative timing; Γ is the participation factor; effective modal mass depends on excitation direction; a rigid-body mode has no strain; response spectrum records oscillator maxima; PSD distributes stochastic power by frequency; RMS measures magnitude; FEM assembles local element models; elements contain nodes and DOFs; boundary conditions constrain or prescribe motion.
