# CAD Experience R3 — Reference Study

Release: **CAD EXPERIENCE R3** · Product direction: **Modal Dynamics Studio** ·
Tagline: *Interactive Structural Dynamics Workbench*

This document is GATE 2 of the R3 brief. Its purpose is **not** to copy any one
product. It is to establish the vocabulary a structural-dynamics CAD/CAE screen
is allowed to use, so that the R3 shell can be judged against real precedent
rather than against taste.

Two constraints frame everything below:

- `.claude/skills/mdl-cad-workbench/references/CAD_REFERENCES.md` already
  records, per product, what this project may borrow and what it must not. That
  file is the project's standing decision; this study extends it with
  externally sourced detail, it does not overrule it.
- `AGENTS.md` §12 forbids "a generic AI dashboard… a collection of disconnected
  cards… a decorative animation demo". Any borrowed pattern that would produce
  one of those is rejected on sight, however common it is in the reference
  product.

---

## 1. Per-product observations

Each entry records the twelve dimensions the brief asks for (model browser,
viewport, toolbar, selection, property editing, context actions, camera, view
cube, result visualization, panel disclosure, information density, keyboard and
pointer interaction), then what Modal Dynamics Studio takes and refuses.

### 1.1 SolidWorks

| Dimension | Observation |
|---|---|
| Model browser | The **FeatureManager design tree** sits on the left and gives an outline view of the active part/assembly/drawing. It is not optional chrome — it *is* the model. It can be split to show two instances, or combined with the ConfigurationManager / PropertyManager in one Manager Pane. |
| Viewport | The graphics area is **dynamically linked** to the tree: selecting in either pane selects in the other. |
| Toolbar | Full command ribbon; assumes trained users. |
| Selection | Features, sketches, drawing views and construction geometry are all selectable from either pane, with the same identity. |
| Property editing | The **PropertyManager** is a per-command / per-selection page, not a permanent form of every parameter. |
| Context actions | Right-click context menus per tree node and per graphics entity. |
| Camera / view cube | Named standard views plus a view orientation control. |
| Panel disclosure | The **flyout FeatureManager** exists specifically because a PropertyManager page can hide the tree exactly when the user needs to pick something from it — a real, documented workflow defect and its fix. |
| Information density | Very high on first load. |

**Borrow**: tree-as-model; PropertyManager pages keyed to selection; the
dynamic tree ↔ graphics link as the definition of "one selection".
**Refuse**: ribbon density on first load. Modal Dynamics Studio's *Learn*
density must sit far below it.
**Design lesson we act on**: the flyout-FeatureManager problem is a warning.
Our Property Manager must never occlude the Model Browser — they are separate
panes on opposite edges, never stacked in one Manager Pane.

### 1.2 Autodesk Fusion

| Dimension | Observation |
|---|---|
| Model browser | The **Browser** presents design data in a tree, listing components, bodies, sketches, origins, joints and construction geometry, and owns visibility control per object. |
| Toolbar | Workspace-scoped. Choosing a workspace (Design / Simulation / Manufacture / Render …) swaps the toolbar's tab set. |
| Context actions | A **contextual environment** (e.g. Form) replaces the default tabs while active, then restores them on exit. |
| Camera / view cube | The **ViewCube** orbits the design; clicking faces, edges or vertices jumps to that view. A separate **Navigation Bar** holds zoom / pan / orbit plus display settings. |
| Information density | Managed by the workspace split rather than by hiding controls. |

**Borrow**: contextual command groups that replace, rather than add to, the
default set; ViewCube face/edge/corner click-to-reorient; visibility control
living in the tree next to the object it hides.
**Refuse**: workspaces-as-top-level-tabs. Our "workspaces" are *physics
studies* (SDOF → Damped → 2DOF → Modes → MDOF → Free-Free → FE), not authoring
modes, and reskinning them as Fusion tabs would recreate exactly the
browser-tab feel R3 exists to remove.

### 1.3 Shapr3D

| Dimension | Observation |
|---|---|
| Toolbar | An **Adaptive UI**: the user selects the geometry they want to work with and the tool set surfaces itself, so tools are never hunted for. Buttons were re-grouped by measured priority into a part that surfaces dynamically and a part that stays stationary. |
| Panel disclosure | Sidebars (Items, Properties) open from two fixed anchors at the top-left and top-right of the main menu. |
| Information density | Deliberately minimal — the stated principle is that cramming features into long toolbars and menus is no longer acceptable. |

**Borrow**: viewport dominance; selection-first command surfacing; a stationary
minimum command set plus a contextual set that changes with what is selected;
fixed, predictable anchors for panel toggles.
**Refuse**: the touch-first sketch-to-solid authoring flow — Modal Dynamics
Studio has no geometry-authoring step in scope.

### 1.4 Onshape

| Dimension | Observation |
|---|---|
| Model browser | A single persistent **Feature list** (with a rollback bar), kept even in a browser-constrained layout. |
| Selection | Selection is a **toggle** — click to select, click again to deselect, no modifier key needed for multi-select. |
| Context actions | Right-click context menus exist for graphics entities, Feature-list entries, Parts-list entries, drawings and tabs — the same idea applied uniformly. |
| Linking | Hovering a feature highlights the corresponding geometry on the model. |

