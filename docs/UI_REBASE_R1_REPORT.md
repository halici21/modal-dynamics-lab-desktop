# UI REBASE R1 VERDICT

**PASS WITH NOTES — 0.2.1, 2026-09-06.** R1 is applied to the existing Phase 2 implementation by explicit user instruction. Damped SDOF remains available. Phase 3 is not started.

## 1. Current UI audit
The previous shell competed with the experiment: full-width trajectory, permanently visible theory/inspection, many separators, uppercase microcopy and dominant monospaced numbers. At 1440×900 its full-page capture was 1110px high. The oscillator was too small relative to the controls. See validation/r1/before-dark.png. Existing physics, input validation and ref-based clock subscriptions were sound and retained.

## 2. Reference repositories studied
The complete ten-source availability/adoption/reuse/license matrix is in [REFERENCE_STUDY](UI_REBASE_R1_REFERENCE_STUDY.md). Nine sources were accessible; shadcn-ui/uida returned API 404 and failed web access. The study records the exact depth of inspection, including README-only references. No upstream feature source code was copied. One MIT runtime package was added.

## 3. Layout explorations
Option A kept permanent parameter and inspection docks. Option B uses a collapsible parameter dock with inspection on demand. Both were implemented as isolated static HTML and reviewed at 1440 and 900px. B preserves the experiment at minimum width. Four exploration images: validation/r1/explore-{a,b}-{1440,900}.png. Mock curves in these compositions are not physics evidence.

## 4. Final Scientific Workbench design
A 60px Lab Rail expands to 208px. The 270px parameter dock groups System, Initial state, damping authority/results and presets. A stage-centered workspace owns its lens toolbar, transport, frequency/time strip and live quantities. Selection or Inspect opens a 310px contextual overlay. The vertical Analysis Deck resizes and collapses, with Energy, Phase or Math content controlled by the existing lenses. Response scrubbing stays available in the deck. Future modules are disabled and labeled Planned.

## 5. Visual system changes
Segoe UI sans and tabular numerals replace pervasive mono/uppercase styling. Opaque graphite and warm light surfaces separate work areas without cards or gradients. Quiet one-pixel borders, compact consistent spacing, restrained control radii and explicit focus replace repeated dividers. Cyan encodes displacement, violet velocity, orange force and green energy; labels, outlines and line styles complement color. Static equations remain KaTeX. The tighter SVG viewBox increases physical presence without changing its physical geometry.

## 6. Component / library decisions
react-resizable-panels 4.12.3 supplies bounded keyboard/pointer splitters and collapse behavior, with no declared runtime dependencies. shadcn and Radix informed composition/accessibility but native buttons and existing details suffice; neither package nor Tailwind was added. Motion Primitives was studied but a second animation runtime was unnecessary. Tremor/Recharts, theme editors, Qt and web application architecture were rejected. No command palette was added.

## 7. Architecture impact
All seven physics/animation files are byte-identical to the pre-R1 SHA-256 inventory; see engine-before.json and engine-comparison.json. There is still one authoritative SimulationClock. Workbench owns session-only layout state; AnalysisVisibility removes hidden deck frame subscriptions while retaining envelope/component state. LiveReadout writes exact samples to output refs. React does not receive animation frames. Native event/capability code is unchanged. App keyboard handling now excludes splitters/default-prevented events so resizing cannot step the simulation. Envelope interaction now interrupts guided experiments consistently.

## 8. Files created / modified
See [UI_REBASE_R1_FILES.md](UI_REBASE_R1_FILES.md), including source, tests, evidence, documentation, dependency/version files and deliverables. No Git metadata is available in this directory; the inventory is an explicit task record, not a Git diff.

## 9. Regression tests
- npm test: **39 passed**, five files. Includes analytical IC/force/energy identities, 5832-case damping sweep, clock and lifecycle checks.
- npm run test:ui: **68 passed** in approximately 1.3 minutes: 33 interaction/accessibility/lifecycle checks and 35 visual comparisons.
- npm run build: TypeScript and Vite passed.
- npm run desktop:dev: actual Tauri development launch passed.
- npm run desktop:build: release EXE and NSIS installer generated successfully.
Existing numerical tolerances and assertions were not weakened. Selectors were relocated only where Inspect/Math are now explicitly opened. Old V0/V1/V2 visual baseline PNGs remain; R1 uses new prefixed snapshots. Eight new workbench interaction tests and eleven new workbench visual states cover layout behavior. Initial failures exposed and fixed splitter shortcuts, collapsed-dock accessibility exposure and transient theme contrast; the final complete suite passed.

