# Modal Dynamics Lab — Visual & Motion Specification V1

**Status:** Frozen design direction for V1  
**Product direction:** *Kinetic Scientific Instrument*  
**Primary objective:** Build a highly interactive, visually distinctive, smooth, and technically meaningful modal-analysis learning environment that does **not** look like a generic AI dashboard, SaaS template, or textbook page.

---

# 1. Design Thesis

The product must feel like a **live scientific instrument**, not a dashboard.

The interface should make the user feel that they are directly manipulating a physical system:

\[
\boxed{\text{Physical System} \leftrightarrow \text{Mathematics} \leftrightarrow \text{Visualization}}
\]

The UI should continuously connect:

- motion,
- forces,
- equations,
- matrices,
- eigenvalues,
- eigenvectors,
- mode shapes,
- time histories.

Two core design principles are frozen for V1:

> **Nothing moves without meaning.**

> **Nothing mathematical exists without a physical referent.**

Every animation must either represent actual physics or communicate a specific educational/interface transition.

---

# 2. Benchmark DNA

The final interface must **not** copy any benchmark directly. The following products are references only for specific strengths.

| Reference | Principle to borrow |
|---|---|
| Linear | Information hierarchy, panel discipline, density without clutter |
| Raycast | Micro-interactions, keyboard UX, immediate feedback |
| Vercel | Typography, spacing, technical restraint |
| Stripe | Teaching technical concepts through visual transitions |
| Spline | Interactive canvas, direct manipulation, responsive visual stage |
| Framer | Motion polish and layout transitions |
| Resend | Premium dark-mode restraint and visual confidence |

Final synthesis:

\[
\boxed{
\text{Linear discipline}
+
\text{Spline interaction}
+
\text{Stripe educational motion}
+
\text{Raycast responsiveness}
+
\text{Vercel typography}
}
\]

But the product identity itself is:

\[
\boxed{\textbf{Kinetic Scientific Instrument}}
\]

---

# 3. Explicit Anti-Patterns

The UI must deliberately avoid common AI-generated-product aesthetics.

Do **not** default to:

- generic dashboard cards everywhere,
- glassmorphism everywhere,
- purple/blue AI gradients,
- neon glow effects,
- giant “Ask AI” surfaces,
- random 3D blobs,
- excessive rounded cards,
- excessive drop shadows,
- decorative grids with no purpose,
- oversized KPI cards,
- gradient headings,
- meaningless hover animations,
- every section floating in its own bordered container,
- template-like left sidebar + card grid,
- excessive icon use.

The application must look like an engineering/scientific instrument, not a generated SaaS template.

---

# 4. Primary Layout

The dominant element is the **Physics Stage**.

On desktop, roughly 60–65% of the central visual attention should belong to the physical simulation.

Suggested composition:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Modal Lab       SDOF  Damping  2DOF  Modes  MDOF  Free-Free       │
│                                                                    │
│ ┌────────────┐                                 ┌─────────────────┐ │
│ │ PARAMETERS │                                 │ THEORY / RESULT │ │
│ │            │        PHYSICS STAGE            │                 │ │
│ │ m          │                                 │ fn              │ │
│ │ k          │      wall──spring──[mass]       │ ω               │ │
│ │ c          │                                 │ equations       │ │
│ │ sliders    │                                 │ derivation      │ │
│ └────────────┘                                 └─────────────────┘ │
│                                                                    │
│ ───────────────── RESPONSE / TIMELINE / ENERGY ─────────────────── │
└────────────────────────────────────────────────────────────────────┘
```

Important:

- This must **not** visually become three large dashboard cards.
- Surfaces should be separated primarily through spacing, typography, subtle tonal changes, and localized borders.
- The Physics Stage remains visually dominant.

---

# 5. Navigation

V1 does not need a conventional enterprise sidebar.

Use a compact learning trajectory:

```text
01 SDOF ── 02 DAMPING ── 03 2DOF ── 04 MODES ── 05 MDOF ── 06 FREE-FREE
```

The active module may subtly expand or gain stronger visual hierarchy.

Navigation should communicate:

> This is one evolving physical system, not six unrelated pages.

---

# 6. Continuity-First Module Transitions

A defining visual feature of the application should be **continuity between lessons**.

Do not hard-cut from one independent scene to another whenever avoidable.

### SDOF → Damped SDOF

The existing mass-spring system remains in place.

A damper appears and attaches to the existing system.

The motion transitions from:

\[
m\ddot{x}+kx=0
\]

to:

\[
m\ddot{x}+c\dot{x}+kx=0
\]

without resetting the entire scene.

### SDOF → 2DOF

The original SDOF mass becomes \(m_1\).

A second spring and mass enter the stage:

```text
Before:
wall──spring──[m]

