# V1 / PHASE 1 VERDICT

PASS WITH NOTES — Phase 1 only. Final executable and offline installer built; packaged offline smoke passed.

## 1. V0 regression status
Before edits: 18 unit tests and 12 UI/visual tests passed. After implementation: all 18 original unit tests remain unchanged and green. Eight V0 interaction scenarios were migrated from calibration labels/values to the real oscillator; their lifecycle, validation, reset and synchronization coverage remains. Historical V0 screenshots remain; nine new Phase 1 baselines cover intentional visual changes. No Phase 2 physics.

## 2. What was implemented
Pure analytical undamped SDOF, strict SI input controls and presets, draggable mass–spring stage, natural frequency/period, synchronized response, force/energy/phase-space lenses, freeze inspector, linked equation steps and two guided experiments. Version 0.1.0, offline Tauri 2 + Vite + React + TypeScript.

## 3. Physics model
For m>0 and k>0: m ẍ+kx=0; omega=sqrt(k/m), f=omega/(2pi), T=2pi/omega.
x(t)=x0 cos(omega t)+(v0/omega)sin(omega t).
v(t)=-x0 omega sin(omega t)+v0 cos(omega t).
a=-omega²x; F_s=-kx.
KE=0.5 m v²; PE=0.5 k x²; E=KE+PE; residual=m a+k x.

At k=0, x=x0+v0 t, v=v0, a=F_s=0, omega=f=0 and period=null (no finite oscillation period).

Assume one coordinate, constant positive mass, nonnegative linear stiffness, small displacement, no damping and no forcing. Invalid/nonfinite and numerically unrepresentable inputs are rejected. UI limits and defaults are documented in V1_ARCHITECTURE.md.

## 4. Physics architecture
createSdof(parameters) returns an immutable solution with derived quantities and sample(time). sampleSdof supplies bounded analytical trajectories. Physics has no React, DOM, pixels, easing, clock or Tauri dependency. React owns parameters and educational/selection state; the unchanged clock owns time; SVG/output subscribers own frame rendering. Four active subscribers in Motion, five when energy/phase lens is mounted. Native security capabilities remain unchanged.

## 5. User experience
Four SI sliders/numeric fields control mass, stiffness, initial displacement and velocity. Presets isolate mass/stiffness sensitivity. Parameter edits retain time and explicitly re-evaluate the initial-value problem. Mass drag anchors to the visible position, pauses and sets x0 at t=0; numeric entry is the keyboard alternative. Reset restores deterministic defaults, drafts, lens, selection and teaching state.

Response windows contain four exact periods; periodic playback updates cursor and absolute window-start label without rebuilding the curve. Zero stiffness uses eight-second translation pages. Force arrows preserve physical sign and disclose relative scale. Energy and phase markers sample the same instant as the stage. The inspector exposes t/x/v/a/F_s/KE/PE/E/residual.

KaTeX and fonts are bundled locally. Five user-stepped equations retain m/k/x link tokens, with interruptible 300 ms token rearrangement and reduced-motion fallback. Two guided experiments show k=100→400 and m=1→4 with pause/resume/apply/skip. User input takes control immediately.

## 6. Files created / modified
See [V1_FILES.md](V1_FILES.md) for the full increment inventory and [V1_ARCHITECTURE.md](V1_ARCHITECTURE.md) for contracts and choices. Frozen specifications and AGENTS.md were not modified.

## 7. Numerical validation
All values use SI units. Values below are rounded displays of the full-precision evidence in validation/v1-numerical.json.

| Case | m | k | x0 | v0 | omega (rad/s) | f (Hz) | T (s) | E (J) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A | 1 | 100 | 0.1 | 0 | 10 | 1.5915494309189535 | 0.6283185307179586 | 0.5 |
| B | 4 | 100 | 0.1 | 0 | 5 | 0.7957747154594768 | 1.2566370614359172 | 0.5 |
| C | 2 | 50 | 0.04 | 0.3 | 5 | 0.7957747154594768 | 1.2566370614359172 | 0.13 |

| Case/time | x (m) | v (m/s) | a (m/s²) | residual (N) |
|---|---:|---:|---:|---:|
| A, 0 | 0.1 | 0 | -10 | 0 |
| A, T/4 | 6.123233995736766e-18 | -1 | -6.123233995736766e-16 | 0 |
| A, T/2 | -0.1 | -1.2246467991473532e-16 | 10 | 0 |
| B, 0.2 s | 0.05403023058681398 | -0.42073549240394825 | -1.3507557646703494 | 0 |
| C, 0 | 0.04 | 0.3 | -1 | 0 |
| C, 0.2 s | 0.07210035132319939 | -0.00620350520113741 | -1.8025087830799849 | 0 |
| C, 0.37 s | 0.04665290230553747 | -0.27493211464241385 | -1.1663225576384368 | 0 |

Case A quarter-period KE=0.5 J, PE≈1.875e-33 J. Case C at 0.2 s: KE=0.00003848347678053891 J, PE=0.12996151652321952 J.
An 18,000-sample sweep measured maximum energy error 5.329070518200751e-15 J and residual magnitude 1.4210854715202004e-14 N. Reference tolerance is 1e-10×max(1,|expected|); independent finite-difference velocity/acceleration checks use 1e-8.

