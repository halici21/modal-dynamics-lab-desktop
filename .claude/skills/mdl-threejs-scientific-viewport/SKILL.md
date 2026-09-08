---
name: mdl-threejs-scientific-viewport
description: Owns the project-specific architectural rules for any Three.js viewport in Modal Dynamics Lab / Modal Dynamics Studio — orthographic-first restrained camera, ViewCube-style orientation, one authoritative SimulationClock, no second physics engine driving modal motion, HTML/SVG labels instead of 3D text for critical labels, capped DPR, and disposal discipline. Use whenever a Three.js scene, camera, controls, or the renderer-study prototype boundary (src/visualization/RendererStudy.tsx) is touched or extended, or when evaluating whether a proposed 3D interaction is safe to promote toward production. Generic Three.js technique (geometry, materials, lighting, disposal API details) is owned by threejs-core/camera/geometry/materials/lighting/performance — this skill overrides those on any conflict with the rules below.
---

# MDL Three.js Scientific Viewport

Modal Dynamics Lab's production renderer is SVG (`src/visualization/PhysicsStage.tsx`), decided and recorded in `docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md` after scoring SVG against two Three.js prototypes (2.5D orthographic, spatial perspective). Three.js exists today only inside `src/visualization/RendererStudy.tsx`, a source-owned but non-production prototype boundary. This skill governs how that boundary may be extended for CAD Experience R3 without becoming a second, competing physics/animation stack.

## The invariants (non-negotiable, from AGENTS.md + the renderer decision)

1. **One authoritative SimulationClock.** `RendererStudy.tsx` already proves the pattern: a Three.js scene calls `renderer.render(scene, camera)` from inside the *same* `clock.subscribe(...)` callback that drives the SVG stage — it never runs its own `requestAnimationFrame` loop. Any new Three.js view must subscribe to the existing `SimulationClock`, never instantiate a second one, and never call `renderer.setAnimationLoop` as an independent driver of physics time.
2. **No physics engine owns modal motion.** Object positions in the Three.js scene are set directly from `modalResponse(...).sample(t)` (or the equivalent solver output for the active module) — never from Rapier, Cannon-es, or any rigid-body/game-physics library. Those libraries integrate their own contact/constraint dynamics and will silently diverge from the validated structural-dynamics engine; `AGENTS.md`'s "physics != animation engine" boundary is violated the moment a physics-engine step function, not the solver, decides where a mass sits next frame.
3. **Camera stays restrained.** Default to an orthographic camera for measurement-honest scenes (matches the SVG stage's projection-free reading). A perspective camera is allowed only where depth genuinely improves understanding (MDOF/FEM spatial layouts), and even then keep it a fixed or gently-limited "restrained perspective," per the R2 decision's Prototype C rejection: an uncontrolled free-orbit camera degrades label legibility and minimum-window readability before its depth adds educational value. Full free orbit is a CAD R3 evaluation question, not a default.
4. **ViewCube-style orientation, not a decorative gizmo.** If an orientation control is added, its available view states are `mdl-cad-workbench`'s call; this skill only owns that the control must not let the camera leave the restrained range without an explicit, reversible user action.
5. **Critical labels are HTML/SVG, not 3D text meshes.** Numeric readouts, DOF labels, and equation-linked tokens (`mdl-live-mathematics`) must stay in the DOM (as `RendererStudy.tsx`'s `aria-label` and status line already do) so they remain selectable, accessible, and crisp at any DPI — never baked into `TextGeometry`/sprites where they cannot be inspected, translated, or read by assistive technology.
6. **DPR is capped.** `Math.min(2, window.devicePixelRatio || 1)`, exactly as `RendererStudy.tsx` already does. Do not remove the cap "for sharpness" — it exists for the same multi-monitor/DPI stability `AGENTS.md` section 6 requires everywhere else.
7. **Full lifecycle disposal on every teardown.** Geometry, material, and renderer disposal plus `ResizeObserver.disconnect()` and clock `unsubscribe()` on cleanup — the existing prototype's `cleanup()` closure is the reference implementation. A promoted Three.js view without an equivalent cleanup path is a lifecycle regression per `AGENTS.md` section 10.
8. **No bloom, no neon, no game aesthetic.** `AGENTS.md` section 12's "Kinetic Scientific Instrument" identity applies to 3D exactly as it applies to 2D: no bloom/postprocessing glow, no particle effects, no over-saturated emissive materials standing in for physical meaning.
9. **Selection outlines encode selection, not decoration.** If a mesh needs a selected/hovered state, drive it from the same `PhysicalSelection` state `mdl-live-mathematics` uses — never a separate 3D-only selection system that can desync from the equation/matrix highlight.

## When Three.js may be promoted beyond the prototype boundary

`docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md` explicitly reserves this: "B can be promoted for selected hero scenes after a Tauri/WebView2 GPU gate." Before recommending promotion for CAD Experience R3:

- Re-run (or newly run) a WebView2 GPU capability check on the actual Windows/Tauri target, not just a browser dev server.
- Re-score against the same rubric used in the renderer decision (physical clarity, beauty/depth, pedagogy, performance, maintainability, desktop compatibility, accessibility, MDOF/FEM scalability) rather than assuming the prior SVG-wins verdict still holds once the CAD workbench IA changes the available space.
- Confirm the 2D evidence views (`mdl-scientific-visualization`) remain available and authoritative even where a 3D hero scene is added — 3D is for physical intuition, never a replacement for quantitative evidence.

## Working with the generic Three.js skills

`threejs-core`, `threejs-camera`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, and `threejs-performance` are the correct source for *how* to implement a scene, camera, disposal call, or material correctly. `three-best-practices` is a secondary performance/memory review pass, not an implementation authority. Where any of them suggests something this skill's invariants forbid (an independent render loop, a physics-engine integration, an uncapped DPR, a free-orbit default), this skill wins.

See `references/VIEWPORT_RULES.md` for the line-by-line mapping between these invariants and the existing `RendererStudy.tsx` implementation, useful when extending it rather than replacing it from scratch.
