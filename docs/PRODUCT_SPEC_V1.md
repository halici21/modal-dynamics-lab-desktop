# Modal Dynamics Lab — Product Specification V1

**Status:** Frozen V1 product specification  
**Product name:** Modal Dynamics Lab  
**Product identity:** Kinetic Scientific Instrument  
**Primary audience:** Students, early-career engineers, and users learning modal analysis from first principles  
**Primary goal:** Teach the conceptual and mathematical foundations of modal analysis through direct manipulation, synchronized visualization, and progressively increasing system complexity.

**Runtime target:** Local-first Windows desktop application using Tauri 2 + Vite + React + TypeScript. V1 core functionality must work offline.

---

# 1. Product Vision

Modal Dynamics Lab is not intended to be a generic vibration calculator, a dashboard, or a simplified FEM package.

It is an interactive scientific learning environment where the user can move continuously through:

\[
\boxed{
\text{Physical intuition}
\rightarrow
\text{equations of motion}
\rightarrow
\text{natural frequency}
\rightarrow
\text{multiple DOFs}
\rightarrow
\text{eigenvalue problem}
\rightarrow
\text{mode shapes}
\rightarrow
\text{MDOF}
\rightarrow
\text{free-free systems}
}
\]

The user should finish V1 understanding why a free-free 3D structure has six rigid-body modes and why, in a result list such as:

\[
f_1,\ldots,f_6\approx0,\qquad
f_7>0,
\]

Mode 7 may represent the **first elastic mode** rather than the seventh elastic mode.

---

# 2. Core Learning Outcome

By the end of V1, the user should be able to explain and interpret:

- what a degree of freedom is,
- what stiffness, mass, and damping do,
- why a natural frequency exists,
- how damping changes free vibration,
- why a 2DOF system has multiple natural frequencies,
- what a mode is,
- what a mode shape is,
- how an eigenvalue becomes a natural frequency,
- how an eigenvector becomes a mode shape,
- why mode-shape amplitudes are relative / normalized,
- how physical motion can be represented as a combination of modes,
- what an MDOF modal problem is,
- why free-free systems contain rigid-body modes,
- why rigid-body modes have approximately zero natural frequency,
- why a 3D free-free body has six rigid-body modes,
- why the first elastic mode may appear as solver Mode 7.

---

# 3. Frozen V1 Scope

V1 includes:

\[
\boxed{
\text{Undamped SDOF}
\rightarrow
\text{Damped SDOF}
\rightarrow
\text{2DOF}
\rightarrow
\text{Mode Shapes}
\rightarrow
\text{MDOF}
\rightarrow
\text{Free-Free}
}
\]

V1 also includes supporting capabilities required to teach those topics correctly:

- natural frequency calculation,
- analytical free-response solution,
- damping ratio,
- underdamped / critically damped / overdamped regimes,
- time-history visualization,
- phase-space visualization,
- energy visualization,
- matrix assembly for 2DOF,
- generalized eigenvalue solution,
- eigenvectors and normalization,
- modal superposition demonstration,
- mode browser,
- nodal-point visualization,
- free-free rigid-body-mode visualization,
- mode-shape animation,
- graph scrubbing,
- freeze-and-inspect,
- A/B parameter comparison,
- Learn / Explore / Solve usage modes,
- light / dark themes,
- keyboard-accessible interactions,
- responsive desktop-window behavior,
- Windows DPI scaling and desktop lifecycle behavior,
- offline core execution.

---

# 4. Explicit V1 Non-Goals

V1 does **not** include:

- full finite-element modeling,
- beam / shell / solid element generation,
- real FEM mesh import,
- ANSYS file import,
- ANSYS solver integration,
- CAD import,
- nonlinear contact,
- geometric nonlinearity,
- material nonlinearity,
- prestressed modal analysis,
- harmonic response analysis,
- frequency-response functions as a full module,
- base excitation,
- random vibration,
- response spectrum,
- shock response spectrum,
- transient structural analysis,
- modal damping identification,
- experimental modal analysis,
- operational modal analysis,
- complex modes from non-proportional damping,
- fluid-structure interaction,
- aeroelasticity,
- rotor dynamics,
- acoustics,
- uncertainty quantification,
- model updating,
- large sparse FEM eigensolvers,
- cloud collaboration,
- accounts,
- AI chat as a primary interface.

These belong to future versions.

---

# 5. Product Modes

The product supports three complementary usage modes.

## 5.1 Learn

Purpose:

- guided understanding,
- derivation steps,
- explanatory highlights,
- curated parameter ranges,
- concept-first sequencing.

