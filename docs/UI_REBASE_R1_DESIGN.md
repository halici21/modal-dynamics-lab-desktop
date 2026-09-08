# UI Rebase R1 — implementation plan and design supplement

## Authority and scope
User explicitly resolved the pasted roadmap conflict: apply R1 on top of existing Phase 2. Preserve both SDOF and Damping. Phase 3 is not authorized. This supersedes the attachment's 'damping not started' acceptance item. Existing physics and animation files are SHA-256 recorded before edits; target byte-identical.

## Concrete preimplementation plan
1. Audit: App owns semantic parameters/selection; original three-column shell and full-width trajectory consume attention. Stage/plot/inspector update refs from one clock.
2. Baseline: validation/r1/before-dark.png shows full content taller than 900px, small oscillator, uppercase and repeated separators. Capture comparison measurements before edits.
3. Reference availability: nine accessible; uida API 404.
4. Reference matrix: see UI_REBASE_R1_REFERENCE_STUDY.md.
5. Licensing/dependencies: one MIT panel dependency; no reference code copied; no new runtime network.
6. Option A: compact rail, two permanent docks, central stage/deck.
7. Option B: compact rail, collapsible parameter dock, inspector on request/selection, central stage/deck.
8. Choice: B. Four reviewed exploration PNGs show permanent columns crushing the experiment at 900px. Static exploration HTML remains isolated in docs/design-reference, never imported in production. Its mock curve is composition-only, not physical evidence.
9. Tokens: retain existing token ownership in src/app/tokens.css; neutral graphite and warm light surfaces, quiet dividers, named control radii/shadow/motion.
10. Typography: system Segoe sans for UI; tabular numerals; mono reserved for dense residuals. Title/sentence case; no global letter spacing.
11. Semantic colors: cyan displacement, violet velocity, orange forces, green energy, neutral mass, cool focus. Labels and line style complement color.
12. Lab Rail: 60px collapsed / 208px expanded, explicit names, selected edge marker; first two modules available, four future modules disabled.
13. Parameter Dock: 270px default, bounded resizing, System / Initial state / Damping / Presets grouping; validated NumericField retained.
14. Workspace: compact contextual title; lens toolbar; large SVG oscillator; readout strip and anchored transport.
15. Inspector: opens on explicit object selection or Inspect; role/value/relationship and grouped freeze quantities. Collapse returns focus to trigger. Avoid frame-driven React state.
16. Analysis Deck: vertical resizable/collapsible panel. Lens determines Energy/Phase/Math detail; retain response scrubbing access without duplicate navigation.
17. shadcn/Radix: conceptual references only, native semantic buttons/details sufficient; no difficult modal mechanism rebuilt.
18. Resizable panels: Group/Panel/Separator; no animation during resize; min/max and keyboard semantics.
19. Motion primitives: no runtime; existing tokenized UI transitions, immediate collapse, no physical easing.
20. Minimum: at <=1100px parameter dock defaults collapsed; inspector is nonmodal overlay; rail expansion overlays; stage and transport keep priority. All panel contents can scroll independently.
21. Performance: before/after same Chromium harness, FPS/intervals/RAF/commits/input/scrub; inspect active subscriptions and playback under resize. Native evidence separately labeled.
22. Accessibility: semantic controls, expanded/controls, visible focus, no hover-only actions, selection text, keyboard splitters, axe both themes.
23. Tests: preserve numerical/lifecycle assertions; migrate selectors only for intentional composition changes. Review new visual baselines manually. Add dock/deck/rail/keyboard/resize/preservation tests. Typecheck, frontend and desktop builds; native launch/offline/window lifecycle.
24. Risks: existing native focus acceptance was blocked; must not label Chromium evidence native. Equation/inspector relocation can alter subscriber counts and stale refs; cover toggles. Both Phase 2 regime details and k=0 controls must fit scrolling dock.

## Frozen-shell overrides
This supplement supersedes VISUAL_MOTION_SPEC_V1 sections 4–5 shell/trajectory examples, uppercase control examples and permanent theory placement. Physics, single-clock, offline, accessibility and motion boundaries are unchanged. Standard Windows chrome remains. Layout is session-only.

## Implemented layout/lifecycle details

Parameter sizing: 250–310px, default 270px, collapsed 0px. Workspace minimum 480px; experiment minimum 280px. Analysis default 240px, minimum expanded 155px, maximum 60%, collapsed 40px header. Phase Space expands to 320px to retain its axes and explanation. At <=1100px the parameter dock closes; initial narrow layout also collapses the deck. Resizing from a larger window retains the user’s deck height, and the collapse control remains available.

Inspector is a nonmodal 310px right overlay, not a third flex column; this preserves the physical drag transform on selection. Escape/close returns focus to Inspect. Its independent scrolling can temporarily cover rightmost workspace controls. This is an intentional tradeoff, not modal focus trapping. Rail expansion overlays at narrow widths. No layout persistence or decorative panel tweening.

Analysis remains mounted behind a visibility context, retaining envelope settings while detaching plot/lens frame subscriptions and ResizeObserver work. The live readout subscribes directly to the unchanged clock. Layout state changes only on user interaction/resize callbacks. Global shortcuts respect splitters and previously handled events. Existing SVG geometry radii remain physical-illustration constants; UI radii/colors are tokenized.
