# Modal Dynamics Lab — Astra Skill Matrix V1

**Purpose:** Define the capability set GPT-6 Astra should explicitly use while implementing Modal Dynamics Lab V1.

This is not a feature list. It is a **competency and routing list**: which specialist capability should own which class of decisions, what it must produce, and how its work is accepted.

---

# 1. Product Architecture

**Owns**
- V1 scope boundaries
- module sequencing
- state ownership
- package/component boundaries
- cross-module contracts

**Must understand**
- SDOF → Damped SDOF → 2DOF → Modes → MDOF → Free-Free learning trajectory

**Outputs**
- architecture map
- module contracts
- dependency graph
- implementation order

**Gate**
- no circular ownership between physics, animation, and UI

---

# 2. Computational Structural Dynamics

**Owns**
- governing equations
- SDOF analytical solutions
- damped regimes
- MDOF equations
- modal interpretation
- free-free rigid-body modes

**Outputs**
- trusted formulas
- reference cases
- physical assumptions
- expected results

**Gate**
- every displayed physical result must trace to a defined equation

---

# 3. Numerical Linear Algebra

**Owns**
- generalized eigenproblem

\[
K\phi=\omega^2M\phi
\]

- eigenvalue sorting
- normalization
- orthogonality checks
- repeated / near-repeated modes
- solver residuals
- mode tracking strategy

**Outputs**
- eigensolver API
- validation residuals
- normalization utilities
- mode-matching utility

**Gate**
- deterministic validated modal results for reference systems

---

# 4. Damping Mathematics

**Owns**
- viscous damping
- damping ratio
- underdamped / critical / overdamped solutions
- damped natural frequency
- V1 damping assumptions

**Gate**
- all three damping regimes transition correctly at boundary conditions

---

# 5. Physics Engine Engineering

**Owns**
- framework-independent physics core
- pure functions
- derived quantities
- unit-safe calculations
- deterministic outputs

**Must not own**
- DOM
- CSS
- easing
- pixel coordinates

**Gate**
- physics can be unit-tested without rendering the app

---

# 6. Real-Time Animation Architecture

**Owns**
- single simulation clock
- `requestAnimationFrame`
- playback speed
- pause/resume/reset
- graph/stage synchronization
- animation interruption
- cleanup

**Rules**
- no physics animation via React state each frame
- no duplicate RAF loops
- time derived from elapsed time

**Gate**
- stable continuous animation under rapid interaction

---

# 7. Performance Engineering

**Owns**
- frame-time profiling
- input latency
- render hot paths
- memory/listener leaks
- SVG/Canvas thresholds
- expensive computation isolation

**Targets**
- 60 FPS-class experience
- <16.7 ms normal frame budget
- <50 ms input-to-visual latency

**Gate**
- performance scenarios pass without progressive degradation

---

# 8. Scientific Visualization

**Owns**
- physical system rendering
- mode-shape plots
- response graphs
- energy visualization
- phase space
- nodal visualization
- force/displacement vectors

**Principle**
- visual encoding must correspond to physical meaning

**Gate**
- no decorative chart element that can be mistaken for physical data

---

# 9. Interaction Design

**Owns**
- slider behavior
- scrubbing
- direct manipulation
- inspection persistence
- A/B comparison
- mode selection
- concept lenses
- touch behavior

**Gate**
- every primary workflow works by click/tap without relying on hover

---

# 10. Motion Design

**Owns**
- interface transitions
- educational transformations
- continuity-first module transitions
- mode morphs
- equation transformations

**Must distinguish**
- physics motion
- interface motion
- educational motion

**Gate**
- no decorative or physically misleading motion

---

# 11. Visual Design System

**Owns**
- typography
- spacing
- color
- radii
- surfaces
- borders
- shadows
- iconography
- light/dark themes
- design tokens

**Direction**
- Kinetic Scientific Instrument

**Gate**
- UI does not resemble a generic AI/SaaS dashboard

---

# 12. Information Architecture

**Owns**
- learning trajectory
- progressive disclosure
- Learn / Explore / Solve modes
- hierarchy of stage / controls / theory / plots
- responsive content priority

**Gate**
- dense technical information remains understandable without card-grid clutter

---

# 13. Educational UX / Pedagogy

**Owns**
- order of explanation
- guided experiments
- causal highlights
- concept linking
- “show before derive” sequencing

**Core rule**
- user sees the physical phenomenon before receiving the most abstract mathematics whenever possible

**Gate**
- each module has explicit learning objectives and a clear conceptual payoff

---

# 14. Equation & Matrix Interaction

**Owns**
- KaTeX rendering
- stable token identities
- equation transformation
- matrix assembly animation
- matrix ↔ geometry links
- DOF highlighting

**Gate**
- equations remain readable and semantically linked during transitions

---

# 15. Responsive Engineering

**Owns**
- desktop/tablet/mobile reflow
- stage priority
- adaptive inspectors
- touch targets
- plot resizing
- compact parameter controls

**Gate**
- no page-level horizontal scrolling at narrow widths
- Physics Stage remains usable

---

# 16. Accessibility

**Owns**
- keyboard navigation
- focus-visible
- ARIA semantics
- reduced-motion mode
- contrast
- non-color encoding
- touch target sizing

**Gate**
- educational meaning survives when animation is reduced

---

# 17. Input Validation & Units

**Owns**
- input parsing
- physical constraints
- unit presentation
- engineering notation
- NaN/Infinity prevention
- singular/invalid system messaging

**Gate**
- no invalid user input can corrupt the simulation state