Characteristics:

- explanations are visible,
- equations are introduced progressively,
- guided experiments are available,
- key relationships are highlighted,
- user can pause or skip.

---

## 5.2 Explore

Purpose:

- free experimentation,
- parameter sensitivity,
- intuition building,
- A/B comparison.

Characteristics:

- rapid slider manipulation,
- compact theory,
- concept lenses,
- direct manipulation,
- comparison tools.

---

## 5.3 Solve

Purpose:

- enter a system,
- compute modal quantities,
- inspect numerical results.

Characteristics:

- denser numerical information,
- matrix input where appropriate,
- frequency table,
- mode shapes,
- normalization controls,
- solver residuals where relevant.

V1 Solve mode remains educational and small-scale. It is **not** a replacement for a production structural solver.

---

# 6. Global Product Structure

Primary learning trajectory:

```text
01 SDOF
02 DAMPING
03 2DOF
04 MODES
05 MDOF
06 FREE-FREE
```

Each module should reuse the same conceptual structure:

1. physical system,
2. governing equation,
3. controllable parameters,
4. live animation,
5. synchronized plots,
6. mathematical derivation,
7. concept takeaway,
8. optional inspection.

The product should feel like one system becoming progressively more sophisticated.

---

# 7. Global State Concepts

Important semantic states include:

```text
activeModule
experienceMode
parameters
isPlaying
playbackRate
simulationTime
activeLens
selectedPhysicalObject
selectedDOF
selectedMode
normalizationMode
comparisonConfiguration
inspectionState
```

Transient per-frame animation values are not part of semantic application state.

---

# 8. Global Physical Conventions

Unless a module explicitly states otherwise:

- SI units are default.
- Linear time-invariant systems are assumed.
- Mass values must be positive.
- Stiffness values must be non-negative unless an advanced future module explicitly allows otherwise.
- Damping is viscous.
- Motions are small.
- Mode-shape displacement is normalized / relative and does not represent a physical response amplitude.
- Frequencies are displayed in both rad/s and Hz when educationally useful.

Definitions:

\[
\omega = 2\pi f
\]

\[
f=\frac{\omega}{2\pi}
\]

---

# 9. Module 01 — Undamped SDOF

## 9.1 Governing system

\[
m\ddot{x}+kx=0
\]

Parameters:

\[
m,\quad k,\quad x_0,\quad v_0
\]

Derived quantities:

\[
\omega_n=\sqrt{\frac{k}{m}}
\]

\[
f_n=\frac{\omega_n}{2\pi}
\]

\[
T_n=\frac{1}{f_n}
\]

---

## 9.2 Analytical response

The general solution:

\[
x(t)=A\cos(\omega_nt)+B\sin(\omega_nt)
\]

Using initial conditions:

\[
x(0)=x_0
\]

\[
\dot{x}(0)=v_0
\]

so:

\[
A=x_0
\]

\[
B=\frac{v_0}{\omega_n}
\]

thus:

\[
\boxed{
x(t)
=
x_0\cos(\omega_nt)
+
\frac{v_0}{\omega_n}\sin(\omega_nt)
}
\]

Velocity:

\[
\dot{x}(t)
=
-x_0\omega_n\sin(\omega_nt)
+
v_0\cos(\omega_nt)
\]

Acceleration:

\[
\ddot{x}(t)=-\omega_n^2x(t)
\]

---

## 9.3 User controls

Required:

- mass \(m\),
- stiffness \(k\),
- initial displacement \(x_0\),
- initial velocity \(v_0\),
- Play,
- Pause,
- Reset,
- Step,
- playback speed,
- direct drag of mass to set \(x_0\) where practical.

---

## 9.4 Required views

Default:

- physical mass-spring system,
- current displacement,
- \(x(t)\) plot,
- natural frequency readout.

Optional lenses:

- velocity,
- acceleration,
- forces,
- energy,
- phase space,
- mathematics.

---

## 9.5 Energy

Kinetic:

\[
T=\frac12m\dot{x}^2
\]

Potential:

\[
V=\frac12kx^2
\]

Total:

\[
E=T+V
\]

For an ideal undamped system:

\[
E=\text{constant}
\]

---

## 9.6 Learning objectives

The user should discover:

\[
m\uparrow\Rightarrow \omega_n\downarrow
\]

\[
k\uparrow\Rightarrow \omega_n\uparrow
\]

and understand that vibration exists because elastic restoring force acts against displacement.

---

## 9.7 Acceptance criteria