After:
wall──spring──[m1]──spring──[m2]
```

The user should feel that the model has **evolved**, not that a new page loaded.

---

# 7. Physics Stage

The physical model is the central teaching object.

For SDOF:

```text
wall
┃
┃  /\/\/\/\/\/\/\/\/──[ 2 kg ]
```

The animation must include meaningful physical features where applicable:

- spring extension/compression,
- displacement,
- velocity direction,
- force arrows,
- equilibrium position,
- damper motion,
- node positions,
- deformation scale.

The stage should feel precise and scientific, not cartoonish.

A subtle measurement/grid field may be used only if it serves as a real positional reference.

---

# 8. State-Linked Visualization

A selected physical or modal state should propagate through the entire interface.

For example, selecting Mode 2 must simultaneously update:

- physical animation,
- mode-shape curve,
- eigenvector values,
- matrix/equation highlights,
- selected mode card,
- relevant graph series,
- nodal indicators.

The selected state should not merely highlight one button.

The entire interface becomes a synchronized representation of the same physical concept.

---

# 9. Equation ↔ Physical Object Linking

Mathematics and geometry must be bidirectionally linked.

Examples:

- Hover/click \(m_1\) in an equation → highlight physical mass \(m_1\).
- Click physical spring \(k_2\) → highlight every matrix term containing \(k_2\).
- Select \(K_{12}=-k_2\) → visually show the coupling spring responsible for this term.
- Select \(x_2\) → highlight DOF 2 on the physical system.

This is a key differentiation from textbook-style modal-analysis tools.

---

# 10. Animated Matrix Assembly

For 2DOF, the stiffness and mass matrices should not simply appear.

The user should be able to watch them being assembled.

```text
Physical system
     ↓
element / spring contributions
     ↓
matrix cells
```

For

\[
K=
\begin{bmatrix}
k_1+k_2 & -k_2 \\
-k_2 & k_2+k_3
\end{bmatrix}
\]

the terms should visually originate from the physical springs.

The user should understand why:

\[
K_{12}=K_{21}=-k_2
\]

rather than memorizing it.

---

# 11. Equation Motion Language

Equations should be **transformed**, not replaced.

Example:

\[
m\ddot{x}+kx=0
\]

then visually:

\[
\ddot{x}+\frac{k}{m}x=0
\]

then:

\[
\ddot{x}+\omega_n^2x=0
\]

then:

\[
\omega_n=\sqrt{\frac{k}{m}}
\]

Terms should move, fade, regroup, or highlight in a way that makes the algebraic transformation understandable.

Educational equation transitions should generally use:

\[
250\text{–}350\text{ ms}
\]

when motion is appropriate.

Do not over-animate simple algebra.

---

# 12. Parameter Controls

Avoid generic form-field presentation.

Use instrument-like sliders.

Example:

```text
MASS

          2.00 kg
────────────●────────────
0.25                    10
```

Controls should support:

- immediate numeric feedback,
- keyboard adjustment,
- direct numeric entry where useful,
- reasonable clamping,
- presets,
- unit visibility,
- optional log-scale ranges where engineering values span orders of magnitude.

Small dependency hints may appear:

\[
m\uparrow \Rightarrow f_n\downarrow
\]

\[
k\uparrow \Rightarrow f_n\uparrow
\]

but the interface should remain visually quiet.

---

# 13. Slider Performance Architecture

Slider interaction must remain extremely responsive.

Do not trigger expensive UI re-renders for every raw pointer event.

Preferred conceptual flow:

```text
pointer events
      ↓
latest parameter value
      ↓
one update per animation frame
      ↓
physics / visualization update
```

For low-DOF systems, exact solutions may update live.

For MDOF, modal calculations may still update live up to the V1 limit if computationally cheap, but must stay off the animation hot path.

Target:

\[
\boxed{\text{input-to-visual latency}<50\text{ ms}}
\]

---

# 14. Animation Architecture

Hard architectural rule:

\[
\boxed{\text{Physics State} \neq \text{Animation State} \neq \text{React UI State}}
\]

Continuous physics animation must **not** be driven by React state updates every frame.

Preferred architecture:

```text
physics parameters
       ↓
derived physical solution
       ↓
single requestAnimationFrame clock
       ↓
SVG / Canvas transforms
```

Use React primarily for:

- parameter selections,
- selected mode,
- active lesson,
- play/pause state,
- user configuration.

Do not call `setState()` at 60 FPS for physical motion.

---

# 15. Single Simulation Clock

All dynamic views must share the same simulation time:

\[
t_{\text{simulation}}
\]

The following must stay synchronized:

- mass position,
- spring deformation,
- damper motion,
- force arrows,
- displacement plot,
- velocity plot,
- phase-space marker,
- energy plot,
- current-time cursor.

Time should be based on real elapsed time:

```text
performance.now()
```

Do not advance the physics by a fixed amount per rendered frame.

Frame drops must not slow down simulated physics.

---

# 16. Playback Controls

All dynamic simulation modules should support:

- Play
- Pause
- Reset
- Step
- playback-speed control

Suggested:

```text
¼×   ½×   1×   2×
```

Important distinction:

\[
\boxed{\text{physical frequency}\neq\text{playback speed}}
\]

For high-frequency modes, such as 169 Hz, the visualization may automatically slow playback while clearly displaying:

> Physical frequency: 169 Hz  
> Playback: 1/50×

Never falsify the reported physical frequency to make the motion visible.

---

# 17. Freeze & Inspect

Pause must become an analytical tool, not just a media control.

When frozen, users should be able to inspect:

\[
x,\quad \dot{x},\quad \ddot{x}
\]

and where relevant:

\[
F_k=-kx
\]

\[
F_c=-c\dot{x}
\]

\[
F_m=m\ddot{x}
\]

The corresponding equation terms should highlight simultaneously.

Example:

```text
← spring force      [mass]      inertial direction →
```

and:

\[
m\ddot{x}+c\dot{x}+kx=0
\]

The user should be able to connect every equation term to a visible physical quantity.

---

# 18. Graph Scrubbing

Plots are not passive images.

The user should be able to drag the current-time marker on:

\[
x(t)
\]

and move the physical system directly to that instant.

Thus:

```text
graph time
   ↕
