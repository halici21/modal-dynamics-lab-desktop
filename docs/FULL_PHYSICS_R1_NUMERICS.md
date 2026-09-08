# FULL PHYSICS R1 — equations and numerical policy

All mechanical inputs use consistent SI: mass kg, translational displacement m, force N, stiffness N/m, viscous coefficient N·s/m, time s. Angular frequency is rad/s and f=omega/(2pi) is Hz. FE rotations are rad and generalized rotational forces are N·m.

## SDOF

Existing exact free solution solves m a+c v+k x=0 for m>0, c,k>=0. The critical label uses |zeta−1|<=1e−8; nearby roots are not snapped. Stable sinc/expm1 expressions and rationalized overdamped slow roots retain continuous x/v/a. At k=0, zeta is undefined; viscous slowing is solved directly.

Constant/harmonic forcing solves m a+c v+k x=F(t). A particular solution plus the exact homogeneous correction satisfies the requested initial conditions. Harmonic phasors use Re{X exp(i Omega t)}. At undamped resonance the secular particular term grows with time and steady is null. Constant-force k=0 uses a stable expm1/Taylor formulation as c tends to zero.

Hx=1/(k−m Omega²+i c Omega); Hv=i Omega Hx; Ha=−Omega² Hx. Magnitude, real/imaginary parts and signed phase are separate. Phase lag is atan2(c Omega,k−m Omega²). For k>0 the dynamic magnification is k |Hx|. The displacement resonance peak is omega_n sqrt(1−2 zeta²) only for zeta<1/sqrt(2); otherwise no positive interior peak is reported.

## Assembly

A spring or damper connecting i,j adds value*[1,-1;-1,1] to its two-DOF block. A ground connection adds to one diagonal. Zero coefficients and disconnected systems are valid; they may create multiple zero modes. Chain coefficient arrays retain N+1 positions including both supports; inactive boundary slots are omitted from assembly.

## Generalized symmetric eigenproblem

K phi=lambda M phi. Diagonal-equilibrated Cholesky computes M=L L^T. Two triangular solves form A=L^-1 K L^-T; tiny transformation asymmetry is averaged. ml-matrix's bundled symmetric Householder/QL routine solves A y=lambda y. Back-substitution yields phi=L^-T y. Vectors are mass normalized, their largest-magnitude component chooses a reproducible display sign, and modes are frequency sorted.

Negative eigenvalues larger than the zero threshold in magnitude cause an error. Small values within the threshold are classified zero and reported as such. A zero result can represent rigid motion or a mechanism; classification alone does not prove a physical rigid body.

Residual reported: ||K phi−lambda M phi||2 / [(N max|K|+|lambda| N max|M|)||phi||2]. This normwise backward error remains defined at lambda=0; a completely zero numerator/denominator gives zero. Orthogonality matrices and absolute/relative stiffness errors are exposed independently.

## Central tolerances

Source of truth: TOL in common.ts.

| Criterion | Value and scale |
|---|---|
| Input symmetry | 1e−12 times maximum absolute matrix entry |
| Equilibrated Cholesky pivot | greater than 1e−13 |
| Zero/negative eigenvalue | 2e−13 N max|A| |
| Eigen backward error | <=2e−9 |
| Mass orthogonality | <2e−9 |
| Classical damping off-diagonal | <=2e−9 max|Phi^T C Phi| |
| MAC comparison | 1e−8 |
| Degeneracy | 1e−7 local eigenvalue scale, at least zero threshold |
| Direct complex pivot | >1e−13 global dynamic-stiffness magnitude |
| FRF comparison policy | 2e−8; oracle tests use tighter absolute checks |
| Integration reference | 2e−4 nominal policy; actual convergence/error metrics recorded |
| FE convergence policy | 0.5%; actual refined errors substantially smaller |

These are floating-point numerical criteria, not material tolerances. Extremely ill-scaled systems or modes below the resolvable spectral scale may be rejected/classified zero. Higher precision is not implemented.

## Modes, subspaces and tracking

phi and −phi are equivalent. Max normalization and mass normalization are separate. MAC=(a^T M b)^2/[(a^T M a)(b^T M b)]. subspaceOverlap mass-orthonormalizes two equal-rank bases and returns their mean squared principal cosine, invariant to rotations within a repeated eigenspace.

