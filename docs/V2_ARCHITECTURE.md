# Phase 2 architecture

## Scope and ownership

Phase 2 extends the existing SDOF instrument. No 2DOF, modal solver, forcing, cloud service or native capability was added. Tauri 2 + Vite + React + TypeScript remains the offline Windows runtime. Damping Mathematics owns the equations and boundary strategy; Physics Engine Engineering owns pure calculation; Scientific Visualization owns SVG and fixed domains; Equation Interaction owns linked tokens; Testing owns independent references and lifecycle evidence. These are responsibility boundaries, not separate agents.

createSdof is the sole model factory. An omitted damping coefficient means c=0 and preserves the exact Phase 1 branch. The DAMPING module passes the stored coefficient (default 4 N·s/m). The SDOF module omits it, preserving the Phase 1 instrument and all historical baselines. Shared mass, stiffness, initial conditions, time and clock instance survive module selection. Header phase labels describe the active lab.

React stores semantic parameters, c/ζ authority, module, lens, selection and teaching steps. Frame values never enter React state. The existing SimulationClock and lifecycle/native focus bindings remain unchanged. SVG subscribers render sample(t) and clean up on reconfiguration/unmount. Local KaTeX assets remain bundled.

## Assumptions and API

SI units; one translational DOF; constant m>0, k>=0, c>=0; finite x0 and v0; linear spring, linear viscous damper; small displacement and unforced free response. Nonfinite, negative or numerically unrepresentable parameters are rejected.

SdofSolution exposes natural omega/frequency/period, zeta (null for k=0), criticalDamping, dampedOmega (null for real roots), roots, regime, initial energy, envelope amplitude and a bounded response horizon. Natural period remains Tn; it is not presented as a critical/overdamped oscillation period. sample(t) returns x/v/a, spring force, damping force, KE/PE/E, dissipated energy, power and residual.

Amplitude retains the conservative undamped energy bound for fixed stage scaling. The true underdamped envelope is separately named envelope; it is not |x0| unless the initial conditions imply that value.

## Stable analytical strategy

alpha=c/(2m); delta=(alpha−omega)(alpha+omega); q=sqrt(|delta|). The classification tolerance is |ζ−1|<=1e-8. It affects the label only; it does not snap parameters or replace a nearby physical response with a different equation.

x=x0 C+(v0+alpha x0) S and v=v0 C−(alpha v0+omega² x0) S.

For delta<0: C=exp(−alpha t) cos(qt), S=exp(−alpha t) sin(qt)/q. For |qt|<1e-4, evaluate S using t[1−(qt)²/6+(qt)^4/120] to avoid division by tiny q. This is the stable sinc evaluation of the analytical solution, not time integration.

At the repeated root q=0: C=exp(−alpha t), S=t exp(−alpha t), with an underflow-to-zero guard.

For delta>0: rslow=−omega²/(alpha+q) is rationalized; rfast=−alpha−q. C=(exp(rslow t)+exp(rfast t))/2 and S=exp(rslow t)[−expm1(−2qt)]/(2q). This avoids large cancelling modal coefficients and exp/cosh overflow.

At k=0,c>0: beta=c/m, v=v0 exp(−beta t), x=x0+v0[−expm1(−beta t)]/beta. At k=c=0 the trusted free-translation branch remains.

a=(Fs+Fd)/m, Fs=−kx, Fd=−cv. Pd=cv², E=KE+PE, dissipated=E0−E. Independent derivative tests validate acceleration and dE/dt; Simpson quadrature independently validates the energy loss. Tiny roundoff in loss or energy monotonicity is tested with tolerance, not hidden by physics clipping.

No eigenvector normalization or mode tracking is applicable in Phase 2.

## Interaction decisions

Defaults: m=1 kg, k=100 N/m, c=4 N·s/m, x0=0.1 m, v0=0. Mass/stiffness/initial-condition UI limits are unchanged. c has a 0–500 N·s/m slider, extended if a derived value requires it. ζ has a 0–3 slider, similarly extended when switching from a larger physical coefficient. Numeric constraints are strict.

Coefficient authority preserves c under m/k edits. Ratio authority preserves ζ and recomputes c. Switching authority preserves the physical coefficient. At k=0, retain c and switch to coefficient authority; ratio selection is disabled and the explanation stays visible. Reset clears the authority and numeric drafts as well as guides, selection and time.

Numeric commits are synchronous semantic transactions. They cancel any pending slider job for the same control, preventing a subsequent authority switch from reinterpreting a still-queued numeric edit. Continuous sliders retain clock coalescing.

Five presets set m=1,k=100,x0=0.1,v0=0 and ζ=0,0.1,0.4,1,2; they pause and return to t=0. Ordinary parameter edits preserve time and explicitly re-evaluate the initial-value problem, not a physical switching event.

Damper selection is persistent by click or keyboard; c links to the damper, k to the spring, m to mass, x to displacement. Solid spring force and dashed damping force have signed, separately normalized fixed arrow scales. Values remain in SI units.

## Plot and reduced-motion decisions

The damped view uses a fixed initial window H=min(8,32/omega) seconds (8 s for zero stiffness). This resolves roughly five natural cycles without a long-domain sampling explosion. It is a finite observation window, not an automatic settling-time prediction. No periodic replay or live autoscaling occurs. Beyond H the response cursor is hidden, with an explicit message; stage and inspector retain exact current time. Scrubbing returns to the visible window.

Uniform frequency-aware samples are augmented with 127 early samples across up to eight fast-root time constants. The total is bounded by 4097. This resolves fast viscous/overdamped initial transients. Graphs rebuild only after configuration/viewport changes. Phase space uses the same bounded analytical window and a fixed x/v domain. A marker may leave this finite view; the caption discloses this.

Envelope toggle uses R=hypot(x0,(v0+alpha*x0)/wd) and ±R exp(−alpha t). Selecting the envelope explicitly expands the y-domain to include R; it remains fixed during playback. The toggle is absent for nonoscillatory roots. Near criticality a mathematically correct R can be large; the resulting scale is intentionally not falsely tightened.

Energy bars use the initial E0 as a constant denominator; unfilled track means dissipated energy. Reduced motion disables playback, retains step/scrub/inspection and shows sampled min/max positions within the fixed response window. SVG remains vector-based at all device scales; no Canvas DPR path is needed.

## Education and limits

Two user-stepped, pausable/skippable guides show adding damping and finding critical damping. The critical/overdamped comparison explicitly uses release from rest, avoiding a universal fastest-return claim for arbitrary initial velocity. New parameter/module/lens interaction takes control immediately.

Derivation has five locally typeset steps from force balance to characteristic roots. Stable m/k/x/c tokens link to physical referents. Existing interruptible token motion remains; no decorative easing affects physical motion. Full glyph-by-glyph algebra morphing and A/B comparison infrastructure are outside this increment.

The native layer, permissions and security policy are unchanged. The historical local build-v0 staging directory remains an environment accommodation. Performance measurements describe this machine and finite measurement windows, not an optical-latency or long-soak guarantee.
