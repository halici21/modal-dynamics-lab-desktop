# FULL PHYSICS R1 — educational finite elements

Scope: small linear axial bars, Euler–Bernoulli bending beams and planar frames. No shear-flexible/Timoshenko, rotary-inertia correction, geometric stiffness, nonlinear materials, 3D solid/shell library, production mesher or proprietary-file import.

## Bar

Two local axial DOFs [u1,u2].
K_e=(EA/L)[[1,-1],[-1,1]].
M_e=(rho A L/6)[[2,1],[1,2]].
Only consistent mass is implemented.

## Euler–Bernoulli bending

Local DOFs [v1,theta1,v2,theta2], theta=dv/dx.
K_e=(EI/L³) times:

    12     6L    -12     6L
    6L    4L²    -6L    2L²
   -12    -6L     12    -6L
    6L    2L²    -6L    4L²

M_e=(rho A L/420) times:

    156     22L     54    -13L
    22L     4L²    13L    -3L²
     54     13L    156    -22L
   -13L    -3L²   -22L     4L²

This translational consistent mass follows the cubic Hermite displacement interpolation. The development oracle independently integrates N^T rho A N and B^T EI B rather than copying these coefficient matrices.

## Planar frame and transformation

Per node [u,v,theta]; combine axial blocks at indices [0,3] and bending blocks at [1,2,4,5]. With c=dx/L and s=dy/L, each node's local transformation block is [[c,s,0],[-s,c,0],[0,0,1]]. Local displacement=T global displacement; K_global=T^T K_local T and M_global=T^T M_local T. Rotated cantilevers retain the eigenvalues and local/global virtual work. No artificial penalty springs enforce constraints.

## Assembly and constraints

FEModel stores nodes [x,y], element node indices, E/rho, A/I, kind and constrained global DOF indices. Each element returns its DOF map, length and matrices. Assembly sums local contributions into dense global M/K. Essential constraints are eliminated by index; reduced modes are expanded with exact zeros at constrained DOFs.

Uniform educational presets support cantilever, fixed-fixed, pinned and free-free boundaries. Bar/beam models require increasing horizontal nodes. Arbitrarily oriented elements use the frame formulation. Interactive meshes offer 1,2,4,8 elements; the pure uniform helper supports up to 64, with small dense solver cost and conditioning limitations.

The same solveModal generalized eigensolver serves both chains and FE. No FE-specific eigen solver exists.

## Free-free interpretation

An axial model has one translational zero mode. A bending-only beam has two bending-plane zero modes (transverse translation and rotation). A suitable planar frame has three (Tx,Ty,Rz), never six. Independent geometric vectors are checked against assembled frame K. Disconnected models may have additional zero modes/mechanisms.

rigid3D returns Tx,Ty,Tz,Rx,Ry,Rz from theta cross (r−center), as conceptual kinematics only. It does not imply a 3D FE solver.

## Rendering

Expanded nodal modes retain translations/rotations. beamInterpolate evaluates cubic Hermite transverse displacement at normalized element coordinate s in [0,1]. CoreViews performs separate projection/amplification and frame local/global displacement mapping. Visual amplitude is arbitrary and clearly labeled; physical natural frequency is unchanged.

## Validation

Exact bar coefficients; quadrature-derived beam K/M; global symmetry, indexing and constraint expansion; rotated-frame eigenvalues and virtual work; free-free counts and K times rigid vectors; SciPy assembled modal fixtures for bar/beam/frame at 1,2,4,8,16 elements.

Continuum convergence checks:
- Fixed-free axial first omega=(pi/2L)sqrt(E/rho).
- Cantilever bending omega_j=b_j² sqrt(EI/(rho A L^4)), dimensionless b={1.875104068711961,4.694091132974174,7.854757438237612}.
- Coarse FE results are not expected to equal continuum values. Error must decrease under refinement.

See numerical.json for measured refined errors and FULL_PHYSICS_R1_REPORT.md for the final verdict.