Tracking uses a global bitmask assignment maximizing MAC with a small normalized frequency-distance tie cost. It is bounded to N<=10. Degenerate/near-degenerate clusters, weak matches and similar alternatives are explicitly ambiguous. The UI never promises a unique eigenvector identity inside a repeated subspace.

## Modal coordinates and classical damping

For any complete independent basis, project solves (Phi^T M Phi)q=Phi^T M x. For mass-normalized eigenvectors this reduces to q=Phi^T M x. Reconstruction is x=Phi q. Undamped q=q0 cos(omega t)+qd0 sin(omega t)/omega; a zero mode is q0+qd0 t.

C=alpha M+beta K with nonnegative coefficients. Modal c_i=alpha+beta lambda_i; zeta_i=c_i/(2 omega_i), undefined at omega_i=0. The two-target fit rejects nearly equal frequencies or negative fitted coefficients. A selected modal basis must diagonalize C for decoupled time/FRF APIs. Arbitrary coupled symmetric passive damping uses direct complex response or physical-coordinate Newmark; no complex-mode eigensolver is claimed.

modalForcedResponse projects real/imaginary force phasors by Phi^T, solves every classical scalar equation analytically and reconstructs total x/v/a.

## Frequency response and base motion

Z=K−Omega² M+i Omega C. Partial-pivot complex Gaussian elimination solves Z X=F; it never explicitly inverts Z to solve a single load. directFRF solves unit RHS columns. modalFRF sums phi_i phi_i^T/(lambda_i−Omega²+i c_i Omega). Truncated count is explicit.

Singular static free-free response and undamped poles are errors/gaps, never invented finite peaks. The UI uses scalar transfers when only one input/output pair is needed.

For uniform support displacement Y and influence r, relative Zr solves dynamic stiffness with Omega² M r Y. Absolute X=Zr+rY. For support acceleration Ag, the relative forcing is −M r Ag. These are distinct from an applied force FRF.

## Participation

L_i=phi_i^T M r, m_i=phi_i^T M phi_i, Gamma_i=L_i/m_i, M_eff=L_i²/m_i. Total=r^T M r. Ratios and cumulative sums use this total; a zero influence vector is rejected. Complete-basis mass sum and arbitrary normalization/sign invariance are tested.

## Time integration and spectra

Newmark average acceleration beta=1/4, gamma=1/2 uses fixed dt and a factored effective SPD matrix K+4M/dt²+2C/dt. Initial acceleration is solved from force balance. x/v/a are integration state, not finite differences of rendered data. Callback outputs must be finite, correctly dimensioned vectors.

Sampled records use piecewise-linear interpolation and reject times outside the record. Integration is bounded to 200000 steps per call. Stability does not imply temporal accuracy: convergence against analytical free/forced response is required.

Response spectra integrate z''+2 zeta omega z'+omega²z=−Ag(t) with zero initial conditions. Sd=max|z| over the supplied record interval; pseudo-Sv=omega Sd, pseudo-Sa=omega² Sd. No FRF-derived surrogate is used. Internal subdivision is at least 80 steps per period plus the requested record substeps. Maxima between sampled integration times and post-record free decay are not automatically included; record duration and refinement matter.

## PSD

One-sided stationary PSD density is per Hz. Scalar Sx=|H(2pi f)|² Sf; independent vector input gives H diag(Sf) H*. Output cross spectra are Hermitian. Variance is the trapezoidal integral over Hz and RMS its square root. For a per-rad/s density, S_f=2pi S_omega. Do not use both conversion factors.

The UI rejects undamped poles inside the PSD band; stationary variance there is not finite. Arbitrary narrow peaks require frequency-grid convergence. The foundation does not implement correlated multi-support random excitation or stochastic time-history generation.

## Independent sources and reproducibility

- [LAPACK generalized symmetric definite reduction](https://www.netlib.org/lapack/lug/node54.html)
- [ml-matrix source and documentation](https://github.com/mljs/matrix)
- [OpenSees Newmark formulation](https://opensees.github.io/OpenSeesDocumentation/user/manual/analysis/integrator/Newmark.html)
- [TU Delft Euler–Bernoulli formulation](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/euler_bernouilli.html)

scripts/generate-physics-oracles.py uses NumPy/SciPy eigh, solve, independent Hermite quadrature, DOP853 and adaptive PSD quadrature. Its deterministic frozen fixture is tests/fixtures/full-physics-oracle.json. Runtime has no Python dependency. Numerical maxima are written by tests to docs/validation/full-physics-r1/numerical.json.