physical simulation time
```

is bidirectional.

For modal animation, a phase scrubber may expose:

\[
0^\circ,\;45^\circ,\;90^\circ,\ldots
\]

This is particularly useful for understanding in-phase and out-of-phase 2DOF motion.

---

# 19. Response Plots

Plots must visually belong to the physical stage, not appear as disconnected dashboard widgets.

Typical synchronized views:

- \(x(t)\),
- \(\dot{x}(t)\),
- optional \(\ddot{x}(t)\),
- phase space,
- energy,
- mode shape.

For analytical solutions, curves should be precomputed when parameters change.

During animation, only the current-time indicator should need high-frequency movement.

Do not rebuild an entire chart every frame.

---

# 20. Phase-Space Lens

Provide an optional phase-space visualization:

\[
x \text{ vs. } \dot{x}
\]

Expected visual behavior:

### Undamped

Closed trajectory / ellipse.

### Damped

Spiral toward equilibrium.

The phase-space cursor must remain synchronized with the physical system.

This should be available as a **lens**, not forced into the default UI.

---

# 21. Energy Lens

Optional conceptual lens:

\[
T=\frac12m\dot{x}^2
\]

\[
V=\frac12kx^2
\]

\[
E=T+V
\]

In the undamped system:

- kinetic and potential energy exchange,
- total energy remains constant.

With damping:

- total mechanical energy decreases.

This can be represented by:

- a compact stacked energy ribbon,
- synchronized curves,
- subtle object overlays.

The lens must clarify physics rather than decorate the screen.

---

# 22. Concept Lenses

Instead of opening many independent panels, allow the same physical stage to be viewed through conceptual overlays.

Suggested lens set:

```text
Motion
Forces
Energy
Mode Shape
Mathematics
```

The underlying system remains the same.

Only the information layer changes.

This prevents interface fragmentation and improves conceptual continuity.

---

# 23. Mode Shape Animation

For mode \(i\):

\[
x(t)=A_{\text{visual}}\phi_i\sin(\omega_it)
\]

where:

- \(\phi_i\) = eigenvector / mode shape,
- \(\omega_i\) = modal natural frequency,
- \(A_{\text{visual}}\) = visualization-only deformation scale.

The UI must explicitly state that:

> Visualization amplitude is not physical displacement.

Provide a visual scale control:

```text
0.5×   1×   2×   5×
```

without changing the underlying modal frequency.

---

# 24. Mode Transition

Switching modes should not teleport the system.

Preferred transition:

```text
current mode
    ↓
oscillation amplitude approaches zero
    ↓
shape comparison / morph transition
    ↓
