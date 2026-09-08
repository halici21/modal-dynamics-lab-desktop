# FULL PHYSICS R1 — test matrix

## Commands

- npm test
- npm run typecheck
- npm run build
- npm run test:ui
- npm run test:physics-oracles (development Python/NumPy/SciPy only)
- npm run test:physics-performance
- npm run desktop:dev
- npm run desktop:build

## Numerical suite

| Area | Independent evidence |
|---|---|
| Undamped/damped SDOF | Existing 21 numerical tests, analytical roots, derivatives, energy and Simpson dissipation integration |
| Forced SDOF | Constant/harmonic cases at c=0,4,20,40; IC, finite differences and ODE; undamped secular resonance; stable k=0,c→0 |
| Generic chain | N=2,3,4,5,10 fixed-fixed formula; fixed-free/free-free formulas; spring/damper assembly and disconnected zeros |
| Full M eigenproblem | Six deterministic SciPy SPD cases N=2,3,4,5,10,16; eigenvalues and mass MAC to independent vectors |
| Scaling/invalid systems | Mass/stiffness scales 1e−12…1e12; indefinite/singular/nonfinite/asymmetric matrices; invalid connectivity |
| Normalization and tracking | Sign/max/mass invariance, projection/reconstruction, global crossing assignment, repeated-space ambiguity and basis-invariant overlap |
| Modal dynamics | IC reconstruction, free/damped 5DOF response, independent time derivatives, energy decay and equation residual |
| Modal forcing | Classical harmonic transient response reconstructed into physical-coordinate force balance |
| Rayleigh | Two-target fit and round-trip, modal diagonalization, safe zero mode and coupled-C rejection in decoupled APIs |
| Frequency response | SciPy complex solves; direct/modal/full/scalar consistency; static/inertial limits; poles, mobility and accelerance |
| Base motion | Absolute minus relative equals imposed base; displacement/acceleration forcing equivalence |
| Participation | Complete mass sum, cumulative 100%, arbitrary normalization/sign invariance |
| Newmark | Free/forced SDOF timestep refinement with second-order convergence |
| Spectrum | Recorded acceleration, DOP853 independent peaks and pseudo spectra |
| PSD | Adaptive quadrature independent variance, per-Hz convention, Hermitian independent-input output PSD |
| FE | Exact bar, quadrature-derived beam matrices, indexing/elimination, all three element families against SciPy, rotated frame virtual work |
| FE convergence | 2/4/8/16 element axial and first three bending-mode errors decrease toward continuum theory |
| Free-free FE | Bar 1, bending beam 2, planar frame 3 zero modes; geometric frame rigid basis annihilated by K |
| Rigid kinematics | 2D/3D vector identities and exact finite rotation preserving interpoint distances |

Current unit suite: 81 tests across 6 files. 39 existing tests are preserved; full-physics.test.ts contributes 42 cases including parameterized cases. Fixtures and maxima reside in tests/fixtures/full-physics-oracle.json and docs/validation/full-physics-r1/numerical.json.

## Interaction and visual suite

90 tests total: 43 interaction/accessibility/lifecycle tests and 47 visual states. Existing 68 cases are retained with documented integration updates; 10 functional tests plus 12 new major visual states exercise the new workspaces.

New functional scenarios:
1. Every required workspace opens, transport is visible, no page errors/nonfinite displays.
2. 2DOF/3DOF oracle values and mode selection.
3. 10DOF scrub synchronization, one RAF, zero React frame commits, repeated switch cleanup.
4. Matrix editor rejection, passive coupled damping and direct FRF.
5. Free-free zeros, participation sum, normalization/sign.
6. Forced resonance, base response, FRF and PSD.
7. Spectrum record calculation and invalid samples.
8. Frame free-free counts, mesh change, actual interpolated stage.
9. Axe audits across new workspaces, both appearances and minimum size.
10. Reduced-motion static mode with exact scrub.

## Intentional legacy test updates

- The obsolete “future labs disabled” assertion now requires all completed lab buttons to be enabled. Independent new physics navigation/eigenvalue tests supplement this.
- Damping tests select the existing “Damping control authority” combobox by name because the new header contains another combobox. No expected physical values changed.
- A paused-RAF assertion now polls for settled zero, allowing the existing one-shot ResizeObserver input job. It still requires no continuous paused loop.
- New full-r1-* visual baselines preserve all historical v0/v1/v2/r1 images. Header workspace selection and enabled rail entries are intentional changes, with the old SDOF stage/layout otherwise retained.

## Visual review

docs/validation/full-physics-r1/visual-review.png provides a contact sheet of representative chains, modes, FRF, participation, spectrum, PSD, FE, minimum/light and retained SDOF/damping states. Detailed PNG baselines remain in tests/visual. No screenshot tolerance was relaxed.

## Desktop/performance acceptance

The report records the actual native build, EXE, installer, offline, minimize/restore, resize and minimum-window outcomes. Evidence must distinguish emulated DPR from physical multi-monitor DPI validation. Performance files distinguish numerical benchmark timing, RAF cadence, React commits and input-to-SVG mutation from optical display latency.

The preserved engine source comparison is engine-regression.json: all seven preexisting physics/animation files match their prior hashes.
