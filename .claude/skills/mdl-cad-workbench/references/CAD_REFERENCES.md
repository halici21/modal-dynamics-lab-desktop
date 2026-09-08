# CAD / CAE reference study

For each product: what MDL borrows, and what it deliberately does not.

## Shapr3D
Borrow: confident, minimal chrome; direct-manipulation gizmos anchored to the selected geometry; a command surface that appears where the hand already is.
Do not borrow: touch-first sketch-to-solid workflow (MDL has no sketching/solid-modeling authoring step in V1 or the CAD R3 scope as currently authorized).

## Autodesk Fusion 360
Borrow: the browser/timeline tree as the single source of model history; contextual mini-toolbars on selection; the discipline of one Property panel per selection.
Do not borrow: the full ribbon ecosystem (Design/Render/Animation/Simulation workspaces as separate top-level tabs) — MDL's "workspaces" are physics learning modules (SDOF -> Damped SDOF -> 2DOF -> Modes -> MDOF -> Free-Free), not CAD authoring modes, and must not be reskinned as Fusion tabs.

## SolidWorks
Borrow: the FeatureManager tree as literal precedent for the Model Browser; PropertyManager pages as literal precedent for the Property Manager; the principle that the tree is never optional chrome, it is the model.
Do not borrow: ribbon command density on first load — SolidWorks assumes trained users; MDL's Learn density must stay far below this.

## Onshape
Borrow: cloud-simplicity in panel behavior (panels resize and dock predictably, nothing floats unpredictably); a single persistent Feature list even in a browser-constrained layout.
Do not borrow: multi-document tabs / versioning UI — out of V1 and CAD R3 scope; do not add "documents" as a concept prematurely.

## ANSYS Discovery
Borrow: the "instant physics feedback while dragging a parameter" interaction model, which is close to MDL's existing ParameterSlider + live response behavior; a simulation-results dock that stays visually secondary to the 3D/geometry view.
Do not borrow: mesh-authoring UI; Discovery's simulation setup wizard chrome (too many modal steps for MDL's direct-manipulation philosophy).

## Altair Inspire
Borrow: progressive disclosure between a "simplified" and "detailed" mode as literal precedent for Learn/Explore/Inspect; generative-design result browsing as a precedent for comparing mode shapes/parameter variants side by side.
Do not borrow: topology-optimization-specific commands; Inspire's title-heavy toolbars.

## COMSOL Multiphysics
Borrow: the Model Builder tree's discipline of showing exactly the physics that is actually active (no phantom nodes for unused physics) — directly informs "Model Browser mirrors the physics engine's real object graph, never an invented UI taxonomy."
Do not borrow: COMSOL's deep multi-physics coupling UI (electromagnetics, CFD panels) — irrelevant to structural dynamics V1/R3 scope.

## Spline (spline.design)
Borrow: how a lightweight, approachable 3D tool keeps a minimal, confident toolbar and layer panel without feeling like professional CAD, useful precedent for MDL's Learn-density viewport.
Do not borrow: Spline's game-engine-style material/animation timeline UI — MDL has one authoritative simulation clock, not an animation-authoring timeline (see mdl-threejs-scientific-viewport).

## Cross-cutting anti-patterns none of these products exhibit, that MDL must specifically guard against

- A card grid replacing the feature tree (none of the seven references do this).
- KPI-style stat tiles standing in for a physical Property Manager field.
- A hamburger-collapsed navigation on desktop hiding the tree by default (all seven keep the tree visible whenever there is room).