## 8. Test results
| Command | Result |
|---|---|
| npm test | 29 passed / 0 failed, four files (18 original + 11 physics/sampling) |
| npm run test:ui | 25 passed / 0 failed (16 interaction/accessibility + 9 visual) |
| npx playwright test visual.spec.ts --update-snapshots | 9 reviewed baselines |
| npm run typecheck | Passed |
| npm run desktop:build | Passed: TypeScript + Vite + native executable + NSIS installer |
| node scripts/validate-sdof.mjs | Three references and 18,000 sweep samples validated |
| node scripts/measure-performance-v1.mjs | Chromium and actual native WebView2 measurements recorded |
| node scripts/measure-scrub-v1.mjs | Chromium/native Phase Space scrub measurements recorded |

For native measurements set MDL_CDP=http://127.0.0.1:9223 in the local test environment. Axe checks reported zero violations for Motion and all four other lenses in both themes (10 state/theme audits). Keyboard, focus-visible, invalid input, reset drafts, reduced motion and emulated device scales 1/1.25/1.5/2 passed. No tests were weakened to accept failures.

## 9. Desktop build
The existing helper builds under the local application-data directory on this host and returns the executable and offline-WebView2 NSIS installer to artifacts. A first output-copy attempt was locked by the old running V0 executable; it was closed normally and subsequent packaging succeeded. Final build passed. Executable: artifacts/modal-dynamics-lab.exe (9818112 bytes). Installer: artifacts/Modal Dynamics Lab_0.1.0_x64-setup.exe (265228808 bytes). Packaged app launched at http://tauri.localhost/ with no development clock API. With WebView2 network disabled, it reloaded bundled scripts/fonts, moved the mass and displayed E=0.5000 J and KaTeX equations. Evidence: validation/production-v1-smoke.json and production-v1-offline.png. These are unsigned local artifacts; a pristine-machine installer execution was not performed.

## 10. Performance
| Measurement | Native Tauri/WebView2 | Chromium |
|---|---:|---:|
| FPS | 164.8805 | 60.0030 |
| Average interval | 6.0650 ms | 16.6658 ms |
| Worst recent interval | 6.90 ms | 16.80 ms |
| Active RAF loops | 1 | 1 |
| React commits during 10 s playback | 0 | 0 |
| Slider input→SVG p95 | 0.40 ms | 0.60 ms |
| Slider next-frame opportunity p95 | 8.10 ms | 17.40 ms |
| Slider next-frame opportunity max | 15.40 ms | 18.40 ms |
| Scrub input→SVG p95 | 0.80 ms | 1.10 ms |
| Scrub input→SVG max | 1.20 ms | 1.70 ms |

Ten-second slider runs: 193 native / 222 Chromium samples. Ten-second phase-lens scrubs: 321 / 281 samples. After 1,000 pause/resume cycles, zero active loops while paused and four Motion subscribers, unchanged from baseline. These are input-to-DOM and next rendering opportunity measurements, not optical monitor latency. Short targeted measurements do not establish multi-hour leak freedom or whole-process CPU usage. See validation/*-v1-performance.json and *-v1-scrub.json.

## 11. Desktop lifecycle
Native default 1440×900 launched. Actual minimum client area measured 901×680: stage width 660 px, playback bottom 631 px, no horizontal overflow. Minimized time remained exactly 6.111500000000018 s and frame count 5020 across the measurement, with zero active loops. Restore returned to one loop and four subscribers. Suspended wall time does not advance physics.

Device-scale emulation at 100%,125%,150%,200% passed. SVG rendering is vector-based; Canvas DPR is not applicable. Actual OS scale switching and physical multi-monitor movement were not tested. Packaged offline reload passed with navigator.onLine=false. The final native window maximized to 1920×1009 without horizontal overflow; evidence is in validation/production-v1-smoke.json.

## 12. Visual QA
Manually reviewed dark/light, narrow native/minimum, reduced motion, force, energy, phase space, linked mathematics and zero stiffness states. Corrected an SVG rail fill artifact, tightened control layout and increased scientific annotation sizes. New baseline screenshots are in tests/visual/v1-*.png. Supporting plots/theory may scroll vertically to preserve stage/playback priority.

## 13. Accessibility
Zero axe violations in tested themes/lenses. Native HTML controls, keyboard range/numeric inputs, visible focus, persistent click/keyboard selection and clear units remain. Reduced motion preserves static extremes, exact current quantities and Step/Scrub. Color is supplemented by text, arrow direction, line weight and position. Screen-reader and physical touch-hardware audits remain unperformed.

## 14. Known limitations
- Physical OS DPI switching/multi-monitor movement, pristine-VM installation, code signing and a long soak were not validated.
- The finite free-translation phase/stage view can be exceeded; this is disclosed, while exact physical values remain visible.
- At the minimum window, supporting plots/theory/results scroll. Long labels wrap within the compact parameter column.
- Educational motion rearranges persistent linked symbols; it is not a full glyph-by-glyph algebra morph.
- KaTeX makes the local JS chunk approximately 504.5 kB (154.2 kB gzip), triggering Vite's advisory 500 kB chunk warning. There is no runtime network dependency.
- Settings remain session-only. Desktop helper retains its historical build-v0 directory name.
- Performance measurements are short, hardware-specific and non-optical.

## 15. Spec deviations
NONE in frozen physics scope, desktop runtime or architecture boundaries. The finite plotting-window and limited token-morph choices are disclosed above; no damping or future module was implemented.

## 16. Phase 2 readiness
Ready to extend the pure solution and synchronized views with Phase 2 — Damped SDOF. Phase 2 was not started. Stop at Phase 1.
