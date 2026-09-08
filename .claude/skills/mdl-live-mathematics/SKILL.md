---
name: mdl-live-mathematics
description: Owns Modal Dynamics Studio's signature interaction rule — every physical object, force, equation term, matrix entry, and result must stay visibly linked, so touching a spring, mass, or damper in the viewport moves the exact equation term and matrix cell it corresponds to, and vice versa. Use when designing ANY interaction that connects geometry to KaTeX equations, stiffness/mass/damping matrices, or numerical results — coupling springs, DOF selection, matrix assembly animation, mode-shape linking. Not for what the viewport looks like (mdl-threejs-scientific-viewport) or which plot is authoritative evidence (mdl-scientific-visualization).
---

# MDL Live Mathematics

This is the flagship product rule of Modal Dynamics Studio. No public skill covers it because it is not a generic UI pattern — it is a domain-specific contract between the physics engine, the equation renderer, and the viewport, and it is worth protecting more carefully than any visual-polish rule in this project.

## The core chain

```
physical object  <->  force / term it produces  <->  equation term  <->  matrix contribution  <->  result
```

Every one of these five links must be inspectable from any other. Concretely, for a coupling spring `k2` between mass 1 and mass 2 in a 2DOF system:

1. **Physical object**: the spring geometry in the viewport (or its row in the Model Browser).
2. **Force**: the restoring force `k2(x2 - x1)` it exerts, expressed as a physical quantity, not just a symbol.
3. **Equation term**: the `k2` term inside `m1 x1'' + (k1+k2)x1 - k2 x2 = 0` (and its mirrored row for mass 2), rendered live via KaTeX with a stable token identity for `k2` across every place it appears.
4. **Matrix contribution**: exactly which entries of `K` the spring populates — `K[0][0] += k2`, `K[0][1] -= k2`, `K[1][0] -= k2`, `K[1][1] += k2` — highlighted as a set, not as four unrelated cells.
5. **Result**: how that stiffness change moves the natural frequencies / mode shapes, shown through whichever `mdl-scientific-visualization` view is authoritative for that question.

A design that implements fewer than all five links is not "live mathematics," it is decoration. A design that shows the equation but never highlights the corresponding matrix cells, or highlights matrix cells with no route back to the physical spring, fails this skill's gate.

## Interaction rules

- **Selection is bidirectional and single-sourced.** Clicking the spring highlights its equation term and matrix entries. Clicking (or hovering, per the project's existing inspection patterns) the matrix entries highlights the owning spring and its equation term. There is one selection state, shared with `mdl-cad-workbench`'s Property Manager, not three independent highlight systems that can desync.
- **Stable token identity.** The symbol `k2` must resolve to the same rendered token everywhere it appears (equation, matrix legend, Property Manager field, Model Browser row) so a user can track it through a transformation without re-reading. This directly extends `AGENTS.md` section 9 ("Equation & Matrix Interaction... stable token identities").
- **Sign and magnitude both matter.** A coupling term's sign (which off-diagonal entries go negative) is as important to show as its magnitude — do not let an animation only communicate "something changed here" without which direction.
- **No orphaned matrix cells.** Every nonzero cell in an assembled `K` or `M` must trace to at least one physical object; if a redesign proposes a matrix view with cells that do not resolve to a selectable object, that is a defect, not a simplification.
- **Physics never invents itself for the demo.** The equation term and matrix contribution shown must come from the same physics engine call that produces the simulated motion (`AGENTS.md` section 7's "displayed formulas and computed values must come from the same model") — never a separately hand-authored illustrative equation.

## What this skill does not own

- Camera, geometry rendering, and viewport chrome: `mdl-threejs-scientific-viewport`.
- Which 2D plot is the authoritative evidence for a given physical question: `mdl-scientific-visualization`.
- The teaching sequence around when a learner first sees the matrix at all: `mdl-pedagogy` (Learn-density screens may defer matrix exposure; when they do, this skill's five-link chain still applies once the user reaches Explore/Inspect).

## Extending beyond the coupling-spring example

The same five-link chain applies to every V1/R3 physical object type:

- A **damper** links to a `C` matrix contribution and the damping ratio readout.
- A **boundary condition** (fixed/free) links to which rows/columns of `K`/`M` are eliminated or retained, and to the free-free rigid-mode count.
- An **FE element** links to its local stiffness/mass contribution and its assembly location in the global matrices.
- A **mode shape** links backward through the eigenproblem `K*phi = omega^2*M*phi` to the matrices that produced it, not just forward to an animation.

See `references/LIVE_MATH_GRAMMAR.md` for worked examples per V1 module and the specific KaTeX/highlight conventions to reuse from the existing `EquationDerivation` component.