- analytical solution matches displayed motion,
- changing \(m\) and \(k\) updates frequency immediately,
- graph cursor and physical position are synchronized,
- phase-space trajectory is closed,
- total energy is constant within numerical/display tolerance,
- no damping behavior is visible.

---

# 10. Module 02 — Damped SDOF

## 10.1 Governing equation

\[
m\ddot{x}+c\dot{x}+kx=0
\]

Define:

\[
\omega_n=\sqrt{\frac{k}{m}}
\]

Critical damping coefficient:

\[
c_c=2\sqrt{km}
\]

Damping ratio:

\[
\boxed{
\zeta=\frac{c}{c_c}
=
\frac{c}{2\sqrt{km}}
}
\]

---

# 10.2 Damping regimes

## Underdamped

\[
0<\zeta<1
\]

\[
\omega_d=\omega_n\sqrt{1-\zeta^2}
\]

Response:

\[
x(t)
=
e^{-\zeta\omega_nt}
\left(
A\cos(\omega_dt)
+
B\sin(\omega_dt)
\right)
\]

---

## Critically damped

\[
\zeta=1
\]

Response:

\[
x(t)=(A+Bt)e^{-\omega_nt}
\]

---

## Overdamped

\[
\zeta>1
\]

Response consists of two real exponentially decaying components.

---

# 10.3 User controls

Required:

- \(m\),
- \(k\),
- either \(c\) or \(\zeta\),
- \(x_0\),
- \(v_0\),
- damping parameter mode toggle,
- playback controls.

---

# 10.4 Required visual behavior

The damping slider must move smoothly through:

```text
Underdamped → Critical → Overdamped
```

The interface must clearly show the active regime.

For underdamped motion, optionally show decay envelope:

\[
\pm Ae^{-\zeta\omega_nt}
\]

Phase-space view:

- closed curve when \(\zeta=0\),
- inward spiral when \(0<\zeta<1\),
- non-oscillatory convergence for critical / overdamped cases.

---

# 10.5 Learning objectives

User should understand:

\[
\omega_n\neq\omega_d
\]

and:

> Damping changes the transient response and, in the underdamped case, the oscillation frequency observed in time.

---

# 10.6 Acceptance criteria

- regime classification is mathematically correct,
- boundary behavior near \(\zeta=1\) remains stable,
- no NaN or discontinuous UI explosion at critical damping,
- energy decays when \(c>0\),
- response matches analytical reference cases.

---

# 11. Module 03 — 2DOF System

## 11.1 Default physical model

Recommended fixed-fixed chain:

```text
wall──k1──[m1]──k2──[m2]──k3──wall
```

Coordinates:

\[
x_1,\quad x_2
\]

---

# 11.2 Scalar equations

\[
m_1\ddot{x}_1+(k_1+k_2)x_1-k_2x_2=0
\]

\[
m_2\ddot{x}_2+(k_2+k_3)x_2-k_2x_1=0
\]

---

# 11.3 Matrix form

\[
M\ddot{x}+Kx=0
\]

with:

\[
M=
\begin{bmatrix}
m_1&0\\
0&m_2
\end{bmatrix}
\]

and:

\[
K=
\begin{bmatrix}
k_1+k_2 & -k_2\\
-k_2 & k_2+k_3
\end{bmatrix}
\]

---

# 11.4 User controls

Required:

\[
m_1,m_2,k_1,k_2,k_3
\]

Also:

- physical-object selection,
- matrix view,
- equation view,
- Find Modes,
- reset/presets,
- optional symmetric-system preset.

---

# 11.5 Matrix assembly experience

The user should be able to see how:

- mass \(m_1\) contributes to \(M_{11}\),
- mass \(m_2\) contributes to \(M_{22}\),
- spring \(k_2\) creates coupling,
- off-diagonal terms arise.

The matrix should be constructed from the physical system rather than shown as unexplained output.

---

# 11.6 Learning objectives

The user should understand:

- two independent DOFs produce two natural modes,
- coupling creates coordinated motion,
- matrices compactly represent coupled equations.

---

# 11.7 Acceptance criteria

- scalar and matrix forms are equivalent,
- matrix assembly is visually and mathematically correct,
- symmetric reference systems produce expected symmetric structure,
- physical-object ↔ matrix linking works both ways.

---

# 12. Module 04 — Modes and Mode Shapes

## 12.1 Modal assumption

For undamped free vibration:

\[
M\ddot{x}+Kx=0
\]

Assume:

\[
x(t)=\phi e^{i\omega t}
\]

then:

\[
\ddot{x}(t)=-\omega^2\phi e^{i\omega t}
\]

substitution gives:

\[
(K-\omega^2M)\phi=0
\]