---

# 18. State Management

**Owns**
- semantic app state
- module state
- selection state
- reset behavior
- comparison state
- UI state persistence within a session

**Must not own**
- 60 FPS transient physics positions

**Gate**
- clear separation between semantic state and animation state

---

# 19. Testing & Verification

**Owns**
- unit tests
- analytical reference tests
- eigensolver tests
- interaction tests
- visual regression
- performance regression
- lifecycle cleanup tests

**Gate**
- no phase is accepted without numerical and interaction validation

---

# 20. Visual QA

**Owns**
- screenshot reviews
- responsive QA
- motion consistency
- hierarchy review
- anti-template review
- light/dark parity

**Gate**
- “technically correct” does not override visible UX defects

---

# 21. Browser Rendering / Graphics

**Owns**
- SVG architecture
- Canvas fallback
- high-DPI handling
- pointer events
- resize behavior
- rendering backend abstraction

**Gate**
- selected renderer remains crisp and performant at target complexity

---

# 22. Frontend Implementation

**Owns**
- React / Next.js / TypeScript integration
- component implementation
- local module composition
- code splitting where useful
- dependency discipline

**Gate**
- implementation follows physics/animation/UI contracts rather than collapsing them into components

---

# 23. Design-System Component Engineering

**Owns**
- reusable primitives such as:
  - ParameterSlider
  - PlaybackBar
  - MatrixView
  - EquationDerivation
  - ModeBrowser
  - ResponsePlot
  - Inspector
  - ConceptLensSwitcher

**Gate**
- repeated interaction patterns use shared primitives and shared tokens

---

# 24. Mode Identity / Degeneracy Handling

**Owns**
- near-degenerate modes
- mode swaps
- stable UI identity under parameter changes
- MAC-like matching if implemented

**Gate**
- small slider changes near mode crossings do not create confusing visual identity flicker

---

# 25. Documentation

**Owns**
- architecture notes
- formulas and assumptions
- component contracts
- visual/motion rules
- test procedures
- known limitations

**Gate**
- future phases can extend V1 without reverse engineering undocumented decisions

---

# Recommended Astra Routing

For each implementation phase, Astra should explicitly route work through the relevant skill set.

## Phase 0 — Foundation
Primary skills:
- Product Architecture
- Visual Design System
- Motion Design
- Real-Time Animation Architecture
- Performance Engineering
- Frontend Implementation
- Accessibility

## Phase 1 — Undamped SDOF
Primary skills:
- Computational Structural Dynamics
- Physics Engine Engineering
- Scientific Visualization
- Interaction Design
- Educational UX
- Testing & Verification

## Phase 2 — Damped SDOF
Primary skills:
- Damping Mathematics
- Physics Engine Engineering
- Scientific Visualization
- Equation & Matrix Interaction
- Testing & Verification

## Phase 3 — 2DOF
Primary skills:
- Computational Structural Dynamics
- Numerical Linear Algebra
- Equation & Matrix Interaction
- Educational UX
- Scientific Visualization

## Phase 4 — Mode Shape Lab
Primary skills:
- Numerical Linear Algebra
- Scientific Visualization
- Motion Design
- Interaction Design
- Mode Identity / Degeneracy Handling

## Phase 5 — MDOF
Primary skills:
- Numerical Linear Algebra
- Physics Engine Engineering
- Performance Engineering
- Scientific Visualization
- Testing & Verification

## Phase 6 — Free-Free
Primary skills:
- Computational Structural Dynamics
- Scientific Visualization
- Educational UX
- Motion Design
- Testing & Verification

## Phase 7 — Polish / Validation
Primary skills:
- Performance Engineering
- Visual QA
- Accessibility
- Responsive Engineering
- Testing & Verification
- Documentation

---

# Astra Execution Rule

Astra should not treat “UI”, “physics”, “animation”, and “testing” as one undifferentiated implementation task.

For every phase:

1. identify the active skill set,
2. state physics assumptions,
3. state interaction behavior,
4. state animation behavior,
5. state performance implications,
6. implement,
7. run numerical tests,
8. run interaction/performance tests,
9. perform visual QA,
10. only then mark the phase complete.

The skill matrix exists to prevent a visually attractive implementation from overriding physical correctness, and to prevent a mathematically correct implementation from becoming an unpolished engineering demo.


---

# 26. Desktop Application Engineering

**Owns**
- Tauri 2 shell
- Windows packaging
- desktop window configuration
- offline-first runtime
- native capability boundaries
- minimize/restore lifecycle
- DPI/multi-monitor validation

**Must understand**
- V1 is not a website
- frontend remains Vite + React + TypeScript
- Rust/native layer should remain minimal until justified

**Gate**
- Tauri dev application launches
- production desktop build succeeds
- core app works offline
- resize/DPI/lifecycle behavior is stable
- no unnecessary native privileges

---

# 27. Tauri Security / Native Boundary

**Owns**
- capability configuration
- command exposure
- future file-dialog boundaries
- least-privilege native access

**Gate**
- no broad filesystem, shell, or network capability without explicit V1 need

---

# Updated Phase 0 Routing

Phase 0 primary skills now include:

- Product Architecture
- Desktop Application Engineering
- Tauri Security / Native Boundary
- Visual Design System
- Motion Design
- Real-Time Animation Architecture
- Performance Engineering
- Frontend Implementation
- Responsive Engineering
- Accessibility
- Testing & Verification

Phase 0 must validate both frontend behavior and the actual Tauri desktop runtime.
