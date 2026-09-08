# Phase 1 — undamped SDOF
## Audit and competency ownership
The requested root/specification/V0 documents and source were read before implementation. V0 baseline: 18 unit and 12 UI/visual tests passed. The existing elapsed-time clock, lifecycle reasons, Tauri focus boundary, reducer selection contract and shared controls were retained. No blocking scope conflict was found. The frozen desktop runtime overrides older generic Next.js/mobile references in the skill matrix. No Phase 2 implementation.

Active competency routing: Computational Structural Dynamics owns the exact free response and reference cases; Physics Engine Engineering owns the pure immutable API; Scientific Visualization owns SVG units, sampling and arrows; Interaction Design owns inputs/drag/scrub; Educational UX and Equation Interaction own linked symbols and interruptible derivation; Animation/Performance own the existing authoritative clock; Accessibility, Testing, Visual QA and Desktop Engineering own validation and packaging. No additional agents were used.

## Physics contract
physics/sdof.ts exposes createSdof(parameters), an immutable SdofSolution and sample(time). Inputs are SI mass kg, stiffness N/m, initial position m and velocity m/s. Outputs contain x, v, a, spring force, kinetic/potential/total energy, equilibrium residual, omega, frequency, period and amplitude. The core imports no React, DOM, clock or native code.

Assume positive constant mass, nonnegative constant stiffness, linear small-displacement response, one coordinate, no damping and no forcing. Positive x points right. F_s=-kx and a=F_s/m. For positive stiffness, x=x0 cos(omega t)+(v0/omega)sin(omega t), omega=sqrt(k/m). Phase is reduced modulo the period before trigonometric evaluation; absolute simulation time remains unwrapped. Energy evaluates square-root-weighted coordinates to avoid unnecessary intermediate overflow. Extremely ill-scaled inputs that cannot be represented are rejected.

At k=0: x=x0+v0*t, v=v0, a=F_s=0, frequency=0, period=null, amplitude=null. The UI explicitly shows no oscillation. No eigensolver, damping, normalization or mode tracking exists in this phase.

Defaults: m=1, k=100, x0=0.1, v0=0. UI limits m=[0.25,10], k=[0,500], x0=[-0.2,0.2], v0=[-1,1]. Numeric entry rejects invalid/out-of-range values with a visible message; it never silently changes zero stiffness. Range controls use the same committed units. Presets change mass to 0.5/4 or stiffness to 25/400 with otherwise default initial conditions.

## State and time
App owns semantic parameters, lens, selected object, derivation step, experiment and reset revision. The clock is unchanged and owns elapsed time, playback rate and lifecycle suspension. Its subscribers obtain one authoritative time and sample the same immutable solution. Layout effects update all views before browser paint after a parameter change. Continuous frames mutate SVG attributes and output text directly, without React state.

Parameter edits preserve absolute time and re-evaluate the new initial-value problem. The policy is visible in the UI. This is not an impulsive physical parameter-switching simulation. Reset restores defaults, t=0, rate=1, paused, Motion, empty selection/guide, derivation step 1 and numeric drafts; it preserves theme and module. Planned modules keep the SDOF system and disclose their unavailable status.

Mass drag captures a Pointer Event, pauses, anchors to the currently visible physical position and holds a fixed pixel-to-SI scale through the gesture. Live dragging sets bounded x0 and t=0. Pointer release/cancel/Reset clears capture/draft ownership; numeric entry provides the non-drag alternative. The spring, mass and x tokens share persistent semantic selection. Space/R/arrows and E/F/M retain input shortcut isolation.

## Rendering and sampling
SVG remains appropriate for one DOF and is inherently vector crisp. There is no Canvas, worker, WebGL or Rust numerical work. Stage extent depends on solution amplitude; a finite eight-second reference extent is used for free drift. Positions outside that finite stage are clipped with an explicit warning and exact SI inspector values.

The response graph uses four exact periods per fixed window. The curve does not rebuild during periodic playback; only the cursor/window-start label moves. Absolute time advances continuously and the periodic curve repeats exactly. Scrubbing selects the current window start plus the slider's time (1 ms precision). Zero stiffness uses eight-second pages; its straight-line curve and fixed-within-page y extent update only at a page boundary. This keeps unbounded translation truthful without pumping axes each frame.

sampleSdof includes both exact endpoints with sorted unique times, at least 64 intervals/cycle and viewport-driven density, at most 4097 samples. An overlong unresolved domain is rejected. ResizeObserver coalesces width updates through the same clock and cleans up on unmount. Phase space samples one period (eight seconds for free drift); its marker shares the exact current solution. The finite free-drift phase view explicitly notes that the marker can leave the view.

Force/velocity arrows use signed physical values with relative visual scaling, never easing. Energy displays KE and PE as fractions of the physical constant total, with numerical J labels. Empty energy at rest has a defined zero state.

## Teaching and interruption
Bundled KaTeX supplies mathematical layout and MathML; no CDN/font/network dependency. Five user-stepped equations live beside stable m/k/x link tokens. A 300 ms interruptible FLIP rearrangement groups k/m, with immediate final state under reduced motion. No autoplay timers or queued teaching sequence. Two guided experiments compare m=1→4 or k=100→400, holding the other parameter fixed; pause, resume, apply and skip are explicit. New parameter/scrub/selection/module input interrupts the experiment.

Reduced motion suspends continuous playback, retains current quantities, shows oscillator extremes and preserves Step/Scrub/selection. Zero-stiffness translation has no finite oscillatory extremes.

## Validation policy
Analytical reference/sweep tolerance: 1e-10 × max(1, abs(expected)); independent finite differences use 1e-8. Existing 18 V0 unit tests are unchanged. Eight V0 UI scenarios migrate only calibration-specific names/expected values to the real oscillator; lifecycle, focus, reset, input and synchronization assertions remain. V0 screenshots and evidence remain historical; nine new reviewed V1 visual baselines track this intentional replacement.

Native security capabilities and Rust source are unchanged; version is 0.1.0. The existing local build helper and offline WebView2 NSIS option remain. See V1_REPORT.md and validation/*v1* for measured results and limitations.