Nontrivial solution requires:

\[
\boxed{
\det(K-\omega^2M)=0
}
\]

---

# 12.2 Eigenvalue interpretation

Define:

\[
\lambda_i=\omega_i^2
\]

Then:

\[
\boxed{
K\phi_i=\lambda_iM\phi_i
}
\]

So:

\[
\boxed{
\lambda_i\rightarrow\omega_i\rightarrow f_i
}
\]

and:

\[
\boxed{
\phi_i\rightarrow\text{mode shape}
}
\]

---

# 12.3 Required mode browser

For each mode show:

- mode number,
- natural frequency \(f_i\),
- angular natural frequency \(\omega_i\),
- eigenvector \(\phi_i\),
- compact mode fingerprint,
- optional qualitative descriptor such as in-phase / out-of-phase for 2DOF.

---

# 12.4 Mode shape visualization

For visual animation:

\[
x(t)=A_{\text{visual}}\phi_i\sin(\omega_it)
\]

The interface must explicitly state:

> The visualization amplitude is a display scale, not the real physical response amplitude.

---

# 12.5 Normalization

Support at least:

## Max normalization

\[
\max_j|\phi_{ji}|=1
\]

## Mass normalization

\[
\phi_i^TM\phi_i=1
\]

The user must also learn:

\[
\phi_i
\]

and:

\[
-\phi_i
\]

represent the same physical mode.

---

# 12.6 Orthogonality

Where appropriate, show:

\[
\phi_i^TM\phi_j=0,\qquad i\neq j
\]

and for classical undamped systems:

\[
\phi_i^TK\phi_j=0,\qquad i\neq j
\]

This may live under an advanced expandable section in V1.

---

# 12.7 Modal superposition

Provide a simple 2DOF demonstration:

\[
x(t)
=
\phi_1q_1(t)
+
\phi_2q_2(t)
\]

User can control modal contributions.

The tool should visually show:

```text
Mode 1
+
Mode 2
=
Combined physical motion
```

---

# 12.8 Learning objectives

User should understand:

> A mode is not “the first movement” or “the second movement.”

A mode is:

\[
\boxed{
\text{a natural vibration pattern associated with a natural frequency}
}
\]

---

# 12.9 Acceptance criteria

- eigenvalues match trusted numerical references,
- eigenvectors satisfy residual checks,
- sign inversion does not produce a false “different mode,”
- normalization changes display values but not physical mode identity,
- selected mode updates all linked views consistently.

---

# 13. Module 05 — MDOF

## 13.1 V1 system size

Default supported range:

\[
\boxed{3\le N\le10}
\]

V1 focuses on mass-spring chain systems and matrix-based small MDOF systems.

---

# 13.2 Governing equation

\[
M\ddot{x}+Kx=0
\]

General modal problem:

\[
\boxed{
K\phi_i=\omega_i^2M\phi_i
}
\]

---

# 13.3 Input methods

V1 may support:

### Chain Builder

User defines:
- number of masses,
- mass values,
- spring values,
- end conditions.

### Matrix Input

Advanced Solve mode may allow direct entry of:
- \(M\),
- \(K\),

subject to validation.

Matrix input must not be required for the normal learning path.

---

# 13.4 Results

Show:

- natural-frequency list,
- mode browser,
- selected eigenvector,
- mode-shape plot,
- animated chain,
- node indices,
- nodal points,
- normalization mode.

---

# 13.5 Mode-shape plot

For a selected mode:

\[
\phi_i=
\begin{bmatrix}
\phi_{1i}\\
\phi_{2i}\\
\vdots\\
\phi_{Ni}
\end{bmatrix}
\]

Plot amplitude against DOF index.

Visual interpolation between discrete DOFs is permitted only as a rendering aid.

It must not imply additional solved physical DOFs.

---

# 13.6 Nodal points

Highlight approximate nodal locations where:

\[
|\phi_{ji}|\approx0
\]

when meaningful.

---

# 13.7 Mode tracking

As parameters change, simple frequency sorting may cause modes to swap visually.

The UI should preserve mode identity where practical using mode-shape similarity.

A MAC-like metric may be used:

\[
MAC(\phi_i,\phi_j)
=
\frac{|\phi_i^T\phi_j|^2}
{(\phi_i^T\phi_i)(\phi_j^T\phi_j)}
\]

or a mass-weighted equivalent when appropriate.

Near-degenerate modes require special care.

---

# 13.8 Learning objectives

User should understand:

- an \(N\)-DOF linear undamped system has up to \(N\) normal modes,
- each mode has a frequency and a shape,
- higher modes generally exhibit more sign changes / nodal structure,
- modes form a basis for describing motion under appropriate assumptions.