new mode begins
```

Approximate transition:

\[
\sim300\text{ ms}
\]

This transition is an interface comparison device, **not a physical simulation**.

---

# 25. Motion Trails / Ghost Configurations

Optionally show a subtle history of previous modal configurations.

Example:

```text
current:     ●
history:   ·   ·   ·
```

Use low-opacity ghost states to communicate motion direction and high-order mode complexity.

Default should remain subtle.

Provide a toggle.

---

# 26. Node / Nodal-Line Visualization

For higher modes, automatically identify approximate nodal positions where:

\[
\phi \approx 0
\]

and indicate them on:

- the physical system,
- the mode-shape plot.

This helps explain why higher modes differ from lower ones.

Label:

> Nodal point — displacement ≈ 0

when educationally useful.

---

# 27. Mode Fingerprints

Each mode may have a compact visual fingerprint generated from its normalized eigenvector.

Example:

```text
MODE 3 · 12.84 Hz
▁▃█▅▂▆
```

The fingerprint should be derived from the actual mode shape, not decorative.

Use it in the MDOF mode browser to make modes visually recognizable.

---

# 28. A/B Comparison Mode

Allow the user to pin a configuration and compare it with a modified system.

Example:

\[
k=500\text{ N/m}
\]

versus:

\[
k=1000\text{ N/m}
\]

Potential comparison presentations:

- ghost overlay,
- split stage,
- frequency delta,
- mode-shape comparison.

The tool should communicate causal changes:

\[
k\uparrow \Rightarrow f_n\uparrow
\]

through simultaneous visual comparison.

This is valuable in Explore mode.

---

# 29. Guided Cinematic Lessons

Learn mode may offer short guided experiments.

Example sequence:

1. “Increase stiffness.”
2. The stiffness slider moves.
3. The physical oscillation changes.
4. \(k\) highlights in the governing equation.
5. \(f_n\) updates.
6. A concise explanation appears.

These sequences must be:

- interruptible,
- pausable,
- skippable,
- user-controllable.

They should behave like interactive experiments, not videos.

---

# 30. Smart Camera / Composition

The stage should automatically adapt as system complexity changes.

Examples:

- SDOF → tightly framed.
- 2DOF → widen smoothly.
- 10DOF → fit all masses while preserving readable scale.
- selected object → subtle contextual emphasis.

Avoid dramatic cinematic camera motion.

The goal is spatial clarity.

---

# 31. Interaction with Mode Shapes

For a selected mode, users should be able to see:

\[
f_i,\quad \omega_i,\quad \phi_i
\]

and switch between:

- physical animation,
- vector representation,
- mode-shape plot.

The same eigenvector should be recognizable in every representation.

For 2DOF:

\[
\phi_1=
\begin{bmatrix}
1\\
0.65
\end{bmatrix}
\]

should visually correspond to both masses moving in the same direction with relative amplitudes 1 and 0.65.

---

# 32. Modal Superposition Interaction

For V1, provide a simple modal superposition explorer:

\[
x(t)=\phi_1q_1(t)+\phi_2q_2(t)
\]

Allow users to modify modal contribution amplitudes:

```text
Mode 1 contribution  ─────●────
Mode 2 contribution  ──●───────
```

Show:

- each individual modal motion,
- resulting combined motion.

This reinforces:

> Modes are the building blocks of structural motion.

---

# 33. Free-Free Final Experience

The Free-Free module should be the visual culmination of V1.

Use a simple 3D/pseudo-3D structure.

Controls:

```text
Tx  Ty  Tz  Rx  Ry  Rz  |  Elastic #1
```

Each rigid-body mode should show:

- rigid translation or rotation,
- no deformation,
- \(f\approx0\).

Elastic #1 should visibly deform.

Core conclusion:

\[
\boxed{\text{3D free-free}\Rightarrow6\text{ rigid-body modes}}
\]

followed by:

\[
\boxed{\text{Mode 7 can be Elastic Mode 1}}
\]

This should be the “everything clicks” moment of the V1 learning journey.

---

# 34. Typography

Use a restrained technical typography system.

### UI text
Clean modern grotesk / sans-serif.

### Numerical values
Monospaced or tabular-number treatment.

Examples:

```text
169.44 Hz
0.0087
[ 1.000 ]
[-0.725 ]
```

### Equations
KaTeX-quality mathematical typesetting.

Large numerical outputs may use stronger hierarchy:

```text
FIRST NATURAL FREQUENCY

