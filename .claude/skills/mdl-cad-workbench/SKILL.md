---
name: mdl-cad-workbench
description: Owns Modal Dynamics Studio's CAD/CAE information architecture — Model Browser, Property Manager, viewport, selection, feature/model tree, contextual commands, analysis dock, ViewCube, and Learn/Explore/Inspect progressive disclosure. Use when designing or reviewing the panel layout, navigation structure, or command surface for the CAD Experience R3 redesign (Modal Dynamics Studio), or whenever a proposal risks turning a physics workspace into a generic dashboard, card grid, or SaaS admin shell. Not for visual taste (frontend-design), not for the physical-object-to-equation linking rule (mdl-live-mathematics), and not for 3D rendering technique (mdl-threejs-scientific-viewport).
---

# MDL CAD Workbench

This skill is the domain authority for the *structure* of a CAD/CAE-like screen in Modal Dynamics Studio: what panels exist, where they live, what they contain, and when they may collapse. It does not decide typography, color, or camera behavior — it decides the information architecture those disciplines get applied to.

## Why this exists

Modal Dynamics Lab's own `AGENTS.md` and `ASTRA_SKILL_MATRIX_V1.md` already forbid "a generic AI dashboard" and "a collection of disconnected cards." No public design skill knows what a *non-generic* structural-dynamics CAD/CAE screen looks like — that vocabulary comes from Shapr3D, Fusion 360, SolidWorks, Onshape, ANSYS Discovery, Altair Inspire, COMSOL, and Spline, distilled in `references/CAD_REFERENCES.md`. This skill exists to carry that vocabulary into every CAD-shaped decision without copying any one of those products.

## The non-negotiable shape

A CAD/CAE workbench screen has exactly these regions, and a redesign proposal that collapses them into cards or a dashboard grid fails on sight:

1. **Viewport** — dominant, center-stage, never less than the majority of screen area at any breakpoint down to 900×680. This is where `mdl-live-mathematics` and `mdl-threejs-scientific-viewport` do their work.
2. **Model Browser / feature tree** — a persistent, collapsible left-hand hierarchy of the physical system's structure (masses, springs, dampers, elements, boundary conditions, modes). It is a tree, not a card list, and it mirrors the physics engine's own object graph — never an invented UI-only grouping.
3. **Property Manager** — a persistent or docked right-hand panel that edits the currently selected object's parameters. Selection in the Model Browser, the viewport, and the Property Manager must always agree; there is exactly one selection state, not three.
4. **Equation Dock** — MDL's addition to the classic CAD layout, hosting the live mathematics from `mdl-live-mathematics`. It is not a generic "info panel"; every term shown there must be traceable to the current selection.
5. **Analysis dock** — hosts 2D scientific evidence (`mdl-scientific-visualization`): response plots, FRF, spectra, energy, mode tables. Docked, resizable, and secondary to the viewport, never competing with it for primary screen weight.
6. **Contextual commands** — actions surface next to the selection that needs them (a spring gets stiffness/damping actions; a mode gets normalize/animate actions), not in one undifferentiated global toolbar shared by every mode.

## Progressive disclosure: Learn / Explore / Inspect

Borrow the density discipline of ANSYS Discovery and Altair Inspire rather than SolidWorks' full command-ribbon density on day one:

- **Learn** — the phenomenon and one or two controls are visible; the Model Browser, Property Manager and matrix detail stay collapsed. This is the pedagogy entry point `mdl-pedagogy` owns.
- **Explore** — the Model Browser, Property Manager, and Equation Dock open; parameters become directly manipulable; contextual commands appear per selection.
- **Inspect** — full density: matrix assembly, residuals, mode tables, FRF/PSD, and any diagnostic evidence a validation-minded user (or this project's own test-matrix habit) would want.

A screen must never force a beginner into Inspect density to answer a Learn-level question, and it must never hide Inspect-level evidence behind more than one disclosure step once the user has asked for it.

## ViewCube and ownership boundary

A ViewCube-style orientation control is IA-owned here (its presence, position, and the view states it exposes) but its 3D rendering is `mdl-threejs-scientific-viewport`'s job. If the two disagree, viewport rendering constraints (no free orbit, restrained perspective) win over a literal SolidWorks/Fusion ViewCube copy — adapt the concept, do not import the product.

## Gate

Before approving any CAD-shaped screen proposal, confirm:

- Physics Stage / viewport is still dominant, not reduced to one card among many.
- Model Browser hierarchy mirrors the actual physics object graph, not an invented taxonomy.
- Selection is single-sourced across Model Browser, viewport and Property Manager.
- Progressive disclosure has three honest levels, not a single dense screen with some panels hidden by default.
- No generic SaaS-dashboard tell survives: KPI-style stat tiles standing in for physical quantities, a card grid replacing the tree, a hamburger menu hiding the Model Browser on desktop.

See `references/CAD_REFERENCES.md` for the per-product source material this hierarchy was distilled from, and what was deliberately *not* borrowed from each.