---

# 13.9 Acceptance criteria

- systems up to \(N=10\) solve immediately under normal conditions,
- frequencies are sorted and stable,
- mode shapes animate correctly,
- selected mode identity does not flicker under small parameter changes,
- solver residuals remain within tolerance.

---

# 14. Module 06 — Free-Free Systems

This is the conceptual culmination of V1.

---

# 14.1 1D free-free demonstration

Use:

```text
[m1]──k──[m2]
```

with no ground attachment.

Rigid translation:

\[
x_1=x_2=\text{constant shift}
\]

The spring length does not change.

Therefore:

\[
\varepsilon=0
\]

\[
\sigma=0
\]

\[
U=0
\]

and:

\[
K\phi_{RB}=0
\]

Thus:

\[
\lambda=0
\]

\[
\omega=0
\]

\[
\boxed{f=0}
\]

---

# 14.2 2D rigid-body concept

A planar free body has:

\[
T_x,\quad T_y,\quad R_z
\]

three rigid-body modes.

The interface should animate each separately.

---

# 14.3 3D rigid-body concept

A free 3D body has:

\[
T_x,\quad T_y,\quad T_z,\quad R_x,\quad R_y,\quad R_z
\]

so:

\[
\boxed{6\text{ rigid-body modes}}
\]

These modes should be shown with:

- no structural deformation,
- no restoring stiffness,
- approximately zero natural frequency.

---

# 14.4 First elastic mode

The interface should then transition from the six rigid-body modes to an elastic deformation mode.

Display conceptually:

```text
Modes 1–6
Rigid-body
f ≈ 0

Mode 7
First elastic mode
f > 0
```

Important wording:

> Mode 7 is the seventh solver-listed mode, but it may be the first elastic structural mode.

---

# 14.5 Solver-order nuance

The application should not imply that the six free-free modes are always returned strictly as:

\[
T_x,T_y,T_z,R_x,R_y,R_z
\]

in that exact order.

When multiple eigenvalues are all approximately zero, the numerical solver may return linear combinations of the rigid-body subspace.

This nuance should appear in an advanced note.

---

# 14.6 Near-zero numerical frequencies

The tool should explain that in numerical analysis:

\[
f_{RB}
\]

may appear as tiny nonzero values rather than exactly zero because of:

- floating-point arithmetic,
- solver tolerances,
- numerical conditioning.

---

# 14.7 Example result interpretation

Provide an educational example similar to:

\[
\begin{aligned}
f_1,\ldots,f_6 &\approx 0\\
f_7 &=169.4\text{ Hz}\\
f_8 &=170.9\text{ Hz}\\
f_9 &=251.2\text{ Hz}\\
f_{10}&=270.2\text{ Hz}
\end{aligned}
\]

Interpretation:

\[
\boxed{
\text{Mode 7}=\text{Elastic Mode 1}
}
\]

if the first six are rigid-body modes.

---

# 14.8 Learning objectives

The user should be able to explain the chain:

\[
\boxed{
\text{rigid motion}
\Rightarrow
\varepsilon=0
\Rightarrow
\sigma=0
\Rightarrow
K\phi=0
\Rightarrow
\lambda=0
\Rightarrow
\omega=0
\Rightarrow
f=0
}
\]

---

# 14.9 Acceptance criteria

- 1D free-free example produces a zero rigid-body eigenvalue,
- 2D concept shows three rigid-body DOFs,
- 3D concept shows six,
- rigid-body animation contains no visual deformation,
- elastic mode visibly deforms,
- educational conclusion is unambiguous.

---

# 15. Global Concept Lenses

The same physical system may be viewed through:

```text
Motion
Forces
Energy
Mode Shape
Mathematics
```

The underlying physical state remains unchanged.

The lens system exists to reduce panel clutter and preserve continuity.

---

# 16. Global Inspection System

When simulation is paused, user can inspect selected quantities.

Examples:

\[
x,\quad \dot{x},\quad \ddot{x}
\]

\[
F_k,\quad F_c
\]

Mode-related inspection:

\[
f_i,\quad \omega_i,\quad \phi_i
\]

The same selection should highlight across:

- physical object,
- equation,
- matrix,
- graph,
- inspector.

---

# 17. A/B Comparison

Explore mode supports pinning one configuration.

Example:

\[
k_A=500\text{ N/m}
\]

versus:

\[
k_B=1000\text{ N/m}
\]

Compare:

- physical motion,
- natural frequency,
- mode shape,
- selected derived quantities.