169.44 Hz
```

but avoid KPI-dashboard styling.

---

# 35. Color System

Color must primarily encode information.

Use neutral surfaces:

- graphite,
- near-black,
- dark gray,
- off-white,
- muted light surfaces.

Reserve distinct colors for persistent physical categories such as:

- displacement,
- velocity,
- force,
- energy,
- Mode 1,
- Mode 2.

Avoid decorative gradients as the main visual language.

The same physical quantity should use the same visual identity across:

- stage,
- equation,
- graph,
- matrix,
- labels.

---

# 36. Scientific Micro-Details

Premium quality should come from meaningful details.

Examples:

- spring stroke subtly reacts to extension,
- equilibrium position remains visible,
- displacement dimension line appears when inspected,
- velocity vector naturally changes sign through zero,
- force arrows scale smoothly,
- active matrix cells pulse subtly during derivation,
- nodal points remain visually stable,
- selected DOF remains linked across all views.

These should be restrained and technically meaningful.

---

# 37. Keyboard Interaction

Optional power-user layer inspired by Raycast.

Suggested shortcuts when the app has focus:

```text
Space      Play / Pause
← / →      Step phase/time
R          Reset
1–9        Select mode
E          Energy lens
F          Force lens
M          Mathematics lens
```

A command palette may expose these actions.

Keyboard shortcuts must never be required for the primary workflow.

---

# 38. Desktop Window Responsiveness

V1 targets a resizable Windows desktop application, not a mobile website.

Validate at minimum:

- wide desktop window,
- recommended/default window size,
- narrow supported desktop window,
- maximized window,
- Windows DPI scaling at common values.

The Physics Stage remains visually dominant.

As width decreases:
- supporting regions may collapse,
- inspectors may become drawers,
- plots may stack below the stage,
- theory detail may progressively disclose.

Do not preserve a desktop three-column layout if it makes the Physics Stage unreadable.

Avoid page-level horizontal scrolling at the supported minimum window width.

Canvas visualizations must remain crisp under `devicePixelRatio` changes.

# 39. Accessibility and Reduced Motion

Respect `prefers-reduced-motion`.

When motion is reduced:

- mode shapes remain understandable,
- show extreme configurations,
- use arrows and static overlays,
- preserve numerical and graph information.

Reduced motion must not remove the educational content.

All important interactions must work via click/tap and keyboard.

---

# 40. Performance Budget

Hard V1 requirements:

\[
\boxed{60\text{ FPS target}}
\]

Frame budget:

\[
\boxed{<16.7\text{ ms}}
\]

Input-to-visual latency:

\[
\boxed{<50\text{ ms}}
\]

Further constraints:

- one primary `requestAnimationFrame` loop,
- no continuous React-state animation,
- no duplicate RAF loops after route/module changes,
- inactive simulations must stop,
- hidden visualizations must not consume continuous work,
- charts must not be rebuilt every frame,
- eigensolutions must not live on the render hot path,
- resize handling must be throttled/coalesced,
- animation loops must clean up correctly,
- high-DOF rendering should use Canvas/WebGL when SVG DOM becomes expensive.

---

# 41. Rendering Strategy

Suggested V1 approach:

| Content | Rendering |
|---|---|
| SDOF | SVG |
| 2DOF | SVG |
| 3–10 DOF | SVG initially; Canvas fallback if needed |
| equation linking | HTML/SVG |
| mode shape plots | SVG/Canvas |
| response plots | Canvas or optimized SVG |
| future large DOF | Canvas |
| future true 3D FEM | WebGL / Three.js |

Do not use one rendering technology dogmatically.

Choose based on interaction and performance.

---

# 42. Motion Categories

Every motion belongs to one of three classes.

## A. Physics Motion

Driven strictly by physics equations.

No arbitrary UI easing.

Examples:
- mass motion,
- spring motion,
- mode-shape oscillation,
- force vectors.

## B. Interface Motion

Fast, subtle UI transitions.

Typical:

\[
150\text{–}220\text{ ms}
\]

Examples:
- tabs,
- hover feedback,
- controls,
- panel state.

## C. Educational Motion

Slightly slower transformation to help comprehension.

Typical:

\[
250\text{–}350\text{ ms}
\]

Examples:
- equation rearrangement,
- matrix assembly,
- physical-to-mathematical mapping.

This distinction must be explicit in implementation.

---

# 43. V1 Signature Features

The following are considered high-value signature features for V1:

1. **Continuity-first module transitions**
2. **Equation ↔ geometry linking**
3. **Animated matrix assembly**
4. **Graph scrubbing**
5. **Freeze & Inspect**
6. **Energy lens**
7. **Phase-space lens**
8. **Mode fingerprints**
9. **Node / nodal-line visualization**
10. **A/B parameter comparison**
11. **State-linked visualization across the full interface**
12. **Free-Free 6 rigid-body-mode finale**

These features should be prioritized over decorative UI polish.

---

# 44. Quality Gate

The design is not accepted merely because it “looks modern.”

The V1 visual/motion implementation passes only if:

- the physical system is the dominant visual object,
- every important animation has physical or pedagogical meaning,
- sliders feel immediate,
- graph and stage remain synchronized,
- mode switching is smooth,
- equations visually map back to physical components,
- UI does not resemble a generic AI/SaaS dashboard,
- animations remain stable under rapid interaction,
- the user can understand a concept by manipulating it,
- the system remains visually calm even when technically dense.

Final product feeling:

> **A digital laboratory where the mathematics is alive.**
---

# 45. Interaction State Model

Every interactive component must define and visually distinguish the following states where applicable:

- idle,
- hover,
- focus-visible,
- pressed / dragging,
- selected,
- disabled,
- loading / recalculating,
- warning,
- invalid / error.

These states must remain visually restrained and technically legible.

No interaction may rely on hover alone.

Focus-visible styling must be intentionally designed rather than left to browser defaults.

A control should never change geometry substantially between states; avoid layout shift during interaction.

---

# 46. Design Tokens and Visual System

The interface must use a compact, explicit token system instead of ad-hoc styling.

At minimum define:

## Spacing

Use a small consistent spacing scale for:
- inline gaps,
- control spacing,
- panel padding,
- section separation,
- stage margins.

Avoid arbitrary one-off values unless required by visualization geometry.

## Radius

Use very few radius levels:
- small for controls,
- medium for localized surfaces,
- large only for major contained regions when needed.

Do not make every element pill-shaped or heavily rounded.

## Borders

Borders should be:
- subtle,
- low contrast,
- used to communicate containment or measurement,
- absent when spacing alone creates sufficient hierarchy.

## Shadows

Shadows should be rare.

Use them only when conveying real layering:
- floating inspector,
- temporary popover,
- active drag object.

Do not use shadows as default card decoration.

## Typography Scale

Define explicit roles for:
- navigation,
- section labels,
- body text,
- secondary text,
- numerical readouts,
- equations,
- annotations,
- micro-labels.

Use tabular numerals for values that update live to prevent jitter.

---

# 47. Interaction Continuity Policy

Parameter changes during active simulation require deterministic behavior.

The application must explicitly define whether a parameter update:

1. preserves simulation phase,
2. preserves current physical displacement where mathematically meaningful,
3. restarts the solution,
4. transitions to a new solution state.

The user must not see unexplained jumps.

Recommended V1 behavior:

### SDOF / Damped SDOF
When \(m\), \(k\), or \(c\) changes during playback:
- update the derived solution immediately,
- preserve the visible time position where possible,
- avoid fake physical interpolation,
- use only a short visual cross-transition if needed to prevent graphical discontinuity.

### Mode changes
Mode selection may use a UI morph between shapes, but the new modal motion starts from a clearly defined phase.

### Reset
Reset must restore:
- default parameter values,
- default lens,
- simulation time,
- playback rate,
- inspection state,
- temporary comparisons.

---

# 48. Animation Interruption Rules

All interface and educational animations must be interruptible.

If the user:
- drags a slider,
- changes module,
- selects a new mode,
- scrubs time,
- pauses,
- resets,

the currently running transition must stop cleanly and hand control to the new interaction.

There must be:
- no queued stale animations,
- no animation fighting,
- no double transitions,
- no delayed state snap after user input.

Physics animation always yields to direct user interaction.

---

# 49. Easing System

Use a deliberately small easing vocabulary.

## Interface motion
Use fast ease-out curves with low overshoot.

## Educational motion
Use smooth ease-in-out or restrained cubic-bezier transitions to make transformations traceable.

## Physics motion
Never use UI easing.

Do not use bouncy spring easing merely because a motion library offers it.

Overshoot is permitted only when it communicates a real interaction state, not as decorative motion.

---

# 50. Learn / Explore / Solve Experience Modes

V1 should support three conceptual modes of use without creating three separate products.

## Learn

Purpose:
- guided derivations,
- staged explanations,
- highlighted physical relationships,
- optional cinematic experiments.

Default behavior:
- explanations visible,
- parameter ranges constrained to pedagogically useful values,
- transitions emphasize causality.

## Explore

Purpose:
- free manipulation,
- rapid slider interaction,
- A/B comparison,
- concept lenses,
- direct experimentation.

Default behavior:
- fewer explanatory interruptions,
- high responsiveness,
- compact theory panel.

## Solve

Purpose:
- enter system parameters or matrices,
- compute frequencies and mode shapes,
- inspect numerical outputs.

Default behavior:
- denser technical information,
- normalized mode-shape controls,
- numerical residuals and validation information where appropriate.

The three modes must share the same visual language and physics engine.

---

# 51. Direct Manipulation Rules

Where physically meaningful, the user should be able to manipulate the system directly.

Examples:
- drag an SDOF mass to set \(x_0\),
- drag a graph cursor to set time,
- select a mass to inspect its DOF,
- click a spring to focus \(k_i\),
- click a mode-shape node to inspect its amplitude.

If dragging is used, provide a non-drag alternative through sliders or numeric input.

Direct manipulation must use Pointer Events and remain smooth on touch devices.

---

# 52. Numeric Input, Units, and Precision

Engineering values require disciplined formatting.

Rules:

- always show units near values,
- use consistent SI defaults,
- use engineering prefixes where helpful,
- never silently change units,
- avoid excessive decimal places,
- maintain sufficient internal precision independent of display precision,
- use tabular numerals for rapidly updating values.

Examples:

```text
2.00 kg
850 N/m
3.42 Hz
21.49 rad/s
```

For very small or large values, use engineering notation rather than unreadable strings.

Invalid, zero, negative, singular, or physically impossible inputs must show concise inline validation and never propagate NaN/Infinity into graphs or equations.

---

# 53. Matrix and Equation Interaction Standards

Matrices and equations are first-class interactive visualizations.

Matrix cells may expose:
- source physical element,
- sign meaning,
- coupling meaning,
- row / DOF,
- column / DOF.

Hovering or selecting a matrix row should reveal the associated physical DOF.

Equation tokens should have stable semantic identities so highlights persist across derivation steps.

Do not rebuild equations in a way that destroys visual continuity unless mathematically necessary.

---

# 54. Graph Visual Standards

Graphs must use a consistent scientific grammar.

Required behavior where applicable:

- axes labeled with variable and unit,
- zero line visually identifiable,
- current-time cursor persistent,
- selected series clearly differentiated,
- hover/tap inspection,
- no misleading smoothing,
- no decorative area fills that obscure magnitude,
- responsive but stable axis behavior.

Auto-ranging should not cause distracting axis pumping during playback.

Prefer a stable domain during a simulation run.

When parameters change, range transitions may animate briefly if this improves continuity.

---

# 55. Plot Sampling and Numerical Display

Analytical trajectories should be sampled at sufficient resolution for the visible domain.

Sampling density should adapt to:
- frequency,
- time range,
- viewport width.

Avoid:
- undersampled high-frequency curves,
- unnecessary tens of thousands of points,
- recalculating static curves every frame.

For MDOF mode shapes, plotted points must correspond to actual DOFs; interpolation between them is visual only and must not imply additional solved DOFs.

---

# 56. High-DPI and High-Refresh Displays

The application should remain crisp and smooth on modern displays.

Requirements:

- Canvas rendering must account for devicePixelRatio,
- SVG must remain vector-sharp,
- animation timing must not assume exactly 60 Hz,
- 90 Hz / 120 Hz displays should remain naturally smooth,
- physics timing remains based on elapsed time, not frame count.

The performance target is a stable experience, not an artificial 60 FPS lock.

---

# 57. Layout Stability

Interaction must not cause visual reflow or jitter.

Avoid:
- changing text widths from non-tabular live values,
- panels expanding because a number gains digits,
- graph axes shifting every frame,
- control labels moving during drag,
- mode cards changing height on selection.

Reserve space for dynamic values whenever practical.

Cumulative layout shift should be effectively negligible during normal use.

---

# 58. Desktop Stage Priority

When the desktop window becomes constrained, collapse content in this priority order:

1. Physics Stage
2. essential playback controls
3. primary parameters
4. key numerical results
5. plots
6. derivation / theory detail
7. secondary inspectors

The core simulation must never be shrunk until labels and interactive objects become unusable merely to keep every desktop panel visible.

Support Windows scaling and resizable-window behavior as first-class layout constraints.

# 59. Popovers, Tooltips, and Contextual Help

Tooltips are supporting material, not the primary teaching mechanism.

Use them for:
- symbol definitions,
- unit clarification,
- shortcut discovery,
- secondary numerical detail.

Avoid hiding essential explanations behind hover.

Popovers must:
- close predictably,
- not cover critical simulation content where avoidable,
- remain keyboard accessible,
- never create nested floating-card clutter.

---

# 60. Loading and Calculation Feedback

V1 calculations should normally feel immediate.

If any recalculation exceeds the threshold at which latency becomes perceptible:

- keep the previous visualization stable,
- show a subtle local calculating indicator,
- never blank the whole interface,
- never use a full-page spinner for a small modal solve.

The user should always understand whether:
- the current result is updated,
- a new result is being calculated,
- an input is invalid.

---

# 61. Error and Edge-State Design

The application must have intentional states for:

- singular stiffness matrix,
- disconnected DOF,
- zero or negative mass,
- invalid damping,
- repeated/degenerate eigenvalues,
- no elastic modes in the requested range,
- numerical solve failure.

Errors should explain the physical reason where possible.

Example:

> The stiffness matrix is singular. This system contains at least one unconstrained rigid-body motion.

This is preferable to:

> Solver failed.

---

# 62. Degenerate and Near-Degenerate Modes

When two natural frequencies are equal or nearly equal, the UI must avoid presenting solver-dependent eigenvector orientation as a uniquely physical direction.

The interface should communicate that:
- the modal subspace is physically meaningful,
- individual eigenvectors inside a degenerate subspace may rotate or swap numerically.

This is especially important for symmetric systems.

Mode ordering must not visually flicker during tiny parameter changes.

Use stable tracking / matching of modes where practical.

---

# 63. Mode Tracking During Parameter Changes

When parameters change continuously, eigenvalue ordering may swap.

The UI should attempt to preserve perceptual mode identity using mode-shape similarity, not frequency rank alone.

A practical V1 approach may use a Modal Assurance Criterion-like similarity:

\[
MAC(\phi_i,\phi_j)
=
\frac{|\phi_i^T\phi_j|^2}
{(\phi_i^T\phi_i)(\phi_j^T\phi_j)}
\]

or a normalized equivalent suitable for the chosen formulation.

This prevents Mode 1 / Mode 2 cards from visually swapping identities during small slider changes near crossings.

If robust tracking is not implemented in the earliest phase, the limitation must be known and tested.

---

# 64. Theme Strategy

Support light and dark appearance with the same information hierarchy.

Do not design dark mode first and merely invert it.

Both themes must preserve:
- contrast,
- semantic color mapping,
- graph readability,
- equation readability,
- subtle boundary separation.

The accent color should be reserved for interaction and selection rather than filling the whole simulation.

---

# 65. Color Accessibility

Persistent physical categories must remain distinguishable beyond hue alone.

Where needed combine:
- color,
- line style,
- marker shape,
- labels,
- position.

Do not encode Mode 1 vs Mode 2 only through two similar colors.

Charts and equations should remain interpretable for common color-vision deficiencies.

---

# 66. Iconography

Use icons sparingly and consistently.

Prefer:
- simple geometric icons,
- line icons,
- direct physical symbols.

Avoid decorative emoji or mixed icon families.

Text labels should remain primary for technically important actions.

---

# 67. Onboarding and First-Run Experience

The first session should immediately expose the physical system.

Do not begin with a long onboarding carousel.

Recommended first-run sequence:

1. show the SDOF system already moving,
2. expose one obvious slider,
3. invite the user to change stiffness,
4. show the frequency changing,
5. optionally introduce the Learn trajectory.

The user should understand the product by interacting within seconds.

---

# 68. Progressive Disclosure

Technical density should increase with user intent.

Default view:
- physical stage,
- essential controls,
- current equation,
- key result.

Advanced information may expand:
- full derivation,
- matrices,
- normalization details,
- solver residual,
- modal coordinates.

Do not show every possible technical panel simultaneously.

---

# 69. Inspection Persistence

If the user selects:
- a mass,
- spring,
- DOF,
- equation token,
- matrix cell,
- mode,

that selection should remain persistent until:
- the user selects something else,
- dismisses it,
- changes to an incompatible module.

Hover may preview; click/tap establishes persistent inspection.

---

# 70. Visual Debug and Performance Instrumentation

Development builds should include an optional diagnostics overlay showing:

- current FPS,
- average frame time,
- worst recent frame,
- active RAF loops,
- render backend,
- DOF count,
- latest solver duration,
- graph sample count.

This overlay is not part of the default production UI.

It exists to prevent subjective “looks smooth to me” acceptance.

---

# 71. Motion and Performance Regression Tests

Performance must be testable.

Required test scenarios:

- continuous slider drag for 10 seconds,
- rapid mode switching,
- pause/resume repeated many times,
- scrub graph while animation is running,
- switch modules repeatedly,
- resize the window continuously,
- 10DOF mode animation,
- reduced-motion mode,
- background/foreground tab transitions.

Acceptance:
- no duplicate animation loops,
- no progressively increasing CPU usage,
- no growing listener count,
- no obvious dropped-frame bursts under normal V1 load,
- no stale graph or equation state.

---

# 72. Visual Regression Testing

Maintain reference screenshots for core states:

- SDOF default,
- damped underdamped,
- damped critical,
- 2DOF Mode 1,
- 2DOF Mode 2,
- matrix assembly,
- MDOF mode browser,
- Free-Free rigid-body mode,
- Free-Free first elastic mode,
- light theme,
- dark theme,
- narrow mobile layout.

Visual regressions should be reviewed intentionally rather than accepted automatically.

---

# 73. Interaction Regression Testing

Automated or semi-automated checks should verify:

- slider updates numerical output,
- slider updates physical scene,
- graph cursor matches simulation time,
- pause freezes all synchronized views,
- scrub updates scene,
- mode selection updates all linked representations,
- reset restores deterministic defaults,
- keyboard shortcuts work only when appropriate,
- hidden simulations stop consuming animation work.

---

# 74. Component Inventory

V1 should establish reusable primitives rather than custom-building every screen.

Core components likely include:

- `PhysicsStage`
- `ParameterSlider`
- `NumericField`
- `PlaybackBar`
- `LearningTrajectory`
- `ConceptLensSwitcher`
- `EquationDerivation`
- `EquationToken`
- `MatrixView`
- `MatrixCell`
- `ResponsePlot`
- `PhasePlot`
- `EnergyRibbon`
- `ModeBrowser`
- `ModeFingerprint`
- `ModeShapePlot`
- `Inspector`
- `ComparisonTray`
- `InlineValidation`
- `ScientificTooltip`
- `StatusReadout`

The exact framework names may differ, but component responsibility must remain clear.

---

# 75. Visual / Physics Contract

A formal contract must exist between the physics engine and the visual layer.

The visualization receives solved, validated quantities such as:

```text
time
positions
velocities
accelerations
forces
naturalFrequencies
modeShapes
selectedMode
normalization
energies
```

The visualization layer must not independently invent physics.

Likewise, the physics engine must not know about:
- pixel coordinates,
- colors,
- easing curves,
- DOM layout.

This boundary is required for correctness and maintainability.

---

# 76. Animation / UI State Contract

Transient per-frame values should live in refs / animation-owned structures.

Application state should contain semantic state.

Example:

### Semantic application state
```text
selectedMode = 2
mass = 2.0
stiffness = 500
isPlaying = true
playbackRate = 0.5
activeLens = "energy"
```

### Animation state
```text
simulationTime
currentVisualPositions
currentCursorPixel
transitionProgress
```

Do not mix these responsibilities.

---

# 77. V1 Visual Acceptance Review

Before V1 is accepted, perform a dedicated visual review against these questions:

- Does the app still look distinctive with all copy removed?
- Is the Physics Stage unmistakably the center of attention?
- Can a user follow cause → equation → result visually?
- Do transitions preserve object continuity?
- Does the interface remain calm during dense MDOF views?
- Are colors communicating data rather than decorating space?
- Does anything resemble a generic AI dashboard?
- Does any animation exist only because it “looks cool”?
- Can a user pause and inspect the state without visual ambiguity?
- Are equations and matrices genuinely connected to physical objects?
- Does the Free-Free finale visually explain six rigid-body modes without relying on text alone?

If several answers are “no”, visual polish is not complete.

---

# 78. V1 UI / Motion Definition of Done

The UI / motion layer is complete only when:

\[
\boxed{
\text{beautiful}
+
\text{physically truthful}
+
\text{responsive}
+
\text{teachable}
+
\text{distinctive}
}
\]

are simultaneously satisfied.

A visually impressive interface that obscures physics fails.

A technically correct interface that feels static, generic, or difficult to manipulate also fails.

The target is a scientific tool whose visual behavior itself teaches the subject.


---

# 79. Desktop Runtime Motion Requirements

The application runs inside a Tauri 2 Windows desktop shell.

Animation behavior must remain correct during:

- window resize,
- minimize,
- restore,
- display scaling changes,
- movement between monitors,
- high-refresh displays.

Requirements:

- animation time is elapsed-time based,
- minimized/inactive windows do not consume unnecessary continuous work,
- restore never creates duplicate RAF loops,
- high-DPI Canvas rendering remains crisp,
- physics and graph synchronization survives lifecycle transitions.

---

# 80. Desktop Window Composition

The app should feel native to a scientific desktop workflow even though the visualization frontend uses web rendering technology.

Avoid:
- browser-like navigation chrome,
- web-page hero layouts,
- mobile-first stacked-page aesthetics at normal desktop sizes.

A custom title bar may be explored later, but only if it preserves:
- standard Windows minimize/maximize/close behavior,
- drag,
- resize,
- accessibility,
- DPI scaling.

Standard native window chrome is acceptable for V1.

---

# 81. Offline Visual Integrity

All core visual assets required for V1 must be available locally.

Do not depend on runtime CDN access for:
- fonts,
- icons,
- equation rendering,
- animation libraries,
- visualization assets.

The application should look and behave identically when offline.
