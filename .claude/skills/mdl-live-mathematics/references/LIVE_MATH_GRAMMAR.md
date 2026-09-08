# Live mathematics grammar — conventions already in production

This project already implements the first half of the five-link chain for SDOF. Extend these exact conventions rather than inventing new ones for 2DOF/MDOF/Free-Free/CAD R3.

## Existing conventions to reuse

- `PhysicalSelection` (`src/visualization/PhysicsStage.tsx`) is a small union type — currently `"mass" | "spring" | "damper" | "displacement" | null` — shared between the viewport and `EquationDerivation`. Extend this union per module (e.g. add `"spring-1"`, `"spring-2"`, `"dof-1"`, `"dof-2"` for 2DOF) rather than introducing a parallel selection concept.
- `EquationDerivation.tsx` marks every equation token with `data-token="<id>"` and uses a FLIP animation (`getBoundingClientRect` before/after + Web Animations API) driven by `motion.educationalMs` / `motion.educationalEase` to carry a token smoothly between derivation steps. Matrix-cell and geometry highlighting for 2DOF+ should reuse the same `data-token` id space so one id resolves consistently across the spring geometry, the equation, and the matrix cell.
- KaTeX is already the rendering engine (`katex` + `katex/dist/katex.min.css`); do not introduce a second equation renderer for matrices.
- Reduced-motion is already threaded through as a boolean prop (`reduced`) that disables the FLIP animation but must not remove the link itself — the token still highlights, it simply does not slide.

## Worked example: coupling spring k2 in 2DOF

1. Extend `PhysicalSelection` with a per-spring identity, e.g. `{ kind: "spring"; index: number }` or a string id `"spring-2"`.
2. The viewport spring for k2 gets `data-token="k2"` (or reuses the selection id consistently) so clicking it sets `selected = "spring-2"`.
3. The equation view renders `k_2` inside both the mass-1 and mass-2 equations with `data-token="k2"` on each occurrence, so both light up together — a coupling term affects two equations, and hiding one occurrence is a defect per this skill's SKILL.md gate.
4. The matrix view highlights all four entries the spring populates as one linked set (`K[0][0]`, `K[0][1]`, `K[1][0]`, `K[1][1]`), each tagged with the same token id, not four independent hover targets.
5. The result view (`mdl-scientific-visualization` territory) shows how the current k2 value moves the two natural frequencies — e.g. an FRF or eigenvalue readout that visibly shifts as k2's slider moves, using the same live physics call that drives the animated response.

## Worked example: boundary condition / DOF elimination (Free-Free relevance)

A fixed boundary condition should show as a token on the physical support in the viewport, a struck-through or eliminated row/column in the matrix view (not simply absent with no explanation), and a note in the equation view that the corresponding DOF is constrained. Free-free's `K*phi_RB = 0` rigid modes are the clearest place this chain matters: a user must be able to select a rigid mode's zero eigenvalue and trace it back to "no boundary condition eliminates any row," not just be told "these six modes are rigid" as an unlinked fact.

## Anti-patterns

- An equation that highlights on hover but a matrix that does not (or vice versa) — the chain is bidirectional, not one-directional.
- A matrix visualization drawn from static/illustrative values instead of the live `K`/`M` the solver actually assembled for the current parameters.
- Reusing a `data-token` id for two different physical quantities because the strings happened to collide (e.g. two different `k` symbols in different modules) — namespace token ids per module/instance the same way `PhysicalSelection` is namespaced.