The comparison should communicate causality rather than merely show two numbers.

---

# 18. Presets

Each module should include a small number of purposeful presets.

Examples:

## SDOF
- light / soft,
- light / stiff,
- heavy / soft,
- heavy / stiff.

## Damped
- undamped,
- lightly damped,
- critical,
- overdamped.

## 2DOF
- symmetric,
- asymmetric masses,
- weak coupling,
- strong coupling.

## MDOF
- uniform chain,
- graded masses,
- graded stiffness.

Presets should teach relationships, not serve as decorative examples.

---

# 19. Guided Experiments

Each module should contain optional guided experiments.

Example:

### SDOF — Increase stiffness

1. hold mass constant,
2. increase \(k\),
3. observe faster oscillation,
4. highlight:

\[
\omega_n=\sqrt{\frac{k}{m}}
\]

5. conclude:

\[
k\uparrow\Rightarrow f_n\uparrow
\]

These experiments must be interruptible and user-controlled.

---

# 20. Units and Formatting

Default SI units:

| Quantity | Unit |
|---|---|
| mass | kg |
| stiffness | N/m |
| damping | N·s/m |
| displacement | m / mm based on context |
| velocity | m/s |
| acceleration | m/s² |
| angular frequency | rad/s |
| frequency | Hz |
| energy | J |
| force | N |

Display precision must be readable and stable.

Internal calculations may use higher precision than displayed.

---

# 21. Numerical Solver Requirements

For small symmetric undamped systems:

\[
K\phi=\lambda M\phi
\]

Use a reliable generalized symmetric eigenvalue solution.

Requirements:

- real eigenvalues for valid symmetric positive/semi-definite systems,
- ascending frequency order where appropriate,
- robust handling of zero / near-zero eigenvalues,
- normalized eigenvectors,
- residual calculation,
- repeated-mode awareness.

---

# 22. Solver Residual

For each mode:

\[
r_i=K\phi_i-\omega_i^2M\phi_i
\]

Provide an internal or advanced-display normalized residual such as:

\[
\eta_i=
\frac{\|r_i\|}
{\|K\phi_i\|+\|\omega_i^2M\phi_i\|+\epsilon}
\]

Exact formula may be finalized during implementation.

The important requirement is that modal solutions are numerically verified.

---

# 23. Numerical Edge Cases

The product must intentionally handle:

- \(m\le0\),
- \(k<0\),
- invalid \(c\),
- singular \(M\),
- singular \(K\),
- disconnected systems,
- rigid-body modes,
- repeated eigenvalues,
- near-repeated eigenvalues,
- extremely small stiffness,
- very large parameter ratios,
- invalid matrix dimensions,
- non-symmetric matrix entry in a V1 symmetric solver.

The interface must never show:

- NaN,
- Infinity,
- undefined values,
- blank graphs caused by unhandled invalid input.

---

# 24. Degenerate Modes

For repeated or nearly repeated eigenvalues, individual eigenvectors may not be unique.

The product should explain:

> The invariant modal subspace is physically meaningful, while the exact numerical orientation of individual eigenvectors inside a degenerate subspace may depend on the solver.

This is especially relevant for symmetric systems.

---

# 25. Performance Requirements

V1 targets an interaction quality suitable for a premium scientific tool.

Target:

\[
\boxed{60\text{ FPS-class experience}}
\]

Normal frame budget:

\[
\boxed{<16.7\text{ ms}}
\]

Input-to-visual target:

\[
\boxed{<50\text{ ms}}
\]

Requirements:

- one primary simulation clock,
- no physics animation through per-frame React state,
- no duplicated RAF loops,
- no graph rebuild every frame,
- inactive simulations stop,
- expensive calculations remain off the rendering hot path,
- responsive layout changes do not create animation leaks.

---

# 26. Physics / Visualization Boundary

Physics engine output may include:

```text
time
positions
velocities
accelerations
forces
energies
naturalFrequencies
angularFrequencies
modeShapes
normalization
residuals
nodalIndicators
```

Visualization layer may decide:

- pixels,
- transforms,
- colors,
- labels,
- camera framing,
- interaction highlights.

Visualization must never invent a physical result that the solver did not provide.

---

# 27. V1 Suggested Technical Architecture

V1 is a Windows desktop application.

Frozen runtime:

```text
Tauri 2
└── Vite + React + TypeScript
```

Recommended responsibility structure:

```text
src/
    app/
    components/
    features/
        sdof/
        damping/
        twodof/
        modes/
        mdof/
        freefree/
    physics/
        sdof/
        damping/
        matrices/
        eigen/
        modal/
        validation/
    animation/
        clock/
        playback/
        transitions/
    visualization/
        systems/
        plots/
        vectors/
        mode-shapes/
    education/
        derivations/
        experiments/
        explanations/

src-tauri/
    src/
    icons/
    capabilities/

tests/
    physics/
    numerical/
    interaction/
    performance/
    visual/
    desktop/
```

The Rust/Tauri layer must remain small in V1. Do not move low-DOF numerical calculations into Rust without a demonstrated performance or capability reason.

Exact file names may change, but the separation of responsibilities is required.

---

# 28. Rendering Strategy

V1 preference:

| Feature | Preferred rendering |
|---|---|
| SDOF | SVG |
| Damped SDOF | SVG |
| 2DOF | SVG |
| 3–10 DOF | SVG initially |
| response plots | Canvas or optimized SVG |
| equation rendering | HTML + KaTeX |
| matrix interaction | HTML/SVG |
| future large systems | Canvas |
| future 3D FEM | WebGL |

---

# 29. Accessibility Requirements

Required:

- keyboard-operable controls,
- focus-visible states,
- native semantic controls where possible,
- reduced-motion support,
- no essential hover-only information,
- adequate contrast,
- labels for technical controls,
- non-color-only encoding when multiple physical quantities are compared,
- usable touch targets.

Reduced-motion mode must still teach mode shapes using:

- extreme positions,
- direction arrows,
- static overlays,
- numerical values.

---

# 30. Desktop Window / Responsive Requirements

V1 targets Windows desktop rather than mobile web.

Required window states:

- recommended desktop size,
- maximized,
- narrow but supported desktop window,
- common Windows DPI scaling levels.

The Physics Stage keeps priority as the window narrows.

Suggested collapse order:

1. Physics Stage
2. playback controls
3. primary parameters
4. key results
5. plots
6. theory / derivation detail
7. secondary inspectors

No page-level horizontal scrolling should appear at the supported minimum window size.

The application must remain crisp under high-DPI scaling, and Canvas-based visualizations must account for `devicePixelRatio`.

# 31. Onboarding

No long onboarding carousel.

First-run preferred behavior:

1. open directly into a moving SDOF system,
2. expose mass and stiffness,
3. invite one interaction,
4. show frequency update,
5. offer Learn trajectory.

The user should understand within seconds that the system is interactive.

---

# 32. Global Interaction Requirements

Every important user action must have deterministic behavior.

Required:

- slider drag,
- click / tap selection,
- keyboard adjustment,
- graph scrub,
- play / pause,
- reset,
- step,
- mode switching,
- lens switching,
- module switching.

All transitions must be interruptible.

User input always takes priority over queued UI animation.

---

# 33. Global Animation Requirements

Three categories:

## Physics motion

Driven only by equations.

## Interface motion

Short, subtle UI feedback.

Typical:

\[
150\text{–}220\text{ ms}
\]

## Educational motion

Transformation designed for comprehension.

Typical:

\[
250\text{–}350\text{ ms}
\]

No physics animation may use arbitrary UI easing.

---

# 34. V1 Signature Features

Required or strongly preferred signature experiences:

1. continuity-first module transitions,
2. equation ↔ geometry linking,
3. animated matrix assembly,
4. graph scrubbing,
5. Freeze & Inspect,
6. energy lens,
7. phase-space lens,
8. mode fingerprints,
9. nodal-point visualization,
10. A/B comparison,
11. state-linked visualization,
12. Free-Free six-rigid-body-mode finale.

These are product-defining features, not decoration.

---

# 35. Validation Strategy

V1 must be validated at four levels.

## 35.1 Analytical physics validation

Reference cases for:

- undamped SDOF,
- damped SDOF,
- simple symmetric 2DOF.

---

## 35.2 Numerical modal validation

Verify:

\[
K\phi_i\approx\omega_i^2M\phi_i
\]

Orthogonality where appropriate.

---

## 35.3 Interaction validation

Verify:

- slider → physics update,
- mode select → all linked views update,
- pause → all dynamic views stop,
- scrub → stage follows,
- reset → deterministic defaults,
- module switch → no stale state leaks.

---

## 35.4 Performance validation

Test:

- continuous slider drag,
- repeated play/pause,
- rapid mode switch,
- 10DOF animation,
- continuous resize,
- graph scrubbing,
- module switching,
- reduced-motion mode.

---

# 36. Phase-by-Phase Development Plan

## Phase 0 — Foundation

Deliver:

