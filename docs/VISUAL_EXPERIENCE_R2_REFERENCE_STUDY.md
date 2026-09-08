# VISUAL EXPERIENCE R2 — reference study

Date: 8 September 2026. The study informed composition and boundaries; no upstream feature code was copied.

| Source | Accessible | What is useful | What we adopt | What we reject | Code reused / license |
|---|---|---|---|---|---|
| [sunumatik](https://github.com/ayberkdt/sunumatik) | Yes | Deterministic scientific scenes, named phenomena, explicit model limits, local assets and reduced-motion end frames. | Physical referents, deterministic screenshots, local/procedural assets, model labels. | Cinematic mission scale, starfields, particle-heavy scenes and presentation-site navigation. | None. Repository README describes an open local HTML/CSS/JS project; no code copied. |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Yes | Source-owned primitives, restrained composition and accessible component conventions. | Semantic buttons, grouped controls and token ownership. | Stock card grids, default rounded/shadcn appearance and Tailwind runtime. | None. MIT reference; no package installed. |
| [Radix Primitives](https://github.com/radix-ui/primitives) | Yes | Focus behavior, keyboard contracts and composable disclosure patterns. | Native details/buttons where sufficient, explicit focus and keyboardable rail. | Adding a second primitive runtime for controls already covered by HTML. | None. MIT reference; no package installed. |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Yes | Bounded pane sizing and keyboard/pointer separators. | Existing Panel/Group/Separator implementation remains the workbench layout boundary. | New nested panels that squeeze the stage at minimum size. | Existing MIT dependency, no new copy. |
| [motion-primitives](https://github.com/ibelick/motion-primitives) | Yes | Small contextual transitions and presence choreography. | R2 motion tokens and interruptible CSS transitions only. | A second animation runtime or easing physics. | None. MIT reference; no package installed. |
| [tweakcn](https://github.com/jnsahaj/tweakcn) | Yes | Theme token naming and systematic customization. | Central semantic tokens for surfaces, data colors and motion. | Runtime theme editor and generated generic palettes. | None. MIT reference; no package installed. |
| [lunaris](https://github.com/ayberkdt/lunaris) | Yes | Opaque graphite surfaces, data-dense scientific restraint and token discipline. | Opaque workbench chrome, quiet borders, warm light theme and dense but calm tables. | Qt architecture and unrelated astrodynamics domain. | None. Repository license/code was not copied. |
| [Three.js](https://threejs.org/docs/) | Yes | Scene/camera/material abstraction, WebGL compatibility and fixed-camera geometry. | Renderer boundary, fixed camera, procedural masses/springs, local package. | Free orbit, bloom, particles, shader decoration and renderer-owned time. | `three@0.180.0`, MIT, package installed locally. |

Reference URLs were checked on 8 September 2026. `sunumatik` was accessible and its README explicitly describes deterministic, local, model-derived scenes. The reference study does not transfer those domain models into Modal Dynamics Lab.