## 10. Desktop build
artifacts/modal-dynamics-lab.exe and artifacts/Modal Dynamics Lab_0.2.1_x64-setup.exe are the release outputs. The installer includes the existing offline WebView2 installer. A silent per-user installation to %LOCALAPPDATA%/ModalDynamicsLab/qa-r1-install exited **0**, and the installed application launched. Packaged execution at http://tauri.localhost/ was tested with DevTools network emulation offline; local equations/fonts, damping controls and t=0.10 values worked, with no page errors and no production __labClock. This is network emulation of the packaged WebView, not a physically disconnected fresh Windows VM. Final packaging additionally embeds the new MIT notice; application JS/CSS hashes remain unchanged.

## 11. Performance BEFORE vs AFTER
Same Chromium development harness, 1440×900, damping Motion lens, 10 seconds steady playback plus a 10-second slider gesture. Intervals are the clock’s recent 120-frame window; not an optical display measurement.

| Metric | Before | After | Actual WebView2 after |
|---|---:|---:|---:|
| FPS | 60.003 | 60.003 | 164.858 |
| Average frame interval ms | 16.666 | 16.666 | 6.066 |
| Worst recent interval ms | 16.800 | 16.800 | 6.400 |
| Active authoritative RAF | 1 | 1 | 1 |
| React commits during playback | 0 | 0 | 0 |
| Parameter event→SVG p95 ms | 0.700 | 0.900 | 0.600 |
| Parameter maximum ms | 1.600 | 1.900 | 2.100 |
| Next render opportunity p95 ms | 17.500 | 17.300 | 9.000 |
| Graph scrub event→SVG p95 ms | 1.100 | 1.300 | 0.900 |
| Graph scrub maximum ms | 1.600 | 2.300 | 1.700 |

After 1000 play/pause cycles: zero active RAF while paused and four stable subscribers; Phase Space has five. WebView2 follows this machine’s approximately 165Hz refresh, not a fixed 60Hz assumption. A first native attempt was suspended and is retained as native-performance-suspended-attempt.json; its FPS/commits are **invalid for steady-playback comparison**. Activating/restoring then reloading produced the valid native run. No focus/lifecycle code was bypassed. Before/after browser scrub figures are small samples; the final after scrub run overlapped the UI test runner, so sub-millisecond differences are not statistically meaningful. No claim is made about optical latency or a long-duration memory soak.

The JS chunk changed from the historical V2 report’s 514.81kB / 158.20kB gzip to 554.55kB / 171.50kB gzip (approximately +39.74kB / +13.30kB). This includes layout code and UI changes, not just the package. CSS is 48.69kB / 12.92kB gzip. Vite retains its advisory >500kB warning. No runtime network dependency was introduced.

## 12. Responsive/window validation
1440×900 default, 1100×760 intermediate, 900×680 minimum and 1920×1009 maximized client layouts have browser evidence. Actual native default/maximized and **900×680 installed-client dimensions** were exercised, including resizing during playback. Minimum damping controls produced finite exact readouts with no horizontal overflow; collapse Analysis for the largest stage. Native minimum was reached through the Windows system Size menu, without changing app capabilities. Some earlier title-bar/geometry operations were stale or occluded; those captures are not acceptance evidence. Physical DPI was 1; emulated higher DPI is covered by the existing UI test, not a physical multi-monitor test.

For real playing minimize/restore, time remained exactly 0.8827000000s and frame count 2156 while minimized; active RAF=0. After restore, time resumed normally with one RAF and four subscribers (1.1302→1.9429s over the subsequent observation interval). The native-inactive path works even though WebView document.visibilityState remained visible. Evidence: native-lifecycle.json. The previous Phase 2 native-performance/lifecycle evidence gap is resolved for this machine and build; its historical report is not rewritten.

## 13. Visual QA
35 R1 visual comparisons pass. The following **22 final browser captures** were manually reviewed for hierarchy, clipping, labels, color and theme parity:

- tests/visual/r1-sdof-dark.png
- tests/visual/r1-sdof-light.png
- tests/visual/r1-sdof-narrow.png
- tests/visual/r1-sdof-reduced.png
- tests/visual/r1-damping-light.png
- tests/visual/r1-damping-forces.png
- tests/visual/r1-damping-critical.png
- tests/visual/r1-damping-zero.png
- tests/visual/r1-damping-overdamped.png
- tests/visual/r1-damping-energy.png
- tests/visual/r1-damping-phase.png
- tests/visual/r1-damping-math.png
- tests/visual/r1-workbench-mass.png
- tests/visual/r1-workbench-spring.png
- tests/visual/r1-workbench-freeze.png
- tests/visual/r1-workbench-rail-expanded.png
- tests/visual/r1-workbench-parameters-collapsed.png
- tests/visual/r1-workbench-inspector-collapsed.png
- tests/visual/r1-workbench-deck-expanded.png
- tests/visual/r1-workbench-deck-collapsed.png
- tests/visual/r1-workbench-maximized.png
- tests/visual/r1-workbench-intermediate.png

Also reviewed before-dark.png, all four exploration captures, the native default/phase, settled native maximized, native-minimum.png and packaged-offline.png. A clipped phase-axis/note was corrected by expanding Phase Space’s deck to 320px; its two baselines were regenerated and the full suite rerun. Independent dock/deck scrolling is intentional. Native screenshots may include Windows/GPU cursor overlays; these are not product decoration.

## 14. Accessibility
Axe passes both themes and all lenses, including an open inspector and collapsed parameter dock. Collapsed controls are inert/aria-hidden; focus returns to the relevant trigger. Splitters support keyboard sizing without clock shortcuts. Native buttons expose labels, pressed/expanded state and planned-module disablement. No critical action requires hovering. Reduced motion keeps exact frozen state/stepping and immediate panel transitions. Native screen-reader narration and touch hardware were not tested.

## 15. Third-party / licensing notes
See THIRD_PARTY_NOTES and the reference matrix. New package MIT notice is distributed in public/R1_THIRD_PARTY_NOTICES.txt, embedded in dist/Tauri assets, and supplied beside the EXE in artifacts. No restricted Origin experiments or unlicensed Sunumatik source/assets are redistributed. Existing dependencies remain unchanged.

## 16. Known limitations
Inspector is a nonmodal right overlay and can cover workspace controls until closed; this avoids changing the stage coordinate transform at the start of mass dragging. Minimum windows trade visible analysis for stage area; retained expanded deck settings can make the oscillator smaller until collapsed. Layout/theme settings are session-only. This pass did not validate physical multi-monitor/DPI transitions, screen-reader speech, touchscreen hardware, clean-VM installation, signing, SmartScreen reputation or a long-duration soak. The install smoke used an existing Windows/WebView2 machine. The large KaTeX-inclusive chunk warning remains.

## 17. Spec deviations / R1 overrides
Explicit user instruction applies R1 on Phase 2, superseding attachment statements that damping must not have started. The R1 design supplement supersedes frozen shell examples: vertical rail, collapsible docks and lens-dependent analysis replace permanent columns/top trajectory. Physical equations, scope, native runtime and clock boundaries do not change. Existing four undamped system presets and five damping presets remain; no extra teaching scenarios or future modules were added. Inspector overlays rather than reflowing the stage.

## 18. Phase 2 readiness
Phase 2 is already implemented and retained in the redesigned workbench. Its controls, regimes, envelopes, energy/phase/math and experiments pass regression. The redesign is ready for continued use of Phase 2. Phase 3 remains disabled and is not started.

## Final artifact confirmation

The final notice-inclusive installer was installed again with exit code 0. Its embedded /R1_THIRD_PARTY_NOTICES.txt returned HTTP 200 and contained the complete MIT copyright/permission text. With cache disabled and network emulation offline, the installed app reloaded and returned damped x(0.1)=0.0595m; production debug clock remained absent. Final JS asset index-CgNRbHGe.js is identical to the tested application build. Final EXE: 10,145,792 bytes; installer: 265,560,136 bytes. SHA-256 values are in validation/r1/release-artifacts.json. Debug-port QA processes were closed and the installed application was relaunched normally.
