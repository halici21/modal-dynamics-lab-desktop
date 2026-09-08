# Pedagogy R1 — workspace audit

The existing workbench already had validated stage, parameters, lenses, plots, matrices and inspectors. The audit found that the thirteen modules were reachable but presented as calculators: no explicit prerequisite relationship, no prediction before explanation, no shared lesson state, and no local resume. R1 adds a compact learning layer without replacing the workbench.

| Workspace | Concept | Prior knowledge | First phenomenon | Equation after observation | Misconception to expose | Experiment / prediction | Next |
|---|---|---|---|---|---|---|---|
| Undamped SDOF | restoring force, inertia, ωₙ | basic position | mass crosses equilibrium and repeats | mẍ+kx=0; ωₙ=√(k/m) | playback speed is frequency | double k; predict faster | Damping |
| Damped SDOF | dissipation and regimes | undamped motion | energy decays | Fᵈ=−cẋ; ζ | critical means strongest damping | compare c=0, critical, overdamped | Forcing |
| Forced SDOF | input energy, resonance | ωₙ and damping | amplitude grows near excitation frequency | mẍ+cẋ+kx=F₀cosΩt | resonance always exactly ωₙ | sweep Ω | FRF |
| 2DOF | coupling, matrix origin | SDOF | two coordinated patterns | Mẍ+Kx=0 | one structure has one frequency | select spring and reveal four K entries | 3DOF/MDOF |
| Mode Browser / 3DOF | eigenvectors as patterns | coupled system | relative sign and amplitude change | Kφ=ω²Mφ | modal amplitude is displacement | flip sign and normalization | Modal superposition |
| MDOF | generalization and nodes | 2DOF modes | more coordinates create more patterns | x=Φq | higher index means larger motion | increase DOF, find nodal points | Modes |
| FRF | frequency-dependent input/output | forcing | magnitude and phase vary with Ω | H=X/F | FRF amplitude is a mode shape | scrub a point and inspect stage | 2DOF |
| Base Excitation | absolute vs relative motion | forcing | support and mass move differently | x=y+z | base motion equals mass motion | change base frequency | Participation |
| Participation | directional modal content | modes and base motion | some modes contribute more | Γᵢ and M_eff | effective mass is one component mass | change influence direction | Free-Free |
| Free-Free | rigid-body modes | modes | whole body moves without strain | KφRB=0; f≈0 | zero modes are solver errors | switch rigid/elastic patterns | Spectrum |
| Response Spectrum | record summarized across oscillators | damped SDOF | each oscillator reaches a maximum | record→family→max | spectrum equals PSD | edit record | Random vibration |
| Random Vibration | stochastic frequency content | FRF | input PSD becomes output PSD and RMS | Sx=|H|²Sf | PSD equals response spectrum | change level/band | FEM |
| FE Modal | discretization and assembly | matrices and modes | beam becomes elements and global matrices | Ke,Me→K,M; Kφ=ω²Mφ | drawn deformation is actual response | refine mesh and compare convergence | independent FEM interpretation |

Essential controls are the physical parameters, playback/scrub, mode/coordinate selection, and the lesson checkpoint. Matrix editors, normalization, residuals and numerical diagnostics remain expert/Inspect depth. The first-run path begins on the moving SDOF stage and never blocks direct access.