**Borrow**: hover-to-preview / click-to-commit as two distinct link strengths;
uniform context actions regardless of which surface you started from; the
persistent list that survives a constrained layout.
**Refuse**: multi-document tabs and version history. "Documents" are not a
concept in this product yet and adding them now would be premature.

### 1.5 ANSYS Discovery

| Dimension | Observation |
|---|---|
| Workflow | A single immersive workspace where geometry, physics setup and results live together, rather than a chain of modal setup wizards. |
| Result visualization | Results update **live while a parameter is dragged**; the Explore stage shows results in real time as the model or physics changes. |
| Panel disclosure | The results dock stays visually secondary to the geometry view. |

**Borrow**: parameter-drag → immediate physical feedback (this project already
has it via `ParameterSlider` + `SimulationClock`); results secondary to the
model view; named workflow stages.
**Refuse**: mesh-authoring UI and setup-wizard chrome.

### 1.6 Altair Inspire

| Dimension | Observation |
|---|---|
| Model browser | Shows only the top level of each construction tree by default to keep complex scenes manageable, with a global show/hide toggle at the top of the browser. |
| Density | Ships two profiles (simplified vs. detailed) so the same tool serves concept work and refinement. |
| Toolbar | **Guide bars** centred at the top of the modelling window clarify the workflow of the active tool. |

**Borrow**: the two-profile idea, generalised to our three (Learn / Explore /
Inspect); default-collapsed subtrees so a 10-DOF or FE model does not explode
the browser; a single, quiet workflow hint line rather than tooltips everywhere.
**Refuse**: topology-optimisation commands and title-heavy toolbars.

### 1.7 COMSOL Multiphysics

| Dimension | Observation |
|---|---|
| Model browser | The **Model Builder** tree gives an overview of the model's actual contents. |
| Property editing | Each node has its **own Settings window**; the root node's Settings window describes the model file itself. |
| Result visualization | The **Graphics** window shows geometry, mesh and result plots; a Settings change is reflected there instantly or on an explicit apply. |

**Borrow**: node → Settings-window as a one-to-one relation (our Property
Manager); a tree that shows exactly the physics that is actually active; a root
node that describes the *study*, not just the geometry.
**Refuse**: multiphysics coupling UI for domains we do not model.

### 1.8 Spline

| Dimension | Observation |
|---|---|
| Layout | Four areas: viewport (centre), object hierarchy (left), properties inspector (right), toolbar (top). |
| Camera | Right-drag orbit, middle-drag pan, scroll zoom. |
| Property editing | Selecting an object reveals its properties in the right inspector. |

**Borrow**: the four-area layout as the most legible modern expression of the
CAD grammar; the pointer mapping as a starting hypothesis to be *tested against
WebView2*, not assumed; a confident minimal toolbar that does not feel like
professional CAD.
**Refuse**: the game-engine material/animation-timeline stack. We have one
authoritative simulation clock, not an animation-authoring timeline.

---

## 2. Convergence: what all eight agree on

Independent of styling, every reference product shares five structural facts.
These are treated as *invariants* for R3, not options:

1. **A persistent hierarchy on the leading edge.** Seven of eight call it a
   tree; none replaces it with a card grid, and none hides it behind a
   hamburger on desktop.
2. **A dominant central viewport.** In every product the model view is the
   largest single region at every window size that fits it.
3. **One selection, many surfaces.** Selecting in the tree selects in the
   viewport and populates the property surface. No product maintains three
   independent highlight systems.
4. **Property editing is per-selection, not a permanent form.** SolidWorks
   PropertyManager pages, COMSOL Settings windows, Fusion's per-selection
   panel, Spline's inspector — all are keyed to what is currently selected.
5. **Commands are contextual on top of a small stationary core.** Fusion's
   contextual environments, Shapr3D's Adaptive UI, Onshape's per-entity context
   menus, Inspire's guide bars.

## 3. Divergence: where they disagree, and how we choose

| Question | Camp A | Camp B | Modal Dynamics Studio's answer |
|---|---|---|---|
| First-load density | SolidWorks/COMSOL: high, assume training | Shapr3D/Spline: minimal | **Minimal by default, escalating by request.** Learn is the floor; Inspect reaches SolidWorks-class density but only after the user asks. |
| Camera default | Fusion/Spline: free orbit | Engineering-drawing convention: named orthographic views | **Orthographic named views are the default**; orbit exists but is not the learning path. Measurement honesty beats spatial fun. |
| Where properties live | SolidWorks: same pane as the tree | Spline/Fusion: opposite edge | **Opposite edge.** The flyout-FeatureManager workaround proves the shared-pane approach fails. |
| Panel toggles | Shapr3D: two fixed anchors | Others: scattered | **Fixed anchors**, one per pane, always in the same place. |
| Results | Discovery: live during drag | Classic CAE: solve-then-view | **Live during drag** — the physics engine here is fast enough that a solve is imperceptible. |