- app shell,
- visual design tokens,
- learning trajectory,
- Physics Stage skeleton,
- single simulation clock,
- playback system,
- responsive baseline,
- accessibility baseline,
- performance diagnostics,
- Tauri 2 desktop shell,
- desktop window lifecycle baseline,
- offline runtime baseline,
- Windows DPI/high-DPI rendering baseline.

Gate:

- smooth animation skeleton,
- no duplicate RAF loops,
- desktop shell stable,
- Tauri dev app launches,
- production desktop build succeeds,
- window resize/DPI behavior is usable,
- core shell works offline.

---

## Phase 1 — Undamped SDOF

Deliver:

- full analytical solution,
- sliders,
- direct manipulation,
- synchronized animation,
- \(x(t)\),
- energy,
- phase space,
- derivation.

Gate:

- physics validated,
- interaction smooth,
- graph synchronized.

---

## Phase 2 — Damped SDOF

Deliver:

- underdamped,
- critically damped,
- overdamped,
- \(\zeta\),
- \(\omega_d\),
- decay envelope,
- damping-sensitive phase space.

Gate:

- all damping regimes validated.

---

## Phase 3 — 2DOF

Deliver:

- physical model,
- scalar equations,
- \(M\) and \(K\),
- animated matrix assembly,
- coupling visualization,
- Find Modes workflow.

Gate:

- matrix assembly and eigenvalue solution validated.

---

## Phase 4 — Mode Shape Lab

Deliver:

- mode browser,
- mode animation,
- eigenvector display,
- normalization,
- sign equivalence,
- modal superposition,
- mode fingerprints,
- nodal concepts.

Gate:

- every selected mode stays synchronized across all representations.

---

## Phase 5 — MDOF

Deliver:

- 3–10 DOF chain,
- generalized eigensolver,
- mode browser,
- mode-shape plot,
- normalization,
- nodal-point detection,
- stable mode tracking.

Gate:

- numerical and performance tests pass at 10 DOF.

---

## Phase 6 — Free-Free

Deliver:

- 1D free-free,
- 2D rigid-body modes,
- 3D six-rigid-body-mode concept,
- first elastic mode transition,
- numerical-zero explanation,
- solver-order nuance.

Gate:

- user can visually distinguish rigid motion from elastic deformation.

---

## Phase 7 — Validation & Polish

Deliver:

- full physics test suite,
- performance regression,
- visual regression,
- responsive polish,
- accessibility audit,
- light/dark parity,
- interaction cleanup,
- documentation.

Gate:

- V1 Definition of Done passes.

---

# 37. V1 Definition of Done

V1 is complete only when all of the following are true.

## Physics

- SDOF equations are correct.
- Damped regimes are correct.
- 2DOF matrices are correct.
- Eigenvalues and eigenvectors are correct.
- MDOF results pass residual checks.
- Free-free rigid-body behavior is correct.

## Teaching

- user can move from physical intuition to matrix modal analysis,
- mode shape is understood visually before becoming abstract,
- free-free six-mode result is explained clearly,
- mathematical symbols map to physical objects.

## Interaction

- sliders feel immediate,
- animation remains smooth,
- graph and stage remain synchronized,
- all motion is interruptible,
- Freeze & Inspect works,
- scrubbing works,
- reset is deterministic.

## Design

- Physics Stage remains visually dominant,
- product does not resemble a generic AI dashboard,
- hierarchy remains calm,
- light and dark modes are coherent,
- motion is meaningful.

## Engineering

- no duplicate animation loops,
- no obvious memory/listener leaks,
- no NaN/Infinity from user input,
- small MDOF solves remain responsive,
- tests pass,
- implementation boundaries are documented.

---

# 38. V2 Parking Lot

Potential future expansion after V1 is fully polished:

\[
\boxed{
\text{Forced Vibration}
+
\text{FRF}
+
\text{Resonance}
+
\text{Participation Factor}
+
\text{Effective Modal Mass}
}
\]

Then later:

- base excitation,
- harmonic response,
- beam/frame finite elements,
- 2D/3D FE mode shapes,
- experimental modal concepts,
- ANSYS-result interpretation,
- import/export,
- larger sparse systems.

No V2 item should enter V1 unless explicitly approved through scope change.

---

# 39. Product Success Criterion

The product succeeds if a user who begins with:

> “I do not know what a mode is.”

can finish V1 and explain:

\[
\boxed{
K\phi_i=\omega_i^2M\phi_i
}
\]

in physical language, identify a mode shape visually, distinguish rigid-body motion from elastic deformation, and correctly interpret why a free-free 3D structure can show six approximately-zero modes before its first elastic natural frequency.

That is the central product outcome.