## 4. The derived grammar — one coherent product, not a feature union

Everything above collapses into a single sentence:

> **A Modal Dynamics Studio screen is a dominant orthographic viewport of one
> physical system, flanked by a semantic model tree that mirrors the solver's
> object graph and a property surface that shows only what is selected, over a
> dock in which the mathematics of that same selection is derived, assembled
> and evidenced.**

Six rules follow from it and are binding on the R3 implementation:

**R1 — The viewport is the subject.** Target 55–70 % of visual attention at
1440 px. The browser, property manager and dock may never collectively squeeze
it into a minor centre panel.

**R2 — The tree is the model, not the navigation.** It lists springs, masses,
dampers, nodes, elements, constraints, studies, modes and results — things the
physics engine actually instantiates. The numbered `01/02/…` rail is removed as
primary navigation, because a numbered marker is only honest when the content
is a sequence (`frontend-design`), and thirteen physics workspaces are a
*catalogue*, not a stepped process.

**R3 — One semantic selection.** The existing `PhysicalSelection` concept is
extended, not duplicated. Viewport, tree, property manager, equation tokens and
matrix cells all read and write the same selection.

**R4 — Mathematics is a first-class region, not a lens.** Where SolidWorks has
a drawing view and COMSOL has a results plot, this product has the derivation.
It gets its own resizable dock rather than living inside a "Math" tab of a
lens switcher.

**R5 — Commands are contextual over a stationary core.** A small always-present
group (Study / View / Display) plus a set that changes with the selection and
the workspace.

**R6 — 3D for the system, 2D for the evidence.** From
`mdl-scientific-visualization`. The viewport answers *what is moving and how*;
every number is read from a 2D view. Non-negotiable.

## 5. Anti-patterns this study explicitly forbids

Drawn from `mdl-cad-workbench`, `mdl-visual-qa`'s generic-dashboard tendency
test, and `frontend-design`'s calibration list:

- A card grid, KPI stat tiles, or a "metrics row" standing in for physical
  quantities.
- A hamburger hiding the model tree at desktop widths.
- Numbered `01 / 02 / 03` markers on content that is not a sequence.
- ALL-CAPS tracked-out eyebrow labels above every heading.
- Meta strings joined with middle dots (`A · B · C`) as decoration.
- `→` appended to link and button labels.
- Identical rounded cards with one radius and one soft grey shadow everywhere.
- A neon/cyber grid, bloom, or emissive materials in the 3D viewport.
- 3D text meshes for any label a user must read a number from.

## 6. Sources

- [SOLIDWORKS — FeatureManager Design Tree Overview](https://help.solidworks.com/2016/english/solidworks/sldworks/c_featuremanager_design_tree_overview.htm)
- [SOLIDWORKS — Flyout FeatureManager Design Tree](https://help.solidworks.com/2025/english/Solidworks/sldworks/c_flyout_featuremanager_design_tree.htm)
- [SOLIDWORKS — Selecting from the FeatureManager Design Tree](https://help.solidworks.com/2022/English/SolidWorks/sldworks/t_selecting_from_featuremanager.htm)
- [Autodesk — Fusion interface (desktop)](https://help.autodesk.com/view/fusion360/ENU/?guid=GS-THE-FUSION-INTERFACE)
- [Autodesk — How to navigate the Fusion user interface](https://www.autodesk.com/products/fusion-360/blog/how-to-navigate-autodesk-fusion-user-interface-ui/)
- [Shapr3D — Behind the Shapr3D user interface refresh](https://www.shapr3d.com/blog/behind-the-shapr3d-user-interface-refresh)
- [Onshape — User Interface Basics](https://cad.onshape.com/help/Content/Home/user_interface_basics.htm)
- [Onshape — Context Menus](https://cad.onshape.com/help/Content/Home/context_menus.htm)
- [Onshape — Feature and Part Lists](https://cad.onshape.com/help/Content/PartStudio/features_and_parts_lists.htm)
- [Ansys — Discovery product overview](https://ansys.synopsys.com/en-gb/products/3d-design/ansys-discovery)
- [Ansys — About Ansys Discovery (documentation)](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/discovery/UDA/user_manual/general/topics/c_introduction.html)
- [Altair — Inspire 2025.1 release notes](https://help.altair.com/inspire/whatsnew/inspire_2025.1_releasenotes_english.pdf)
- [COMSOL — The Model Builder](https://doc.comsol.com/6.3/doc/com.comsol.help.comsol/comsol_ref_modeling.19.003.html)
- [COMSOL — Settings and Properties Windows for Feature Nodes](https://doc.comsol.com/6.3/doc/com.comsol.help.comsol/comsol_ref_modeling.19.010.html)
- [Spline — Understanding Spline's UI](https://docs.spline.design/basics/understanding-splines-ui)

Project-internal sources: `.claude/skills/mdl-cad-workbench/references/CAD_REFERENCES.md`,
`docs/VISUAL_EXPERIENCE_R2_RENDERER_DECISION.md`, `AGENTS.md`.
